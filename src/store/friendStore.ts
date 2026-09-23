import { create } from 'zustand';

export interface Friend {
  id: string;
  username: string;
  consistencyScore: number;
  currentStreak: number;
  friendCode?: string;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId?: string;
  senderUsername?: string;
  status: string;
  createdAt?: string;
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
