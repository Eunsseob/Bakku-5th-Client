import { Stack } from 'expo-router';

// 작성 화면을 기본 진입점으로 설정
export const unstable_settings = { initialRouteName: 'write' };

export default function PostCreateLayout() {
  return (
    // 작성 → 태그 선택을 스택으로 연결하고 기본 헤더는 숨김
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="write" />
      <Stack.Screen name="write-tags" />
    </Stack>
  );
}
