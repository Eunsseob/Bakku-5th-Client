import { router, Stack, useLocalSearchParams } from 'expo-router';

import { PostReportDetailScreen } from '@/features/home/components/PostReportDetailScreen';

export default function PostReportDetailRoute() {
  const { id, reason } = useLocalSearchParams<{ id?: string; reason?: string }>();
  const reportReason =
    reason === 'external' || reason === 'inappropriate' || reason === 'fraud' || reason === 'other'
      ? reason
      : 'sale';

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace({ pathname: '/post/report', params: { id } });
  };

  const completeReport = () => {
    if (typeof id !== 'string' || !/^[1-9]\d*$/.test(id)) return;
    router.dismissTo({
      pathname: '/post/[id]',
      params: { id, reportCompleted: String(Date.now()) },
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PostReportDetailScreen
        key={reportReason}
        reason={reportReason}
        onBack={goBack}
        onComplete={completeReport}
      />
    </>
  );
}
