import axios, { isAxiosError } from 'axios';
import { uuid } from 'expo';

import { apiClient, apiRequest } from '@/shared/api/client';

async function logNaverTokenVerification(accessToken: string) {
  try {
    const { status, data } = await axios.get<{
      resultcode?: string;
      errorCode?: string;
    }>('https://openapi.naver.com/v1/nid/me', {
      timeout: 5_000,
      validateStatus: () => true,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.info('[social-login] naver verification', {
      status,
      code: data?.errorCode ?? data?.resultcode,
    });
  } catch (error) {
    console.info('[social-login] naver verification failed', {
      code: isAxiosError(error) ? error.code : undefined,
    });
  }
}

let deviceId: string | undefined;
type SocialLoginResult = { signupToken?: string; accessToken?: string };

export async function socialLogin(provider: 'kakao' | 'naver', socialAccessToken: string) {
  const url = `/api/v1/auth/${provider}/login`;
  const body = {
    socialAccessToken,
    ...(provider === 'naver' && { identityToken: '', authorizationCode: '' }),
    deviceId: (deviceId ??= uuid.v4()),
  };

  if (__DEV__) {
    console.info(
      `[social-login] request POST ${apiClient.getUri({ url })}\n${JSON.stringify(body, null, 2)}`,
    );
  }

  try {
    const response = await apiRequest<{ data: SocialLoginResult }>(
      { method: 'POST', url, data: body },
      { auth: false },
    );
    if (__DEV__) {
      console.info('[social-login] response', { provider, status: response.status });
    }
    return { ...response.data?.data, deviceId: body.deviceId };
  } catch (error) {
    if (__DEV__ && isAxiosError(error)) {
      console.info('[social-login] failure', {
        provider,
        status: error.response?.status,
        code: error.response?.data?.code ?? error.code,
      });
      if (provider === 'naver' && error.response?.status === 401) {
        void logNaverTokenVerification(socialAccessToken);
      }
    }
    throw new Error('서버 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.');
  }
}
