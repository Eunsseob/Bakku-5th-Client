import { create } from 'zustand';

type AuthState = {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: __DEV__ ? process.env.EXPO_PUBLIC_DEV_ACCESS_TOKEN?.trim() || null : null,
  setAccessToken: (accessToken) => set({ accessToken }),
  clear: () => set({ accessToken: null }),
}));
