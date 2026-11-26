import {
  AxiosHeaders,
  create,
  isAxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';

import { useAuthStore, type AuthTokens } from './useAuthStore';

type AuthRequestConfig = InternalAxiosRequestConfig & {
  authSessionId?: number;
  authRetried?: boolean;
};

let refreshInFlight: { sessionId: number; promise: Promise<void> } | undefined;

type ApiErrorBody = {
  success?: boolean;
  code?: string;
  message?: string;
  errors?: { field?: string; reason?: string }[];
};

function logApiFailure(
  config: AxiosRequestConfig | undefined,
  status: number | undefined,
  body?: ApiErrorBody,
  transportCode?: string,
  message?: string,
) {
  const safeText = (value: unknown) =>
    typeof value === 'string'
      ? value.replace(/\bBearer\s+\S+|\beyJ[\w-]+\.[\w-]+\.[\w-]+/gi, '[redacted]')
      : undefined;

  console.info('[api] failure', {
    method: config?.method?.toUpperCase(),
    path: config?.url?.split(/[?#]/)[0],
    status,
    code: safeText(body?.code) ?? transportCode,
    message: safeText(body?.message) ?? safeText(message),
    errors: Array.isArray(body?.errors)
      ? body.errors.map((item) => ({
          field: safeText(item?.field),
          reason: safeText(item?.reason),
        }))
      : undefined,
  });
}

/** 서버 주소. .env 의 EXPO_PUBLIC_API_URL */
export const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim() || '';
/** 모든 API 의 공통 앞부분. 버전은 각 경로에 둔다 (예: /v1/chat-rooms) */
const API_BASE_URL = `${API_URL}/api`;

export const apiClient = create({
  baseURL: API_BASE_URL,
  allowAbsoluteUrls: false,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config: AuthRequestConfig) => {
  const { accessToken, sessionId } = useAuthStore.getState();
  if (config.authRetried && config.authSessionId !== sessionId) {
    throw new Error('로그인 세션이 변경됐어요.');
  }
  if (
    accessToken &&
    config.baseURL === API_BASE_URL &&
    config.allowAbsoluteUrls === false &&
    !config.headers.has('Authorization')
  ) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
    config.authSessionId = sessionId;
  }
  return config;
});

async function refreshTokens(sessionId: number, refreshToken: string) {
  if (refreshInFlight?.sessionId === sessionId) return refreshInFlight.promise;

  const promise = (async () => {
    let token = refreshToken;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const { data } = await apiRequest<ApiResponse<AuthTokens | undefined>>(
          { method: 'POST', url: '/v1/auth/token/refresh', data: { refreshToken: token } },
          { auth: false },
        );
        if (!data?.success || !data.data?.accessToken || !data.data.refreshToken) {
          throw Object.assign(new Error(data?.message || '재발급 응답에 인증 토큰이 없어요.'), {
            code: data?.code,
          });
        }
        useAuthStore.getState().rotateTokens(data.data, sessionId);
        return;
      } catch (error) {
        const code = isAxiosError<ApiErrorBody>(error)
          ? error.response?.data?.code
          : (error as { code?: string } | null)?.code;
        const current = useAuthStore.getState();
        if (current.sessionId === sessionId) {
          if (
            code === 'AUTH_005' &&
            attempt === 0 &&
            current.refreshToken &&
            current.refreshToken !== token
          ) {
            token = current.refreshToken;
            continue;
          }
          if (code === 'AUTH_004' || code === 'MEMBER_003') {
            const { clearSessionAndReturnToLogin } = await import('@/features/auth/utils/logout');
            if (useAuthStore.getState().sessionId === sessionId) clearSessionAndReturnToLogin();
          }
        }
        throw error;
      }
    }
  })();
  refreshInFlight = { sessionId, promise };

  try {
    await promise;
  } finally {
    if (refreshInFlight?.promise === promise) refreshInFlight = undefined;
  }
}

apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__ && response.data?.success === false) {
      logApiFailure(response.config, response.status, response.data);
    }
    return response;
  },
  async (error) => {
    if (isAxiosError<ApiErrorBody>(error)) {
      if (__DEV__ && error.code !== 'ERR_CANCELED') {
        logApiFailure(
          error.config,
          error.response?.status,
          error.response?.data,
          error.code,
          error.message,
        );
      }
      if (error.response?.status === 401 || error.response?.data?.code === 'AUTH_002') {
        const config: AuthRequestConfig | undefined = error.config;
        const { accessToken, refreshToken, sessionId, clear } = useAuthStore.getState();
        if (config?.authSessionId === sessionId && accessToken) {
          const usedCurrentToken = config.headers.get('Authorization') === `Bearer ${accessToken}`;
          if (!config.authRetried && error.response?.data?.code === 'AUTH_002' && refreshToken) {
            if (usedCurrentToken) await refreshTokens(sessionId, refreshToken);
            const current = useAuthStore.getState();
            if (current.sessionId === sessionId && current.accessToken) {
              config.authRetried = true;
              config.headers.delete('Authorization');
              return apiClient.request(config);
            }
          } else if (usedCurrentToken) {
            clear();
          }
        }
      }
    }
    throw error;
  },
);

export function apiRequest<T>(config: AxiosRequestConfig, { auth = true } = {}) {
  if (auth) return apiClient.request<T>(config);

  const headers = new AxiosHeaders(config.headers as AxiosHeaders | undefined);
  headers.set('Authorization', false);
  return apiClient.request<T>({ ...config, headers });
}

/** 공통 응답(ApiResponse)에서 data 만 꺼낸다. success 가 false 면 서버 메시지로 에러 */
export async function apiData<T>(config: AxiosRequestConfig, options?: { auth?: boolean }) {
  const { data } = await apiRequest<ApiResponse<T>>(config, options);
  if (data?.success === false) throw new Error(data.message || '요청을 처리하지 못했어요.');
  return data?.data;
}

/** 서버 공통 응답 형태 (Swagger ResponseBody) */
export type ApiResponse<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T;
  errors?: { field: string; reason: string }[];
};
