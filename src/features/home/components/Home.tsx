import { useAuthStore } from '@/shared/api/useAuthStore';
import { BottomSheet, Chip, EmptyState, Fab, ListItem, TopNavigation } from '@/shared/components';
import { useInfiniteQuery } from '@tanstack/react-query';
import { router, useFocusEffect } from 'expo-router';
import type { IconProps } from 'phosphor-react-native';
import { WarningCircleIcon } from 'phosphor-react-native/src/icons/WarningCircle';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getHomePosts, homePostsKey } from '../api/homePosts';
import { useExchangeStore } from '../store/useExchangeStore';
import ExchangePostCard from './ExchangePostCard';
import HomeHeader, { type ExchangeMode } from './HomeHeader';
import HomePostMenu from './HomePostMenu';

const font = { fontFamily: 'Pretendard', includeFontPadding: false };
const locations = ['전체', '홍대', '용산', '성수', '신도림', '국제전자센터'];
const regionSheetMinimumBottomInset = 34;
const regionSheetHeaderHeight = 66;
const categories = new Map<string, 'CHARACTER' | 'IDOL' | 'SPORTS' | 'ETC'>([
  ['캐릭터', 'CHARACTER'],
  ['아이돌', 'IDOL'],
  ['스포츠', 'SPORTS'],
  ['기타', 'ETC'],
]);
const categoryLabels = [...categories.keys()];
const searchFilters = [
  { label: '전체', width: 57 },
  { label: '지금 교환', width: 84 },
  { label: '일반 교환', width: 84 },
  { label: '캐릭터', width: 69 },
  { label: '아이돌', width: 69 },
  { label: '스포츠', width: 69 },
] as const;
const writeButtonSize = 56;
const writeButtonScreenBottom = 106;
const bottomTabBarHeight = 48;
const refreshScrollDistance = 48;

function PostSeparator() {
  return <View className="h-4" />;
}

function EmptyFeedIcon(props: IconProps) {
  return <WarningCircleIcon {...props} weight="fill" />;
}

