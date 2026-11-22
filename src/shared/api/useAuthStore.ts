import { create } from 'zustand';

export type AuthTokens = { accessToken: string; refreshToken: string };

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  sessionId: number;
  setTokens: (tokens: AuthTokens) => void;
  rotateTokens: (tokens: AuthTokens, sessionId: number) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  refreshToken: null,
  sessionId: 0,
  setTokens: (tokens) => set((state) => ({ ...tokens, sessionId: state.sessionId + 1 })),
  rotateTokens: (tokens, sessionId) =>
    set((state) => (state.sessionId === sessionId ? tokens : state)),
  clear: () =>
    set((state) => ({ accessToken: null, refreshToken: null, sessionId: state.sessionId + 1 })),
}));
