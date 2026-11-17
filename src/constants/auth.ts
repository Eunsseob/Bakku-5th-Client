// 개발 모드에서만 사용합니다. 실제 로그인 테스트 시 환경변수를 false로 설정하세요.
export const USE_MOCK_AUTH = __DEV__ && process.env.EXPO_PUBLIC_USE_MOCK_AUTH !== 'false';

export const MOCK_PROFILE = {
  nickname: '',
  introduction: '',
  birthDate: '',
  gender: undefined as 'male' | 'female' | null | undefined,
};

export const GENDER_OPTIONS = [
  { value: 'female', label: '여성' },
  { value: 'male', label: '남성' },
  { value: null, label: '선택 안 함' },
] as const;

export const SIGNUP_TERMS = [
  { id: 'age', title: '만 14세 이상입니다', required: true },
  { id: 'service', title: '서비스 이용약관', required: true },
  { id: 'privacy', title: '개인정보 수집 · 이용', required: true },
  { id: 'marketing', title: '이벤트 · 혜택 알림', required: false },
];

export const MOCK_WISHLIST = [
  { id: '1', name: '캐릭터 키링' },
  { id: '2', name: '랜덤 피규어' },
  { id: '3', name: '인형' },
  { id: '4', name: '포토카드' },
];

export const ONBOARDING_DATA = [
  {
    id: '1',
    title: '뽑기 운이 없어도 괜찮아요',
    description: '가챠, 랜덤박스, 팝업 굿즈에서\n나온 굿즈를 원하는 굿즈로 바꿔보세요',
  },
  {
    id: '2',
    title: '내가 가진 건, 누군가 찾던 것',
    description: '내가 가진 굿즈와 원하는 굿즈를 등록하고\n딱 맞는 상대를 찾아요',
  },
  {
    id: '3',
    title: '택배 말고, 현장에서 바로',
    description: '근처에 있는 교환 상대를 확인하고\n현장에서 바로 만나요',
  },
];
