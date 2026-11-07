import { Stack } from 'expo-router';

import Login from '@/features/auth/components/login';

export default function LoginRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Login />
    </>
  );
}
