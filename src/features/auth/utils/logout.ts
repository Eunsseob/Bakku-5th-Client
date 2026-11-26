import { router } from 'expo-router';

import { apiRequest } from '@/shared/api/client';
import { queryClient } from '@/shared/api/queryClient';
import { useAuthStore } from '@/shared/api/useAuthStore';

import { useSignupStore } from '../store/useSignupStore';

/**
 * 로그아웃: 기기 로그인 정보를 지우고 로그인 화면으로 간다.
 * TODO: 리프레시 토큰을 저장하게 되면 AU-4 POST /v1/auth/logout { refreshToken, deviceId } 를 먼저 보낸다.
 * (명세: 서버 요청이 실패해도 기기 로그인 정보는 지우고 로그인 화면으로 간다)
 */
export function logout() {
  const { accessToken, refreshToken, deviceId } = useAuthStore.getState();
  if (refreshToken && deviceId) {
    // 명시적으로 전달한 토큰으로 로그아웃 요청을 보내고 토큰 재발급은 건너뛴다.
    void apiRequest({
      method: 'POST',
      url: '/v1/auth/logout',
      data: { refreshToken, deviceId },
      headers: { Authorization: accessToken ? `Bearer ${accessToken}` : false },
    }).catch(() => undefined);
  }

  clearSessionAndReturnToLogin();
}

export function clearSessionAndReturnToLogin() {
  useAuthStore.getState().clear();
  useSignupStore.getState().reset();
  queryClient.clear();
  if (router.canDismiss()) router.dismissAll();
  router.replace('/(auth)/login');
}
