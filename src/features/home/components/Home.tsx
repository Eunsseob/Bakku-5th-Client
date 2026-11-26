import { router, useFocusEffect } from 'expo-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/api/useAuthStore';
import { getHomePosts, homePostsKey } from '../api/homePosts';
import { Chip, Icon, TopNavigation } from '@/shared/components';
import { InteractionLayer } from '@/shared/components/decoration/InteractionLayer';
import { PlusIcon } from 'phosphor-react-native/src/icons/Plus';
import HomeHeader, { type MenuAnchor } from './HomeHeader';
import ExchangePostCard from './ExchangePostCard';
import { useExchangeStore } from '../store/useExchangeStore';
import { type ComponentRef, useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  BackHandler,
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const font = { fontFamily: 'Pretendard', includeFontPadding: false };
const locations = ['전체', '홍대', '강남', '성수', '잠실'];
const categories = new Map<string, 'CHARACTER' | 'IDOL' | 'SPORTS' | 'ETC'>([
  ['캐릭터', 'CHARACTER'],
  ['아이돌', 'IDOL'],
  ['스포츠', 'SPORTS'],
  ['기타', 'ETC'],
]);
const searchFilters = [
  { label: '전체', width: 57 },
  { label: '지금 교환', width: 84 },
  { label: '일반 교환', width: 84 },
  { label: '캐릭터', width: 69 },
  { label: '아이돌', width: 69 },
  { label: '스포츠', width: 69 },
] as const;
const writeButtonSize = 56;
const writeButtonRadius = writeButtonSize / 2;
const bottomTabBarHeight = 48;
const refreshScrollDistance = 48;
export default function Home({ searchVisible = false }: { searchVisible?: boolean }) {
  const insets = useSafeAreaInsets();
  // The tab bar and its safe-area padding sit below the home screen.
  const writeButtonBottom = Math.max(16, 106 - bottomTabBarHeight - insets.bottom);
  const screen = useRef<ComponentRef<typeof View>>(null);
  const [category, setCategory] = useState('전체');
  const [location, setLocation] = useState('전체');
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(timer);
  }, []);
  const [query, setQuery] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [searchFilter, setSearchFilter] = useState<(typeof searchFilters)[number]['label']>('전체');
  const [mode, setMode] = useState('\uBAA8\uB4E0 \uAD50\uD658\uAE00');
  const publishedPostId = useExchangeStore((state) => state.publishedPostId);
  const dismissPublishedToast = useExchangeStore((state) => state.dismissPublishedToast);
  const accessToken = useAuthStore((state) => state.accessToken);
  const sessionId = useAuthStore((state) => state.sessionId);
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
    nowExchange: isSearching || mode === '모든 교환글' ? undefined : mode === '지금 교환',
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
  const [dropdown, setDropdown] = useState<{
    kind: 'location' | 'mode';
    x: number;
    y: number;
    width: number;
  } | null>(null);
  useFocusEffect(
    useCallback(() => {
      if (!dropdown) return;
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        setDropdown(null);
        return true;
      });
      return () => subscription.remove();
    }, [dropdown]),
  );
  const openDropdown = (kind: 'location' | 'mode', anchor: MenuAnchor) => {
    screen.current?.measureInWindow((screenX, screenY, screenWidth, screenHeight) => {
      const width = 160;
      const menuHeight = (kind === 'location' ? locations.length : 3) * 44 + 2;
      const x = Math.max(8, Math.min(anchor.x - screenX, screenWidth - width - 8));
      const below = anchor.y + anchor.height - screenY + 4;
      const y =
        below + menuHeight <= screenHeight - 8
          ? below
          : Math.max(8, anchor.y - screenY - menuHeight - 4);
      setDropdown({ kind, x, y, width });
    });
  };
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
  const loadMore = () => {
    if (canFetch && posts.hasNextPage && !posts.isFetching)
      void posts.fetchNextPage({ cancelRefetch: false });
  };
  const refreshPosts = () => {
    if (!canFetch) return;
    setDropdown(null);
    void posts.refetch({ cancelRefetch: posts.isFetchingNextPage });
  };

  return (
    <View
      ref={screen}
      collapsable={false}
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
          mode={mode}
          modeExpanded={dropdown?.kind === 'mode'}
          onRegionPress={(anchor) => openDropdown('location', anchor)}
          onModePress={(anchor) => openDropdown('mode', anchor)}
          onSearchPress={() => {
            setDropdown(null);
            router.push('/search');
          }}
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
          {!searchVisible && (
            <View className="h-11 flex-row items-center justify-end px-4">
              <Text style={font} className="text-[13px] leading-[18px] text-[#2E2E33]">
                최신순
              </Text>
            </View>
          )}
          <FlatList
            key={listKey}
            data={visiblePosts}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(post) => String(post.id)}
            renderItem={({ item }) => (
              <ExchangePostCard
                post={item}
                now={now}
                accessToken={accessToken}
                onPress={() =>
                  router.push({ pathname: '/post/[id]', params: { id: String(item.id) } })
                }
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
              flexGrow: searchHasNoResults ? 1 : undefined,
              justifyContent: searchHasNoResults ? 'center' : undefined,
              paddingHorizontal: 16,
              paddingTop: searchHasNoResults ? 0 : 8,
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
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="교환 글쓰기"
              onPress={() => router.push('/(main)/(post-create)/write')}
              style={{
                position: 'absolute',
                right: 16,
                bottom: writeButtonBottom,
                width: writeButtonSize,
                height: writeButtonSize,
                borderRadius: writeButtonRadius,
                backgroundColor: '#9C43FF',
                alignItems: 'center',
                justifyContent: 'center',
                elevation: 4,
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
              }}
            >
              {({ pressed }) => (
                <>
                  <Icon icon={PlusIcon} size="xl" color="#FFFFFF" />
                  <InteractionLayer
                    pressed={pressed}
                    color="#000212D1"
                    radius={writeButtonRadius}
                  />
                </>
              )}
            </Pressable>
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
      {dropdown && (
        <View className="absolute inset-0" style={{ zIndex: 50, elevation: 50 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="선택 메뉴 닫기"
            className="absolute inset-0"
            onPress={() => setDropdown(null)}
          />
          {dropdown && (
            <View
              accessibilityViewIsModal
              style={{
                position: 'absolute',
                left: dropdown.x,
                top: dropdown.y,
                width: dropdown.width,
              }}
              className="overflow-hidden rounded-xl border border-[#E0E0E6] bg-white shadow-lg"
            >
              {(dropdown.kind === 'location'
                ? locations
                : ['모든 교환글', '지금 교환', '일반 교환']
              ).map((item) => {
                const selected = item === (dropdown.kind === 'location' ? location : mode);
                return (
                  <Pressable
                    key={item}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => {
                      if (dropdown.kind === 'location') setLocation(item);
                      else setMode(item);
                      setDropdown(null);
                    }}
                    className={`min-h-11 flex-row items-center justify-between px-3 ${selected ? 'bg-gray-50' : 'bg-white'}`}
                  >
                    <Text style={font} className="text-[13px] leading-[18px] text-[#2E2E33]">
                      {dropdown.kind === 'location' && item === '전체' ? '모든 지역' : item}
                    </Text>
                    {selected && (
                      <Text style={font} className="text-[13px] text-[#2E2E33]">
                        ✓
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      )}
    </View>
  );
}
