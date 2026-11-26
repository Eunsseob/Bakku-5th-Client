import { Redirect, router, Stack, useLocalSearchParams } from 'expo-router';

import { PostOfferSelectionScreen } from '@/features/home/components/PostOfferSelectionScreen';

export default function SelectOfferRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const postId = Number(id);

  if (typeof id !== 'string' || !/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(postId)) {
    return <Redirect href="/(main)/home" />;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PostOfferSelectionScreen
        key={id}
        postId={postId}
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace({ pathname: '/post/[id]', params: { id } });
        }}
        onWriteNew={() => router.push({ pathname: '/post/request', params: { id } })}
      />
    </>
  );
}
