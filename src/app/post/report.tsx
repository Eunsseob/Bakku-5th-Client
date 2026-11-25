import { router, Stack, useLocalSearchParams } from 'expo-router';

import { PostReportScreen } from '@/features/home/components/PostReportScreen';

export default function PostReportRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else if (typeof id === 'string' && /^[1-9]\d*$/.test(id)) {
      router.replace({ pathname: '/post/[id]', params: { id } });
    } else {
      router.replace('/(main)/home');
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PostReportScreen
        onBack={goBack}
        onReasonPress={(reason) =>
          router.push({ pathname: '/post/report-detail', params: { id, reason } })
        }
      />
    </>
  );
}
