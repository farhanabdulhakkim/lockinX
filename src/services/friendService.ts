import { db } from './firebase';
import { collection, query, where, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';

// 1. Find a user by their unique code
export const getUserByFriendCode = async (friendCode: string) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('friendCode', '==', friendCode.toUpperCase()));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) throw new Error("No user found with that code.");
  const userData = snapshot.docs[0].data();
  return { id: snapshot.docs[0].id, ...userData };
};

// 2. Send a request
export const sendFriendRequest = async (senderId: string, receiverId: string) => {
  if (senderId === receiverId) throw new Error("You can't lock in with yourself.");
  
  await addDoc(collection(db, 'friendRequests'), {
    senderId,
    receiverId,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  });
};

// 3. Accept a request and create a connection
export const acceptFriendRequest = async (requestId: string, user1Id: string, user2Id: string) => {
  // Mark request as accepted
  const requestRef = doc(db, 'friendRequests', requestId);
  await updateDoc(requestRef, { status: 'ACCEPTED' });

  // Create the official connection so they can see each other's plans
  await addDoc(collection(db, 'connections'), {
    user1: user1Id,
    user2: user2Id,
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  });
};
