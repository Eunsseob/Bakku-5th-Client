import { Redirect, router, Stack, useLocalSearchParams } from 'expo-router';

import { PostRequestScreen } from '@/features/home/components/PostRequestScreen';

export default function PostRequestRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const postId = Number(id);

  if (typeof id !== 'string' || !/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(postId)) {
    return <Redirect href="/(main)/home" />;
  }

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace({ pathname: '/post/[id]', params: { id } });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PostRequestScreen
        key={id}
        postId={postId}
        onBack={goBack}
        onQuit={() => router.dismissTo({ pathname: '/post/[id]', params: { id } })}
      />
    </>
  );
}
