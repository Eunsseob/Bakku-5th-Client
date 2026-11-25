import { useToastMessage } from '@/features/mypage/hooks/useToastMessage';
import { useAuthStore } from '@/shared/api/useAuthStore';
import { Button, CheckboxMark, Thumbnail, Toast, TopNavigation } from '@/shared/components';
import { useInfiniteQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getHomePosts } from '../api/homePosts';
import { getPostDetail, postImageSource, type PostDetailResponse } from '../api/postDetail';
import { useSubmitExchange } from '../hooks/useSubmitExchange';

const MAX_SELECTED_POSTS = 5;

export function PostOfferSelectionScreen({
  postId,
  onBack,
  onWriteNew,
}: {
  postId: number;
  onBack: () => void;
  onWriteNew: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<ReadonlySet<number>>(() => new Set());
  const [toast, setToast] = useToastMessage();
  const { busy, submitExchange } = useSubmitExchange(postId);
  const accessToken = useAuthStore((state) => state.accessToken);
  const sessionId = useAuthStore((state) => state.sessionId);
  const offers = useInfiniteQuery({
    queryKey: ['available-exchange-offers', sessionId, postId],
    enabled: !!accessToken,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam, signal }) => {
      const page = await getHomePosts({}, pageParam, signal);
      const ownPosts = page.content.filter((post) => post.isMine === true && post.id !== postId);
      const details = await Promise.all(
        ownPosts.map(async ({ id }) => {
          try {
            return await getPostDetail(String(id), signal);
          } catch (error) {
            if (isAxiosError(error) && error.response?.status === 404) return null;
            throw error;
          }
        }),
      );
      return {
        ...page,
        content: details.filter(
          (post): post is PostDetailResponse =>
            post?.isMine === true && post.status === 'AVAILABLE',
        ),
      };
    },
    getNextPageParam: ({ hasNext, nextCursor }, _pages, _cursor, cursors) =>
      hasNext && nextCursor && !cursors.includes(nextCursor) ? nextCursor : undefined,
    retry: false,
  });
  const { fetchNextPage, hasNextPage, isFetching, isFetchNextPageError } = offers;
  const lastPage = offers.data?.pages.at(-1);
  useEffect(() => {
    if (
      accessToken &&
      lastPage?.content.length === 0 &&
      hasNextPage &&
      !isFetching &&
      !isFetchNextPageError
    ) {
      void fetchNextPage({ cancelRefetch: false });
    }
  }, [accessToken, lastPage, hasNextPage, isFetching, isFetchNextPageError, fetchNextPage]);

  const availablePosts = accessToken
    ? [
        ...new Map(
          offers.data?.pages.flatMap(({ content }) =>
            content.map((post) => [post.id, post] as const),
          ),
        ).values(),
      ]
    : [];
  const offeredPostIds = availablePosts
    .filter((post) => selected.has(post.id))
    .map((post) => post.id);

  const togglePost = (id: number) => {
    if (!selected.has(id) && offeredPostIds.length >= MAX_SELECTED_POSTS) {
      setToast(`최대 ${MAX_SELECTED_POSTS}개까지 선택할 수 있어요.`);
      return;
    }

    setToast(null);
    setSelected((current) => {
      const next = new Set(
        availablePosts.filter((post) => current.has(post.id)).map((post) => post.id),
      );
      if (next.has(id)) next.delete(id);
      else if (next.size < MAX_SELECTED_POSTS) next.add(id);
      return next;
    });
  };

  return (
    <View
      className="flex-1 bg-surface-standard"
      style={{ paddingLeft: insets.left, paddingRight: insets.right }}
    >
      <TopNavigation
        type="screen"
        title="교환 제품 선택"
        onBack={busy ? undefined : onBack}
        trailingLabel="새로 작성"
        onTrailingPress={busy ? undefined : onWriteNew}
      />
      <FlatList
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
        data={availablePosts}
        extraData={selected}
        keyExtractor={(post) => String(post.id)}
        onEndReached={() => {
          if (hasNextPage && !isFetching && !isFetchNextPageError) {
            void fetchNextPage({ cancelRefetch: false });
          }
        }}
        ItemSeparatorComponent={() => <View className="my-3 h-px bg-fill-subtlest" />}
        ListFooterComponent={
          offers.isError ? (
            <Button
              hierarchy="secondary"
              size="md"
              className="mt-3 self-center"
              onPress={() => void (isFetchNextPageError ? fetchNextPage() : offers.refetch())}
            >
              다시 불러오기
            </Button>
          ) : undefined
        }
        ListEmptyComponent={
          <Text className="py-8 text-center font-sans text-label-lg text-object-alternative">
            {offers.isFetching
              ? '교환글을 불러오는 중이에요.'
              : offers.isError
                ? '교환글을 불러오지 못했어요.'
                : '교환 가능한 내 게시글이 없어요.'}
          </Text>
        }
        renderItem={({ item }) => {
          const checked = selected.has(item.id);
          return (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityLabel={item.title}
              accessibilityState={{ checked }}
              disabled={busy}
              onPress={() => togglePost(item.id)}
              className="min-h-[72px] flex-row items-center gap-3"
            >
              <Thumbnail
                source={
                  item.images[0] && accessToken
                    ? postImageSource(item.images[0].url, accessToken)
                    : undefined
                }
                size={72}
                cornerStyle="curved"
              />
              <View className="flex-1 gap-2">
                <Text numberOfLines={2} className="font-sans text-label-lg text-object-bold">
                  {item.title}
                </Text>
                <Text className="self-start rounded bg-fill-subtlest px-1 py-px font-sans text-[11px] leading-4 text-object-alternative">
                  {item.opened ? '개봉' : '미개봉'}
                </Text>
              </View>
              <CheckboxMark status={checked ? 'checked' : 'unchecked'} hierarchy="accent" />
            </Pressable>
          );
        }}
      />
      <View className="px-4 pt-2.5" style={{ paddingBottom: 10 + insets.bottom }}>
        <Button
          className="self-stretch"
          disabled={busy || offeredPostIds.length === 0}
          onPress={() => void submitExchange(() => ({ offerType: 'POST', offeredPostIds }))}
        >
          {busy
            ? '교환 요청 보내는 중…'
            : offeredPostIds.length >= 2
              ? `제품 ${offeredPostIds.length}개로 교환 요청`
              : '교환 요청하기'}
        </Button>
      </View>
      {toast ? (
        <View
          pointerEvents="none"
          className="absolute inset-x-2"
          style={{ bottom: 80 + insets.bottom }}
        >
          <Toast title={toast} />
        </View>
      ) : null}
    </View>
  );
}
