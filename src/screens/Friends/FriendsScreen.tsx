import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, Alert } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useFriendStore } from '../../store/friendStore';
import { getUserByFriendCode, sendFriendRequest } from '../../services/friendService';
import CustomButton from '../../components/CustomButton';
import PulseNode from '../../components/PulseNode';

export default function FriendsScreen() {
  // Local state for the search bar
  const [searchCode, setSearchCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  const user = useAuthStore((state) => state.user);
  const { friends, requests } = useFriendStore();

  const handleAddFriend = async () => {
    if (!searchCode || !user) return;
    setLoading(true);
    try {
      const friendData = await getUserByFriendCode(searchCode);
      await sendFriendRequest(user.uid, friendData.id);
      Alert.alert("Success", `Pact request sent to ${friendData.username}!`);
      setSearchCode('');
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Circle</Text>
      
      <View style={{ alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 24, marginBottom: 24 }}>
        {user && (
          <PulseNode 
            username={user.username || "YOU"} 
            streak={friends.length > 0 ? friends[0].currentStreak : 0}
          />
        )}
      </View>

      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.input} 
          placeholder="Enter Friend Code (e.g. FARHAN-8K2P)" 
          placeholderTextColor="#666" 
          value={searchCode} 
          onChangeText={setSearchCode} 
          autoCapitalize="characters"
        />
        <CustomButton title="ADD FRIEND" onPress={handleAddFriend} loading={loading} />
      </View>

      <Text style={styles.subHeader}>Locked In Friends ({friends.length})</Text>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.friendCard}>
            <Text style={styles.friendName}>{item.username}</Text>
            <Text style={styles.stats}>🔥 {item.currentStreak} | ⭐ {item.consistencyScore}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>You have no friends in your circle yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 24, paddingTop: 60 },
  header: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginBottom: 24 },
  subHeader: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 32, marginBottom: 16 },
  searchContainer: { paddingBottom: 24 },
  input: { backgroundColor: '#111', color: '#fff', padding: 16, borderRadius: 8, fontSize: 16, borderWidth: 1, borderColor: '#333' },
  friendCard: { backgroundColor: '#111', padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#333', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  friendName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  stats: { color: '#4ade80', fontSize: 16, fontWeight: 'bold' },
  emptyText: { color: '#666', fontStyle: 'italic' }
});
