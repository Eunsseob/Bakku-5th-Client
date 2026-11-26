import { create } from 'zustand';

export type AuthTokens = { accessToken: string; refreshToken: string };

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  deviceId: string | null;
  sessionId: number;
  setTokens: (tokens: AuthTokens, deviceId: string) => void;
  rotateTokens: (tokens: AuthTokens, sessionId: number) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  refreshToken: null,
  deviceId: null,
  sessionId: 0,
  setTokens: (tokens, deviceId) =>
    set((state) => ({ ...tokens, deviceId, sessionId: state.sessionId + 1 })),
  rotateTokens: (tokens, sessionId) =>
    set((state) => (state.sessionId === sessionId ? tokens : state)),
  clear: () =>
    set((state) => ({
      accessToken: null,
      refreshToken: null,
      deviceId: null,
      sessionId: state.sessionId + 1,
    })),
}));
