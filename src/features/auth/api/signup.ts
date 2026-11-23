import { isAxiosError } from 'axios';

import { apiRequest } from '@/shared/api/client';
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
      data?: { accessToken?: string };
    }>({ method: 'POST', url: '/v1/auth/signup', data: payload }, { auth: false });

    if (data?.success === false) throw new Error(data.message || '가입을 완료하지 못했어요.');
    return data?.data;
  } catch (error) {
    if (isAxiosError<{ message?: string }>(error)) {
      throw new Error(
        error.response?.data?.message || '가입을 완료하지 못했어요. 다시 시도해 주세요.',
      );
    }
    throw error;
  }
}
