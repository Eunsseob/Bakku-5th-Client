import { isAxiosError } from 'axios';

import { apiData } from '@/shared/api/client';

type NicknameAvailability = { available: boolean; reason?: string | null };

export async function checkNicknameAvailability(nickname: string, signal: AbortSignal) {
  const result = await apiData<NicknameAvailability>(
    {
      method: 'GET',
      url: '/v1/members/nickname-availability',
      params: { nickname: nickname.trim() },
      signal,
    },
    { auth: false },
  );
  if (typeof result?.available !== 'boolean') throw new Error('Invalid nickname response');
  return result;
}

export function nicknameCheckError(error: unknown) {
  if (
    isAxiosError<{ code?: string }>(error) &&
    (error.response?.status === 429 || error.response?.data?.code === 'COMMON_003')
  ) {
    return '요청이 너무 많아요. 잠시 후 다시 시도해 주세요.';
  }
  return '닉네임을 확인하지 못했어요. 다시 시도해 주세요.';
}

export function nicknameUnavailableMessage(reason?: string | null) {
  const message = reason?.trim();
  if (
    message &&
    /duplicate|taken|already[ _-]*(used|in[ _-]*use|exists)|중복|이미\s*(사용|등록)/i.test(message)
  ) {
    return '이미 사용 중인 닉네임이에요.';
  }
  return message || '사용할 수 없는 닉네임이에요.';
}
