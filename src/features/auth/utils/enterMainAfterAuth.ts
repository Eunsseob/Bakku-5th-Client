import { router } from 'expo-router';

export function enterMainAfterAuth(destination: 'home' | 'write' = 'home') {
  // 가입 화면을 뒤로가기 기록에서 제거한다.
  if (router.canDismiss()) router.dismissAll();
  router.replace(destination === 'write' ? '/(main)/(post-create)/write' : '/(main)/home');
}
