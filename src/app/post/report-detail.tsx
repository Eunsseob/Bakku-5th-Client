import { apiRequest, type ApiResponse } from '@/shared/api/client';
import { useAuthStore } from '@/shared/api/useAuthStore';
import { isAxiosError } from 'axios';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert } from 'react-native';

import {
  PostReportDetailScreen,
  type ReportReason,
} from '@/features/home/components/PostReportDetailScreen';

const apiReasons: Record<ReportReason, string> = {
  sale: 'SALE_SOLICITATION',
  external: 'EXTERNAL_TRADE',
  inappropriate: 'INAPPROPRIATE_CONTENT',
  fraud: 'FRAUD',
  other: 'OTHER',
};

export default function PostReportDetailRoute() {
  const { id, reason } = useLocalSearchParams<{ id?: string; reason?: string }>();
  const requestInProgress = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const reportReason =
    reason === 'external' || reason === 'inappropriate' || reason === 'fraud' || reason === 'other'
      ? reason
      : 'sale';

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace({ pathname: '/post/report', params: { id } });
  };

  const submitReport = async (detail?: string) => {
    if (requestInProgress.current) return;
    const targetId = Number(id);
    if (!/^[1-9]\d*$/.test(id ?? '') || !Number.isSafeInteger(targetId)) {
      if (__DEV__) console.info('[report] skipped', { reason: 'invalid-target-id' });
      Alert.alert('신고 실패', '신고할 게시글을 확인할 수 없어요.');
      return;
    }
    requestInProgress.current = true;
    setSubmitting(true);
    const { sessionId } = useAuthStore.getState();
    const payload = { targetType: 'POST', targetId, reason: apiReasons[reportReason] };
    const startedAt = Date.now();
    if (__DEV__) console.info('[report] request', { path: 'POST /api/v1/reports', ...payload });
    try {
      const { status, data } = await apiRequest<ApiResponse<unknown>>({
        method: 'POST',
        url: '/v1/reports',
        data: { ...payload, detail },
      });
      if (__DEV__) {
        console.info('[report] response', {
          status,
          success: data?.success,
          code: data?.code,
          elapsedMs: Date.now() - startedAt,
        });
      }
      if (data?.success === false) throw new Error(data.message || '요청을 처리하지 못했어요.');
      if (useAuthStore.getState().sessionId !== sessionId) return;
      router.dismissTo({
        pathname: '/post/[id]',
        params: { id: String(targetId), reportCompleted: String(Date.now()) },
      });
    } catch (error) {
      const requestError = isAxiosError<ApiResponse<unknown>>(error) ? error : undefined;
      if (__DEV__ && requestError) {
        console.info('[report] request failed', {
          status: requestError.response?.status,
          code: requestError.response?.data?.code ?? requestError.code,
          elapsedMs: Date.now() - startedAt,
        });
      }
      if (useAuthStore.getState().sessionId !== sessionId) return;
      const message = requestError
        ? requestError.response?.data?.message
        : error instanceof Error
          ? error.message
          : undefined;
      Alert.alert('신고 실패', message || '신고를 접수하지 못했어요. 다시 시도해 주세요.');
    } finally {
      requestInProgress.current = false;
      setSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: !submitting }} />
      <PostReportDetailScreen
        key={reportReason}
        reason={reportReason}
        onBack={() => {
          if (!requestInProgress.current) goBack();
        }}
        onSubmit={(detail) => void submitReport(detail)}
        submitting={submitting}
      />
    </>
  );
}
