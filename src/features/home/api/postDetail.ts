import { isAxiosError } from 'axios';

import { API_URL, apiData, apiRequest, type ApiResponse } from '@/shared/api/client';

export const postEditLockedMessage = '약속이 잡힌 글은 수정할 수 없어요';
export const postDeleteLockedMessage = '교환 가능한 글만 삭제할 수 있어요.';

export type PostDetailResponse = {
  id: number;
  status: 'AVAILABLE' | 'RESERVED' | 'COMPLETED';
  images: { key: string; url: string }[];
  title: string;
  category: string;
  opened: boolean;
  tags: string[];
  description: string | null;
  wantedItem: string | null;
  place: { lat: number; lng: number; name: string; regionName: string; memo: string | null };
  nowExchange: boolean;
  nowExchangeEndsAt: string | null;
  requestCount: number;
  viewCount: number;
  author: { userId: number; nickname: string; completedCount: number };
  isMine: boolean;
  chatRoomId: number | null;
  canRequest: boolean;
  createdAt: string;
};

export async function getPostDetail(postId: string, signal?: AbortSignal) {
  const data = await apiData<PostDetailResponse>({
    method: 'GET',
    url: `/v1/posts/${encodeURIComponent(postId)}`,
    signal,
  });
  if (!data || String(data.id) !== postId) throw new Error('게시글 응답을 확인할 수 없어요.');
  return data;
}

export async function deletePost(postId: string) {
  const request = { method: 'DELETE', url: `/v1/posts/${encodeURIComponent(postId)}` };
  const start = Date.now();
  if (__DEV__) console.info('[post-delete] request', request);
  const { data, status } = await apiRequest<ApiResponse<null> | undefined>(request).catch(
    (error: unknown) => {
      if (__DEV__) {
        const axiosError = isAxiosError(error) ? error : undefined;
        console.warn('[post-delete] error', {
          ...request,
          status: axiosError?.response?.status,
          code: axiosError?.code,
          message: axiosError?.message ?? (error instanceof Error ? error.message : undefined),
          body: axiosError?.response?.data,
          elapsedMs: Date.now() - start,
        });
      }
      throw error;
    },
  );
  if (__DEV__)
    console.info('[post-delete] response', {
      ...request,
      status,
      body: data,
      elapsedMs: Date.now() - start,
    });
  if (data?.success === false) {
    throw new Error(data.message || '교환글을 삭제하지 못했어요.');
  }
}

export function postDeleteError(error: unknown) {
  if (isAxiosError<{ message?: string }>(error)) {
    if (error.response?.status === 401) return '게시글을 삭제하려면 다시 로그인해 주세요.';
    return error.response?.data?.message || '교환글을 삭제하지 못했어요. 다시 시도해 주세요.';
  }
  return error instanceof Error ? error.message : '교환글을 삭제하지 못했어요.';
}

export function postDetailError(error: unknown) {
  if (isAxiosError(error)) {
    if (error.response?.status === 404) return '게시글을 찾을 수 없어요.';
    if (error.response?.status === 401) return '게시글을 보려면 다시 로그인해 주세요.';
  }
  return '게시글을 불러오지 못했어요.';
}

export function postImageSource(url: string, accessToken: string) {
  try {
    const api = new URL(API_URL);
    let image = new URL(url, api);
    if (
      ['localhost', '127.0.0.1', '[::1]'].includes(image.hostname) &&
      image.pathname.startsWith('/api/v1/images/')
    ) {
      image = new URL(`${image.pathname}${image.search}`, api);
    }
    if (image.origin === api.origin && image.pathname.startsWith('/api/v1/images/')) {
      return {
        uri: image.href,
        headers: { Authorization: `Bearer ${accessToken}`, Accept: 'image/*' },
      };
    }
    if (image.protocol === 'https:' || image.protocol === 'http:') return { uri: image.href };
  } catch {
    // Ignore a malformed image URL without preventing the post from rendering.
  }
  return null;
}
