import axios, { isAxiosError } from 'axios';
import { uuid } from 'expo';

import { apiClient, apiData } from '@/shared/api/client';

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
type SocialLoginResult = { signupToken?: string; accessToken?: string; refreshToken?: string };
export type SocialProvider = 'kakao' | 'naver' | 'apple';
// 카카오 · 네이버는 SDK 액세스 토큰, Apple은 identityToken + authorizationCode 를 보낸다
export type SocialCredential =
  { socialAccessToken: string } | { identityToken: string; authorizationCode: string };

const SECRET_KEYS = new Set(['socialAccessToken', 'identityToken', 'authorizationCode']);

// 개발 로그에 토큰 값이 그대로 남지 않게 값 대신 길이만 남긴다
function maskSecrets(body: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(body).map(([key, value]) => [
      key,
      SECRET_KEYS.has(key) && value ? `<hidden ${value.length} chars>` : value,
    ]),
  );
}

export async function socialLogin(provider: SocialProvider, credential: SocialCredential) {
  const url = `/v1/auth/${provider}/login`;
  const body = {
    ...credential,
    ...(provider === 'naver' && { identityToken: '', authorizationCode: '' }),
    deviceId: (deviceId ??= uuid.v4()),
  };

  if (__DEV__) {
    console.info(
      `[social-login] request POST ${apiClient.getUri({ url })}\n${JSON.stringify(maskSecrets(body), null, 2)}`,
    );
  }

  try {
    const result = await apiData<SocialLoginResult>(
      { method: 'POST', url, data: body },
      { auth: false },
    );
    if (__DEV__) {
      console.info('[social-login] response', {
        provider,
        signup: !!result?.signupToken,
        tokens: !!result?.accessToken && !!result.refreshToken,
      });
    }
    return { ...result, deviceId: body.deviceId };
  } catch (error) {
    if (__DEV__ && isAxiosError(error)) {
      console.info('[social-login] failure', {
        provider,
        status: error.response?.status,
        code: error.response?.data?.code ?? error.code,
      });
      if (
        provider === 'naver' &&
        error.response?.status === 401 &&
        'socialAccessToken' in credential
      ) {
        void logNaverTokenVerification(credential.socialAccessToken);
      }
    }
    throw new Error('서버 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.');
  }
}
