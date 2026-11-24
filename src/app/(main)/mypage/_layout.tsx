import { Stack } from 'expo-router';

// 마이 탭 안의 화면들 (G · G-1 설정 · 약관 · 문의 · 차단). 하단 탭바를 그대로 둔다.
// 탈퇴하기(G-1-5)는 탭바가 없어서 src/app/withdraw.tsx 에 있다.
export const unstable_settings = { initialRouteName: 'index' };

export default function MyPageLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
