import { AxiosHeaders, create, isAxiosError, type AxiosRequestConfig } from 'axios';

import { env } from './env';
import { useAuthStore } from './useAuthStore';

export const apiClient = create({
  baseURL: env.apiUrl,
  allowAbsoluteUrls: false,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (
    accessToken &&
    config.baseURL === env.apiUrl &&
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
