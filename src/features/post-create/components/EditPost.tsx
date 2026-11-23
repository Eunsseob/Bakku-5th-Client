import { getPostDetail, postEditLockedMessage } from '@/features/home/api/postDetail';
import { useAuthStore } from '@/shared/api/useAuthStore';
import { Button, TopNavigation } from '@/shared/components';
import { useQuery } from '@tanstack/react-query';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';

import WritePost from './WritePost';

export default function EditPost() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const accessToken = useAuthStore((state) => state.accessToken);
  const sessionId = useAuthStore((state) => state.sessionId);
  const detail = useQuery({
    queryKey: ['post-edit', id, sessionId],
    queryFn: ({ signal }) => getPostDetail(id, signal),
    enabled: !!accessToken && typeof id === 'string' && /^[1-9]\d*$/.test(id),
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    gcTime: 0,
    retry: false,
  });
  const post = detail.data;
  if (post?.isMine && post.status === 'AVAILABLE') {
    return <WritePost key={`${sessionId}:${post.id}`} originalPost={post} />;
  }

  const back = () => {
    if (router.canGoBack()) router.back();
    else if (id && /^[1-9]\d*$/.test(id))
      router.replace({ pathname: '/post/[id]', params: { id } });
    else router.replace('/(main)/home');
  };
  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <TopNavigation type="screen" title="교환글 수정" onBack={back} />
      <View className="flex-1 items-center justify-center gap-4 px-4">
        {detail.isLoading ? (
          <ActivityIndicator />
        ) : (
          <>
            <Text className="font-sans text-[#232531]">
              {post?.isMine ? postEditLockedMessage : '수정할 게시글을 불러올 수 없어요.'}
            </Text>
            {detail.isError && <Button onPress={() => void detail.refetch()}>다시 시도</Button>}
          </>
        )}
      </View>
    </View>
  );
}
