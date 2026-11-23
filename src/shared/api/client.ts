import { AxiosHeaders, create, isAxiosError, type AxiosRequestConfig } from 'axios';

import { useAuthStore } from './useAuthStore';

/** 서버 주소. .env 의 EXPO_PUBLIC_API_URL */
const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim() || '';
/** 모든 API 의 공통 앞부분. 버전은 각 경로에 둔다 (예: /v1/chat-rooms) */
const API_BASE_URL = `${API_URL}/api`;

export const apiClient = create({
  baseURL: API_BASE_URL,
  allowAbsoluteUrls: false,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (
    accessToken &&
    config.baseURL === API_BASE_URL &&
    config.allowAbsoluteUrls === false &&
    !config.headers.has('Authorization')
  ) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isAxiosError(error) && error.response?.status === 401) {
      const { accessToken, clear } = useAuthStore.getState();
      if (accessToken && error.config?.headers.get('Authorization') === `Bearer ${accessToken}`) {
        clear();
      }
    }
    return Promise.reject(error);
  },
);

export function apiRequest<T>(config: AxiosRequestConfig, { auth = true } = {}) {
  if (auth) return apiClient.request<T>(config);

  const headers = new AxiosHeaders(config.headers as AxiosHeaders | undefined);
  headers.set('Authorization', false);
  return apiClient.request<T>({ ...config, headers });
}

/** 공통 응답(ApiResponse)에서 data 만 꺼낸다 */
export async function apiData<T>(config: AxiosRequestConfig, options?: { auth?: boolean }) {
  const { data } = await apiRequest<ApiResponse<T>>(config, options);
  return data.data;
}

/** 서버 공통 응답 형태 (Swagger ResponseBody) */
export type ApiResponse<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T;
  errors?: { field: string; reason: string }[];
};
