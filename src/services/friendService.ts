import { db } from './firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  doc, 
  getDoc,
  updateDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { Friend, FriendRequest } from '../store/friendStore';

// 1. Find a user by their unique code
export const getUserByFriendCode = async (friendCode: string) => {
  const cleanCode = (friendCode || '').trim().toUpperCase();
  if (!cleanCode) throw new Error("Please enter a friend code.");

  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('friendCode', '==', cleanCode));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) throw new Error("No user found with that code.");
  const docSnap = snapshot.docs[0];
  const userData = docSnap.data();
  return { id: docSnap.id, ...userData } as { id: string; username: string; friendCode: string; [key: string]: any };
};

// 2. Send a request (with duplicate & bidirectional check)
export const sendFriendRequest = async (senderId: string, receiverId: string, senderUsername?: string) => {
  if (senderId === receiverId) throw new Error("You can't lock in with yourself.");
  
  // Check if they are already connected
  const connQ1 = query(collection(db, 'connections'), where('user1', '==', senderId), where('user2', '==', receiverId), where('status', '==', 'ACTIVE'));
  const connQ2 = query(collection(db, 'connections'), where('user1', '==', receiverId), where('user2', '==', senderId), where('status', '==', 'ACTIVE'));
  const [connSnap1, connSnap2] = await Promise.all([getDocs(connQ1), getDocs(connQ2)]);

  if (!connSnap1.empty || !connSnap2.empty) {
    throw new Error("You are already locked in with this friend!");
  }

  // Check if sender already has a pending request to receiver
  const pendingOutQ = query(
    collection(db, 'friendRequests'),
    where('senderId', '==', senderId),
    where('receiverId', '==', receiverId),
    where('status', '==', 'PENDING')
  );
  const pendingOutSnap = await getDocs(pendingOutQ);
  if (!pendingOutSnap.empty) {
    throw new Error("Pact request already sent and pending.");
  }

  // Check if receiver already sent sender a pending request -> Auto-accept!
  const pendingInQ = query(
    collection(db, 'friendRequests'),
    where('senderId', '==', receiverId),
    where('receiverId', '==', senderId),
    where('status', '==', 'PENDING')
  );
  const pendingInSnap = await getDocs(pendingInQ);
  if (!pendingInSnap.empty) {
    const existingRequestId = pendingInSnap.docs[0].id;
    await acceptFriendRequest(existingRequestId, receiverId, senderId);
    return { autoAccepted: true };
  }

  // Otherwise, create a new pending request
  await addDoc(collection(db, 'friendRequests'), {
    senderId,
    receiverId,
    senderUsername: senderUsername || 'A locked-in friend',
    status: 'PENDING',
    createdAt: new Date().toISOString()
  });

  return { autoAccepted: false };
};

// 3. Accept a request and create a connection
export const acceptFriendRequest = async (requestId: string, user1Id: string, user2Id: string) => {
  // Mark request as accepted
  const requestRef = doc(db, 'friendRequests', requestId);
  await updateDoc(requestRef, { status: 'ACCEPTED' });

  // Create the official active connection
  await addDoc(collection(db, 'connections'), {
    user1: user1Id,
    user2: user2Id,
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  });
};

// 4. Decline a request
export const declineFriendRequest = async (requestId: string) => {
  const requestRef = doc(db, 'friendRequests', requestId);
  await updateDoc(requestRef, { status: 'DECLINED' });
};

// 5. Real-time listener for incoming friend requests
export const subscribeToFriendRequests = (
  userId: string, 
  onUpdate: (requests: FriendRequest[]) => void
) => {
  const q = query(
    collection(db, 'friendRequests'),
    where('receiverId', '==', userId),
    where('status', '==', 'PENDING')
  );

  return onSnapshot(q, async (snapshot) => {
    const requests = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        let senderUsername = data.senderUsername;
        
        // Fallback: If username was not cached on the request, fetch it
        if (!senderUsername || senderUsername === 'A locked-in friend') {
          try {
            const userSnap = await getDoc(doc(db, 'users', data.senderId));
            if (userSnap.exists()) {
              senderUsername = userSnap.data().username || senderUsername;
            }
          } catch (e) {
            // Ignore error
          }
        }

        return {
          id: docSnap.id,
          senderId: data.senderId,
          receiverId: data.receiverId,
          senderUsername: senderUsername || 'A friend',
          status: data.status,
          createdAt: data.createdAt,
        } as FriendRequest;
      })
    );

    onUpdate(requests);
  });
};

// 6. Real-time listener for active friends (bidirectional connection query)
export const subscribeToFriends = (
  userId: string,
  onUpdate: (friends: Friend[]) => void
) => {
  const connRef = collection(db, 'connections');
  const q1 = query(connRef, where('user1', '==', userId), where('status', '==', 'ACTIVE'));
  const q2 = query(connRef, where('user2', '==', userId), where('status', '==', 'ACTIVE'));

  let friendsMap1: Record<string, string> = {};
  let friendsMap2: Record<string, string> = {};

  const fetchFriendProfiles = async () => {
    const friendUserIds = Array.from(
      new Set([...Object.values(friendsMap1), ...Object.values(friendsMap2)])
    );

    if (friendUserIds.length === 0) {
      onUpdate([]);
      return;
    }

    const friendsList = await Promise.all(
      friendUserIds.map(async (fId) => {
        try {
          const userSnap = await getDoc(doc(db, 'users', fId));
          if (userSnap.exists()) {
            const data = userSnap.data();
            return {
              id: fId,
              username: data.username || 'Friend',
              consistencyScore: data.consistencyScore || 0,
              currentStreak: data.currentStreak || 0,
              friendCode: data.friendCode,
            } as Friend;
          }
        } catch (e) {
          console.error("Error fetching friend profile:", e);
        }
        return {
          id: fId,
          username: 'Locked In Friend',
          consistencyScore: 0,
          currentStreak: 0,
        } as Friend;
      })
    );

    onUpdate(friendsList);
  };

  const unsub1 = onSnapshot(q1, (snap) => {
    friendsMap1 = {};
    snap.docs.forEach((d) => {
      friendsMap1[d.id] = d.data().user2;
    });
    fetchFriendProfiles();
  });

  const unsub2 = onSnapshot(q2, (snap) => {
    friendsMap2 = {};
    snap.docs.forEach((d) => {
      friendsMap2[d.id] = d.data().user1;
    });
    fetchFriendProfiles();
  });

  return () => {
    unsub1();
    unsub2();
  };
};
