import '../global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { SplashScreen, Stack } from 'expo-router';

import { queryClient } from '@/shared/api/queryClient';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    // 스플래쉬
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="(auth)/welcome" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}
