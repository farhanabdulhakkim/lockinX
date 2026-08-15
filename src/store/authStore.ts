import { create } from 'zustand';

interface AuthState {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: any) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
}));
