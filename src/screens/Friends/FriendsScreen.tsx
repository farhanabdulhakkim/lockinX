import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  Share, 
  ActivityIndicator 
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useFriendStore, FriendRequest } from '../../store/friendStore';
import { 
  getUserByFriendCode, 
  sendFriendRequest, 
  acceptFriendRequest, 
  declineFriendRequest,
  subscribeToFriendRequests, 
  subscribeToFriends 
} from '../../services/friendService';
import CustomButton from '../../components/CustomButton';
import PulseNode from '../../components/PulseNode';

export default function FriendsScreen() {
  const [searchCode, setSearchCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const user = useAuthStore((state) => state.user);
  const { friends, requests, setFriends, setRequests } = useFriendStore();

  // Subscribe to incoming friend requests & active friends
  useEffect(() => {
    if (!user?.uid) return;

    const unsubRequests = subscribeToFriendRequests(user.uid, (incoming) => {
      setRequests(incoming);
    });

    const unsubFriends = subscribeToFriends(user.uid, (activeFriends) => {
      setFriends(activeFriends);
    });

    return () => {
      unsubRequests();
      unsubFriends();
    };
  }, [user?.uid]);

  const handleShareCode = async () => {
    if (!user?.friendCode) return;
    try {
      await Share.share({
        message: `Lock in with me on Lockin! My Friend Code is: ${user.friendCode}`,
      });
    } catch (e: any) {
      Alert.alert("Your Friend Code", user.friendCode);
    }
  };

  const handleAddFriend = async () => {
    const trimmed = searchCode.trim().toUpperCase();
    if (!trimmed || !user) return;
    setLoading(true);
    try {
      const friendData = await getUserByFriendCode(trimmed);
      const result = await sendFriendRequest(user.uid, friendData.id, user.username);
      
      if (result.autoAccepted) {
        Alert.alert("Locked In!", `You and ${friendData.username} are now connected! 🔥`);
      } else {
        Alert.alert("Success", `Pact request sent to ${friendData.username}!`);
      }
      setSearchCode('');
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (request: FriendRequest) => {
    if (!user) return;
    setActionLoading(request.id);
    try {
      await acceptFriendRequest(request.id, request.senderId, user.uid);
      Alert.alert("Pact Locked!", `You and ${request.senderUsername} are now in a pact! 🔥`);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineRequest = async (request: FriendRequest) => {
    setActionLoading(request.id);
    try {
      await declineFriendRequest(request.id);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const renderHeader = () => (
    <View>
      <Text style={styles.header}>Your Circle</Text>
      
      {/* Current User Streak / Avatar */}
      <View style={styles.pulseContainer}>
        {user && (
          <PulseNode 
            username={user.username || "YOU"} 
            streak={user.currentStreak || 0}
          />
        )}
      </View>

      {/* Current User's Own Friend Code Card */}
      <View style={styles.myCodeCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.myCodeLabel}>YOUR FRIEND CODE</Text>
          <Text style={styles.myCodeValue}>{user?.friendCode || 'Generating...'}</Text>
        </View>
        <TouchableOpacity 
          style={styles.shareBtn} 
          onPress={handleShareCode}
          disabled={!user?.friendCode}
        >
          <Text style={styles.shareBtnText}>SHARE</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Add Friend Input */}
      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.input} 
          placeholder="Enter Friend Code (e.g. FARHAN-8K2P)" 
          placeholderTextColor="#666" 
          value={searchCode} 
          onChangeText={setSearchCode} 
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <CustomButton title="ADD FRIEND" onPress={handleAddFriend} loading={loading} />
      </View>

      {/* Pending Incoming Requests Section */}
      {requests.length > 0 && (
        <View style={styles.requestsSection}>
          <Text style={styles.sectionHeader}>Incoming Requests ({requests.length})</Text>
          {requests.map((req) => (
            <View key={req.id} style={styles.requestCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.requestSender}>{req.senderUsername}</Text>
                <Text style={styles.requestSub}>wants to lock in with you</Text>
              </View>
              
              <View style={styles.requestActions}>
                <TouchableOpacity 
                  style={styles.acceptBtn} 
                  onPress={() => handleAcceptRequest(req)}
                  disabled={actionLoading === req.id}
                >
                  {actionLoading === req.id ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Text style={styles.acceptBtnText}>ACCEPT</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.declineBtn} 
                  onPress={() => handleDeclineRequest(req)}
                  disabled={actionLoading === req.id}
                >
                  <Text style={styles.declineBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.sectionHeader}>Locked In Friends ({friends.length})</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <View style={styles.friendCard}>
            <View>
              <Text style={styles.friendName}>{item.username}</Text>
              {item.friendCode ? <Text style={styles.friendCodeTag}>#{item.friendCode}</Text> : null}
            </View>
            <Text style={styles.stats}>🔥 {item.currentStreak} | ⭐ {item.consistencyScore}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>You have no friends in your circle yet. Share your code to lock in!</Text>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingHorizontal: 24, paddingTop: 60 },
  header: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
  pulseContainer: { alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#222', paddingBottom: 24, marginBottom: 20 },
  
  // My Code Card
  myCodeCard: { 
    backgroundColor: '#111', 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#333', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: 20 
  },
  myCodeLabel: { color: '#888', fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
  myCodeValue: { color: '#4ade80', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  shareBtn: { backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  shareBtnText: { color: '#000', fontWeight: 'bold', fontSize: 12 },

  // Search
  searchContainer: { marginBottom: 24 },
  input: { 
    backgroundColor: '#111', 
    color: '#fff', 
    padding: 16, 
    borderRadius: 8, 
    fontSize: 16, 
    borderWidth: 1, 
    borderColor: '#333',
    marginBottom: 12 
  },

  // Sections
  sectionHeader: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 12, marginBottom: 12 },
  
  // Requests
  requestsSection: { marginBottom: 24 },
  requestCard: { 
    backgroundColor: '#161616', 
    padding: 14, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#2a2a2a', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: 10 
  },
  requestSender: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  requestSub: { color: '#888', fontSize: 13, marginTop: 2 },
  requestActions: { flexDirection: 'row', alignItems: 'center' },
  acceptBtn: { backgroundColor: '#4ade80', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginRight: 8 },
  acceptBtnText: { color: '#000', fontWeight: 'bold', fontSize: 12 },
  declineBtn: { backgroundColor: '#222', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#444' },
  declineBtnText: { color: '#bbb', fontWeight: 'bold', fontSize: 14 },

  // Friends List
  friendCard: { 
    backgroundColor: '#111', 
    padding: 16, 
    borderRadius: 8, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#222', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  friendName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  friendCodeTag: { color: '#666', fontSize: 12, marginTop: 2 },
  stats: { color: '#4ade80', fontSize: 15, fontWeight: 'bold' },
  emptyText: { color: '#666', fontStyle: 'italic', textAlign: 'center', marginTop: 20 }
});
