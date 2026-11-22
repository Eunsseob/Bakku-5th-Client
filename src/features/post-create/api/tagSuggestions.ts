import { apiRequest } from '@/shared/api/client';
import { isAxiosError } from 'axios';

export async function getTagSuggestions(keyword: string, signal: AbortSignal) {
  const request = {
    method: 'GET',
    url: '/api/v1/tags',
    params: { keyword, size: 10 },
  };
  const startedAt = Date.now();
  if (__DEV__) console.info('[tag-suggestions] request', request);
  const { data, status } = await apiRequest<{ success: boolean; data?: { tags: string[] } }>({
    ...request,
    signal,
  }).catch((error: unknown) => {
    if (__DEV__) {
      const axiosError = isAxiosError(error) ? error : undefined;
      const elapsedMs = Date.now() - startedAt;
      if (signal.aborted) console.info('[tag-suggestions] canceled', { keyword, elapsedMs });
      else
        console.warn('[tag-suggestions] error', {
          ...request,
          status: axiosError?.response?.status,
          code: axiosError?.code,
          message: axiosError?.message ?? (error instanceof Error ? error.message : undefined),
          body: axiosError?.response?.data,
          elapsedMs,
        });
    }
    throw error;
  });
  if (__DEV__)
    console.info('[tag-suggestions] response', {
      ...request,
      status,
      body: data,
      elapsedMs: Date.now() - startedAt,
    });
  if (!data?.success || !Array.isArray(data.data?.tags)) {
    throw new Error('추천 태그를 불러오지 못했어요.');
  }
  return data.data.tags.filter((tag): tag is string => typeof tag === 'string' && !!tag.trim());
}
