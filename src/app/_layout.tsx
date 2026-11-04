import '../global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { type FontFamilyDefinition, useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { queryClient } from '@/shared/api/queryClient';

SplashScreen.preventAutoHideAsync();

// 'Pretendard' 한 패밀리에 굵기별 파일을 묶어 font-sans + font-bold 처럼 쓸 수 있게 한다.
const PRETENDARD: FontFamilyDefinition[] = [
  {
    fontFamily: 'Pretendard',
    fontDefinitions: [
      { path: require('@/assets/fonts/Pretendard-Regular.otf'), weight: 400, style: 'normal' },
      { path: require('@/assets/fonts/Pretendard-Medium.otf'), weight: 500, style: 'normal' },
      { path: require('@/assets/fonts/Pretendard-SemiBold.otf'), weight: 600, style: 'normal' },
      { path: require('@/assets/fonts/Pretendard-Bold.otf'), weight: 700, style: 'normal' },
    ],
  },
];

export default function RootLayout() {
  const [loaded, error] = useFonts(PRETENDARD);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="(auth)/welcome" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}