import { router } from 'expo-router';

import { useAuthStore } from '@/shared/api/useAuthStore';

import { useSignupStore } from '../store/useSignupStore';

/**
 * 로그아웃: 기기 로그인 정보를 지우고 로그인 화면으로 간다.
 * TODO: 리프레시 토큰을 저장하게 되면 AU-4 POST /api/v1/auth/logout { refreshToken, deviceId } 를 먼저 보낸다.
 * (명세: 서버 요청이 실패해도 기기 로그인 정보는 지우고 로그인 화면으로 간다)
 */
export function logout() {
  useAuthStore.getState().clear();
  useSignupStore.getState().reset();
  if (router.canDismiss()) router.dismissAll();
  router.replace('/(auth)/login');
}
