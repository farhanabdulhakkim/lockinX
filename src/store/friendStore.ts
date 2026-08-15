import { create } from 'zustand';

interface Friend {
  id: string;
  username: string;
  consistencyScore: number;
  currentStreak: number;
}

interface FriendRequest {
  id: string;
  senderId: string;
  status: string;
}

interface FriendState {
  friends: Friend[];
  requests: FriendRequest[];
  setFriends: (friends: Friend[]) => void;
  setRequests: (requests: FriendRequest[]) => void;
}

export const useFriendStore = create<FriendState>((set) => ({
  friends: [],
  requests: [],
  setFriends: (friends) => set({ friends }),
  setRequests: (requests) => set({ requests }),
}));