export default function Home({ searchVisible = false }: { searchVisible?: boolean }) {
  const insets = useSafeAreaInsets();
  // The tab bar and its safe-area padding sit below the home screen.
  const writeButtonBottom = Math.max(
    16,
    writeButtonScreenBottom - bottomTabBarHeight - insets.bottom,
  );
  const [category, setCategory] = useState('전체');
  const [location, setLocation] = useState('전체');
  const [regionSheetVisible, setRegionSheetVisible] = useState(false);
  const { height: windowHeight } = useWindowDimensions();
  const [now, setNow] = useState(Date.now);
  useFocusEffect(
    useCallback(() => {
      setNow(Date.now());
      const timer = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(timer);
    }, []),
  );
  const [query, setQuery] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [searchFilter, setSearchFilter] = useState<(typeof searchFilters)[number]['label']>('전체');
  const [mode, setMode] = useState<ExchangeMode | null>(null);
  const publishedPostId = useExchangeStore((state) => state.publishedPostId);
  const dismissPublishedToast = useExchangeStore((state) => state.dismissPublishedToast);
  const accessToken = useAuthStore((state) => state.accessToken);
  const sessionId = useAuthStore((state) => state.sessionId);
  const [menu, setMenu] = useState<{ id: number; sessionId: number } | null>(null);
  const keyword = searchVisible ? query.replace(/\s/g, '').replace(/^#+/, '').toLowerCase() : '';
  const isSearching = searchVisible && Boolean(query.trim());
  const keywordLength = [...keyword].length;
  const invalidKeyword = isSearching && (keywordLength < 2 || keywordLength > 30);
  const waitingForKeyword = isSearching && keyword !== debouncedKeyword;
  useEffect(() => {
    if (!isSearching || invalidKeyword) return;
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 300);
    return () => clearTimeout(timer);
  }, [isSearching, invalidKeyword, keyword]);

  const filters = {
    category: categories.get(searchVisible ? searchFilter : category),
    nowExchange: searchVisible || mode === null ? undefined : mode === '지금 교환',
    keyword: isSearching ? keyword : undefined,
  };
  const canFetch =
    Boolean(accessToken) &&
    (!searchVisible || isSearching) &&
    !invalidKeyword &&
    !waitingForKeyword;
  const listKey = JSON.stringify([filters, searchFilter]);
  const hasScrolledAwayFromTop = useRef(false);
  useEffect(() => {
    hasScrolledAwayFromTop.current = false;
  }, [listKey, location, sessionId]);

  const posts = useInfiniteQuery({
    queryKey: [...homePostsKey, sessionId, filters],
    queryFn: ({ pageParam, signal }) => getHomePosts(filters, pageParam, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page, _pages, _cursor, cursors) =>
      page.hasNext && page.nextCursor && !cursors.includes(page.nextCursor)
        ? page.nextCursor
        : undefined,
    enabled: canFetch,
  });
  useFocusEffect(
    useCallback(() => {
      if (searchVisible || publishedPostId === null) return;
      const timer = setTimeout(dismissPublishedToast, 5000);
      return () => clearTimeout(timer);
    }, [searchVisible, publishedPostId, dismissPublishedToast]),
  );
  const uniquePosts = new Map(
    posts.data?.pages.flatMap((page) => page.content.map((post) => [post.id, post] as const)),
  );
  const visiblePosts = [...uniquePosts.values()].filter(
    (post) =>
      !invalidKeyword &&
      (isSearching || location === '전체' || post.regionName.includes(location)) &&
      (searchFilter !== '지금 교환' || post.nowExchange) &&
      (searchFilter !== '일반 교환' || !post.nowExchange),
  );
  const searchHasNoResults =
    isSearching &&
    !invalidKeyword &&
    !waitingForKeyword &&
    posts.isSuccess &&
    !posts.hasNextPage &&
    visiblePosts.length === 0;
  const homeHasNoResults =
    !searchVisible && posts.isSuccess && !posts.hasNextPage && visiblePosts.length === 0;
  const centerEmptyState = searchHasNoResults || homeHasNoResults;
  const loadMore = () => {
    if (canFetch && posts.hasNextPage && !posts.isFetching)
      void posts.fetchNextPage({ cancelRefetch: false });
  };
  const refreshPosts = () => {
    if (!canFetch) return;
    void posts.refetch({ cancelRefetch: posts.isFetchingNextPage });
  };

  return (
    <View
      className="flex-1 bg-white"
      style={{
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      {searchVisible ? (
        <TopNavigation
          type="searchField"
          safeArea={false}
          onBack={() => router.back()}
          onClose={() => router.back()}
          search={{
            accessibilityLabel: '교환할 굿즈 검색',
            placeholder: '모든 지역에서 검색',
            placeholderTextColor: '#000A3161',
            autoFocus: true,
            value: query,
            onChangeText: setQuery,
          }}
        />
      ) : (
        <HomeHeader
          location={location}
          category={category}
          categories={categoryLabels}
          mode={mode}
          onRegionPress={() => setRegionSheetVisible(true)}
          onModeChange={setMode}
          onResetFilters={() => {
            setCategory('전체');
            setMode(null);
          }}
          onSearchPress={() => router.push('/search')}
          onNotificationsPress={() => Alert.alert('알림', '새로운 알림이 없어요.')}
          onCategoryChange={setCategory}
        />
      )}
      {searchVisible && keywordLength >= 2 && (
        <View className="h-12">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 4 }}
          >
            {searchFilters.map(({ label, width }) => {
              const selected = searchFilter === label;
              return (
                <Chip
                  key={label}
                  hierarchy={selected ? 'primary' : 'secondary'}
                  accessibilityState={{ selected }}
                  className="!px-0"
                  style={{ width, backgroundColor: selected ? '#000212D1' : '#00264E0D' }}
                  onPress={() => setSearchFilter(label)}
                >
                  {label}
                </Chip>
              );
            })}
          </ScrollView>
        </View>
      )}
      {(!searchVisible || isSearching) && (
        <View className="flex-1">
          <FlatList
            key={listKey}
            data={visiblePosts}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(post) => String(post.id)}
            ItemSeparatorComponent={PostSeparator}
            renderItem={({ item }) => (
              <ExchangePostCard
                post={item}
                now={now}
                accessToken={accessToken}
                onPress={() =>
                  router.push({ pathname: '/post/[id]', params: { id: String(item.id) } })
                }
                onMore={() => setMenu({ id: item.id, sessionId })}
              />
            )}
            onEndReached={() => {
              if (visiblePosts.length && !posts.isFetchNextPageError) loadMore();
            }}
            onEndReachedThreshold={0.5}
            onScroll={({ nativeEvent }) => {
              const offset = nativeEvent.contentOffset.y;
              if (offset >= refreshScrollDistance) {
                hasScrolledAwayFromTop.current = true;
              } else if (offset <= 1 && hasScrolledAwayFromTop.current) {
                hasScrolledAwayFromTop.current = false;
                refreshPosts();
              }
            }}
            scrollEventThrottle={32}
            alwaysBounceVertical
            refreshControl={
              canFetch ? (
                <RefreshControl
                  refreshing={posts.isRefetching && !posts.isFetchingNextPage}
                  onRefresh={refreshPosts}
                  tintColor="#2E2E33"
                  colors={['#2E2E33']}
                />
              ) : undefined
            }
            contentContainerStyle={{
              flexGrow: centerEmptyState ? 1 : undefined,
              justifyContent: centerEmptyState ? 'center' : undefined,
              paddingHorizontal: 16,
              paddingTop: centerEmptyState ? 0 : 8,
              paddingBottom: searchVisible
                ? insets.bottom + 16
                : writeButtonBottom + writeButtonSize + 16,
            }}
            ListEmptyComponent={
              invalidKeyword ? (
                <Text style={font} className="py-12 text-center text-[14px] text-[#737380]">
                  검색어를 2~30자로 입력해 주세요. 공백과 앞의 #은 제외돼요.
                </Text>
              ) : waitingForKeyword || posts.isLoading ? (
                <ActivityIndicator className="py-12" />
              ) : posts.isError && !posts.data ? (
                <Pressable accessibilityRole="button" onPress={() => void posts.refetch()}>
                  <Text style={font} className="py-12 text-center text-[14px] text-[#737380]">
                    교환 글을 불러오지 못했어요. 다시 시도
                  </Text>
                </Pressable>
              ) : searchHasNoResults ? (
                <Text
                  style={font}
                  className="text-center text-[16px] leading-[22px] tracking-[-0.16px] text-[#000A3161]"
                >
                  일치하는 게시글이 없어요.
                </Text>
              ) : homeHasNoResults ? (
                <EmptyState
                  className="!px-0"
                  icon={EmptyFeedIcon}
                  title="이 지역에 등록된 게시글이 없어요."
                  description="다른 지역에서 교환할 사람을 찾아보세요."
                  action={{
                    label: '모든 지역에서 보기',
                    onPress: () => {
                      if (location === '전체') refreshPosts();
                      else setLocation('전체');
                    },
                  }}
                />
              ) : (
                <Text style={font} className="py-12 text-center text-[14px] text-[#737380]">
                  {posts.hasNextPage
                    ? '불러온 글 중 조건에 맞는 글이 없어요.'
                    : isSearching
                      ? '검색 결과가 없어요.'
                      : '조건에 맞는 교환 글이 없어요.'}
                </Text>
              )
            }
            ListFooterComponent={
              !canFetch ? undefined : posts.isFetchingNextPage ? (
                <ActivityIndicator className="py-4" />
              ) : posts.hasNextPage && (!visiblePosts.length || posts.isFetchNextPageError) ? (
                <Pressable accessibilityRole="button" onPress={loadMore}>
                  <Text style={font} className="py-4 text-center text-[14px] text-[#737380]">
                    {posts.isFetchNextPageError ? '다음 목록 다시 불러오기' : '다음 목록 보기'}
                  </Text>
                </Pressable>
              ) : undefined
            }
          />
          {!searchVisible && (
            <View className="absolute right-4" style={{ bottom: writeButtonBottom }}>
              <Fab
                accessibilityLabel="교환 글쓰기"
                onPress={() => router.push('/(main)/(post-create)/write')}
              />
            </View>
          )}
        </View>
      )}
      {!searchVisible && publishedPostId !== null && (
        <View
          accessibilityLiveRegion="polite"
          className="absolute bottom-[116px] left-4 right-4 min-h-12 flex-row items-center justify-between rounded-xl bg-[#2E2E33] pl-4 pr-2"
        >
          <Text style={font} className="flex-1 text-[14px] leading-[17px] text-white">
            교환글을 올렸어요
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="방금 작성한 내 글 보기"
            onPress={() => {
              const id = publishedPostId;
              dismissPublishedToast();
              router.push({ pathname: '/post/[id]', params: { id: String(id) } });
            }}
            className="min-h-12 justify-center px-2"
          >
            <Text style={font} className="text-[14px] leading-[17px] text-white">
              내 글 보기
            </Text>
          </Pressable>
        </View>
      )}
      {menu && menu.sessionId === sessionId && (
        <HomePostMenu postId={menu.id} sessionId={sessionId} onClose={() => setMenu(null)} />
      )}
      {!searchVisible && (
        <BottomSheet
          visible={regionSheetVisible}
          onRequestClose={() => setRegionSheetVisible(false)}
          animationType="slide"
          minimumBottomInset={regionSheetMinimumBottomInset}
          title="검색 위치 설정"
        >
          <ScrollView
            style={{
              maxHeight:
                windowHeight -
                insets.top -
                regionSheetHeaderHeight -
                Math.max(insets.bottom, regionSheetMinimumBottomInset),
            }}
            contentContainerStyle={{ paddingBottom: 8 }}
            alwaysBounceVertical={false}
          >
            {locations.map((item) => (
              <ListItem
                key={item}
                label={item === '전체' ? '모든 지역' : item}
                leading={{ type: 'radio', checked: item === location }}
                onPress={() => {
                  setLocation(item);
                  setRegionSheetVisible(false);
                }}
              />
            ))}
          </ScrollView>
        </BottomSheet>
      )}
    </View>
  );
}
