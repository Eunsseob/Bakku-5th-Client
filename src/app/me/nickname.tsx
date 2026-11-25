import { Stack } from 'expo-router';

import { NicknameEditScreen } from '@/features/mypage';

// 탭바가 없는 마이페이지 화면 (Figma 추가 프레임에 탭바 없음)
export default function NicknameEditRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <NicknameEditScreen />
    </>
  );
}
