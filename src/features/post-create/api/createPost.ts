import { isAxiosError, type AxiosRequestConfig } from 'axios';
import { Image, Platform } from 'react-native';

import { apiRequest } from '@/shared/api/client';

export const postCategories = {
  캐릭터: 'CHARACTER',
  아이돌: 'IDOL',
  스포츠: 'SPORTS',
  기타: 'ETC',
} as const;

export type PostCategoryLabel = keyof typeof postCategories;

export type CreatePostBody = {
  imageKeys: string[];
  title: string;
  category: (typeof postCategories)[PostCategoryLabel];
  opened: boolean;
  tags: string[];
  description: string | null;
  wantedItem: string | null;
  place: { lat: number; lng: number; name: string; regionName: string; memo: string | null };
  nowExchangeMinutes: number | null;
};

export type UpdatePostBody = Omit<CreatePostBody, 'nowExchangeMinutes'>;

type ApiResponse<T> = { success: boolean; message?: string; data?: T };

const maxPhotoEdge = 1600;
const maxPhotoBytes = 10_000_000;
const maxUploadBytes = 49_000_000;

async function requestPostApi<T>(config: AxiosRequestConfig, requestBody: unknown) {
  const { method, url } = config;
  const startedAt = Date.now();
  if (__DEV__) console.info('[post-api] request', { method, url, body: requestBody });

  try {
    const response = await apiRequest<T>(config);
    if (__DEV__) {
      console.info('[post-api] response', {
        method,
        url,
        status: response.status,
        elapsedMs: Date.now() - startedAt,
        body: response.data,
      });
    }
    return response;
  } catch (error) {
    if (__DEV__) {
      const axiosError = isAxiosError(error) ? error : undefined;
      console.warn('[post-api] error', {
        method,
        url,
        status: axiosError?.response?.status,
        elapsedMs: Date.now() - startedAt,
        code: axiosError?.code,
        message: error instanceof Error ? error.message : undefined,
        body: axiosError?.response?.data,
      });
    }
    throw error;
  }
}

async function compressPhoto(uri: string) {
  const { ImageManipulator, SaveFormat } = await import('expo-image-manipulator');
  const { width, height } = await new Promise<{ width: number; height: number }>(
    (resolve, reject) => Image.getSize(uri, (width, height) => resolve({ width, height }), reject),
  );
  const context = ImageManipulator.manipulate(uri);
  try {
    if (Math.max(width, height) > maxPhotoEdge) {
      context.resize(width >= height ? { width: maxPhotoEdge } : { height: maxPhotoEdge });
    }
    const image = await context.renderAsync();
    try {
      return await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.8 });
    } finally {
      image.release();
    }
  } finally {
    context.release();
  }
}

export async function uploadPostImages(photos: string[]) {
  const form = new FormData();
  const fileSystem = Platform.OS === 'web' ? null : await import('expo-file-system');
  const temporaryUris: string[] = [];
  let totalBytes = 0;
  form.append('purpose', 'POST');

  try {
    for (const [index, uri] of photos.entries()) {
      const photo = await compressPhoto(uri).catch(() => {
        throw new Error(`${index + 1}번째 사진을 압축하지 못했어요. 사진을 다시 선택해 주세요.`);
      });
      temporaryUris.push(photo.uri);
      const name = `photo-${index + 1}.jpg`;
      let size: number;
      if (fileSystem) {
        size = new fileSystem.File(photo.uri).size;
        // React Native FormData accepts a URI-backed file part.
        form.append('files', { uri: photo.uri, type: 'image/jpeg', name } as unknown as Blob);
      } else {
        const file = await fetch(photo.uri).then((response) => response.blob());
        size = file.size;
        form.append('files', file, name);
      }
      if (size <= 0) throw new Error(`${index + 1}번째 사진을 읽을 수 없어요.`);
      if (size > maxPhotoBytes) throw new Error(`${index + 1}번째 사진이 10MB를 초과했어요.`);
      totalBytes += size;
      if (totalBytes > maxUploadBytes)
        throw new Error('사진 전체 용량이 너무 커요. 장수를 줄여 주세요.');
    }

    const { data } = await requestPostApi<ApiResponse<{ uploads: { key: string }[] }>>(
      {
        method: 'POST',
        url: '/api/v1/images',
        data: form,
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60_000,
      },
      { purpose: 'POST', count: photos.length, totalBytes },
    );
    const uploads = data?.data?.uploads;
    if (
      !data?.success ||
      !Array.isArray(uploads) ||
      uploads.length !== photos.length ||
      uploads.some((upload) => typeof upload?.key !== 'string' || !upload.key)
    ) {
      throw new Error(data?.message || '업로드한 사진 정보를 확인할 수 없어요.');
    }
    return uploads.map(({ key }) => key);
  } finally {
    for (const uri of temporaryUris) {
      try {
        if (fileSystem) new fileSystem.File(uri).delete();
        else if (uri.startsWith('blob:')) URL.revokeObjectURL(uri);
      } catch {
        // Temporary file cleanup should not change the upload result.
      }
    }
  }
}

export async function createPost(body: CreatePostBody, idempotencyKey: string) {
  const { data } = await requestPostApi<ApiResponse<{ id: number }>>(
    {
      method: 'POST',
      url: '/api/v1/posts',
      headers: { 'Idempotency-Key': idempotencyKey },
      data: body,
    },
    body,
  );
  const id = data?.data?.id;
  if (!data?.success || typeof id !== 'number' || !Number.isSafeInteger(id) || id <= 0) {
    throw new Error(data?.message || '등록된 게시글을 확인할 수 없어요.');
  }
  return id;
}

export async function updatePost(id: number, body: UpdatePostBody) {
  const { status, data } = await requestPostApi<ApiResponse<unknown>>(
    { method: 'PUT', url: `/api/v1/posts/${id}`, data: body },
    body,
  );
  if (status !== 204 && !data?.success) {
    throw new Error(data?.message || '수정된 게시글을 확인할 수 없어요.');
  }
}

export function postSubmitError(error: unknown, editing = false) {
  const message = editing ? '교환글을 수정하지 못했어요.' : '교환글을 등록하지 못했어요.';
  if (isAxiosError<{ message?: string }>(error)) {
    if (error.response?.status === 401) return '로그인이 만료됐어요. 다시 로그인해 주세요.';
    return error.response?.data?.message || `${message} 다시 시도해 주세요.`;
  }
  return error instanceof Error ? error.message : message;
}
