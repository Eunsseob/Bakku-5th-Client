import { create } from 'zustand';

import { MOCK_PROFILE } from '@/constants/auth';

type SignupState = {
  profile: typeof MOCK_PROFILE;
  agreedTermIds: string[];
  keywords: string[];
  notificationsEnabled: boolean;
  setProfile: (profile: typeof MOCK_PROFILE) => void;
  toggleTerm: (id: string) => void;
  setAgreedTermIds: (ids: string[]) => void;
  addKeyword: (value: string) => string | null;
  removeKeyword: (value: string) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  reset: () => void;
};

const initialState = () => ({
  profile: { ...MOCK_PROFILE },
  agreedTermIds: [] as string[],
  keywords: [] as string[],
  notificationsEnabled: false,
});

// 가입 단계 사이의 임시 입력값입니다. 앱을 재시작하면 초기화됩니다.
export const useSignupStore = create<SignupState>()((set, get) => ({
  ...initialState(),
  setProfile: (profile) => set({ profile }),
  toggleTerm: (id) =>
    set((state) => ({
      agreedTermIds: state.agreedTermIds.includes(id)
        ? state.agreedTermIds.filter((item) => item !== id)
        : [...state.agreedTermIds, id],
    })),
  setAgreedTermIds: (agreedTermIds) => set({ agreedTermIds }),
  addKeyword: (value) => {
    const keyword = value.trim().replace(/\s+/g, ' ');
    const { keywords } = get();
    if (!keyword) return '키워드를 입력해 주세요.';
    if (keywords.some((item) => item.toLowerCase() === keyword.toLowerCase()))
      return '이미 등록한 키워드예요.';
    if (keywords.length >= 10) return '키워드는 최대 10개까지 등록할 수 있어요.';
    set({ keywords: [...keywords, keyword] });
    return null;
  },
  removeKeyword: (value) =>
    set((state) => ({ keywords: state.keywords.filter((item) => item !== value) })),
  setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
  reset: () => set(initialState()),
}));
