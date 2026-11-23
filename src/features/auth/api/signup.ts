import { isAxiosError } from 'axios';

import { apiRequest } from '@/shared/api/client';
import type { AuthTokens } from '@/shared/api/useAuthStore';
import type { Agreement } from './terms';

export async function completeSignup(payload: {
  signupToken: string;
  deviceId: string;
  agreements: Agreement[];
  nickname: string;
  birthDate: string;
  gender: 'FEMALE' | 'MALE' | null;
}) {
  try {
    const { data } = await apiRequest<{
      success?: boolean;
      message?: string;
      data?: AuthTokens;
    }>({ method: 'POST', url: '/v1/auth/signup', data: payload }, { auth: false });

    if (data?.success === false) throw new Error(data.message || '가입을 완료하지 못했어요.');
    if (!data?.data?.accessToken || !data.data.refreshToken) {
      throw new Error('서버에서 로그인 정보를 받지 못했어요. 소셜 로그인을 다시 진행해 주세요.');
    }
    return data.data;
  } catch (error) {
    if (isAxiosError<{ message?: string }>(error)) {
      throw new Error(
        error.response?.data?.message || '가입을 완료하지 못했어요. 다시 시도해 주세요.',
      );
    }
    throw error;
  }
}
