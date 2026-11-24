import { Stack } from 'expo-router';

import { WithdrawScreen } from '@/features/mypage';

export default function WithdrawRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <WithdrawScreen />
    </>
  );
}
