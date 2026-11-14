import { router, useFocusEffect } from 'expo-router';
import { Icon } from '@/shared/components/Icon';
import { PlusIcon } from 'phosphor-react-native/src/icons/Plus';
import HomeHeader, { type MenuAnchor } from './HomeHeader';
import ExchangePostCard from './ExchangePostCard';
import { useExchangeStore } from '../store/useExchangeStore';
import { type ComponentRef, useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  BackHandler,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const font = { fontFamily: 'Pretendard', includeFontPadding: false };
const locations = ['전체', '홍대', '강남', '성수', '잠실'];
export default function Home() {
  const insets = useSafeAreaInsets();
  const screen = useRef<ComponentRef<typeof View>>(null);
  const sortButton = useRef<ComponentRef<typeof View>>(null);
  const [category, setCategory] = useState('전체');
  const [location, setLocation] = useState('전체');
  const [searchVisible, setSearchVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('\uBAA8\uB4E0 \uAD50\uD658\uAE00');
  const [sort, setSort] = useState('최신순');
  const { posts, setPosts, publishedPostId, dismissPublishedToast } = useExchangeStore();
  useFocusEffect(
    useCallback(() => {
      if (publishedPostId === null) return;
      const timer = setTimeout(dismissPublishedToast, 5000);
      return () => clearTimeout(timer);
    }, [publishedPostId, dismissPublishedToast]),
  );
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    if (!refreshing) return;
    // API 연결 전에는 더미 목록을 다시 불러오는 동작을 재현한다.
    const timer = setTimeout(() => {
      // Keep local posts until the API is connected.
      setRefreshing(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [refreshing]);
  const [dropdown, setDropdown] = useState<{
    kind: 'location' | 'sort' | 'mode';
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
  const [menuId, setMenuId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [wanted, setWanted] = useState('');
  const openDropdown = (kind: 'location' | 'mode' | 'sort', anchor: MenuAnchor) => {
    screen.current?.measureInWindow((screenX, screenY, screenWidth, screenHeight) => {
      const width = kind === 'sort' ? 120 : 160;
      const menuHeight =
        (kind === 'location' ? locations.length : kind === 'mode' ? 3 : 2) * 44 + 2;
      const x = Math.max(8, Math.min(anchor.x - screenX, screenWidth - width - 8));
      const below = anchor.y + anchor.height - screenY + 4;
      const y =
        below + menuHeight <= screenHeight - 8
          ? below
          : Math.max(8, anchor.y - screenY - menuHeight - 4);
      setDropdown({ kind, x, y, width });
    });
  };
  const visiblePosts = posts
    .filter(
      (post) =>
        (category === '전체' ||
          category === post.category ||
          (category === '캐릭터' && post.category === '애니메이션') ||
          (category === '아이돌' && post.category === '아이돌(케이팝)')) &&
        (mode === '모든 교환글' ||
          (mode === '지금 교환' ? post.onsite !== false : post.onsite === false)) &&
        (location === '전체' ||
          post.location.includes(location) ||
          !!post.locationDetail?.includes(location)) &&
        `${post.title} ${post.wanted}`.includes(query.trim()),
    )
    .sort((a, b) => (sort === '최신순' ? a.minutes - b.minutes : a.distance - b.distance));

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
      <HomeHeader
        location={location}
        category={category}
        mode={mode}
        query={query}
        searchVisible={searchVisible}
        modeExpanded={dropdown?.kind === 'mode'}
        onRegionPress={(anchor) => openDropdown('location', anchor)}
        onModePress={(anchor) => openDropdown('mode', anchor)}
        onSearchPress={() => setSearchVisible(!searchVisible)}
        onNotificationsPress={() => Alert.alert('알림', '새로운 알림이 없어요.')}
        onQueryChange={setQuery}
        onCategoryChange={setCategory}
      />
      <View className="flex-1">
        <View className="h-11 flex-row items-center justify-end px-4">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`정렬 ${sort}, 변경`}
            ref={sortButton}
            accessibilityState={{ expanded: dropdown?.kind === 'sort' }}
            onPress={() =>
              sortButton.current?.measureInWindow((x, y, width, height) => {
                openDropdown('sort', { x: x + width - 120, y, width, height });
              })
            }
            className="min-h-11 justify-center pl-4"
          >
            <Text style={font} className="text-[13px] leading-[18px] text-[#2E2E33]">
              {sort} ▾
            </Text>
          </Pressable>
        </View>
        <ScrollView
          alwaysBounceVertical
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setDropdown(null);
                setRefreshing(true);
              }}
              tintColor="#2E2E33"
              colors={['#2E2E33']}
            />
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 100 }}
        >
          {visiblePosts.length ? (
            visiblePosts.map((post) => (
              <ExchangePostCard
                key={post.id}
                post={post}
                onPress={() =>
                  router.push({ pathname: '/post/[id]', params: { id: String(post.id) } })
                }
                onMore={() => setMenuId(post.id)}
              />
            ))
          ) : (
            <Text style={font} className="py-12 text-center text-[14px] text-[#737380]">
              조건에 맞는 교환 글이 없어요.
            </Text>
          )}
        </ScrollView>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="교환 글쓰기"
          onPress={() => router.push('/write')}
          style={{
            position: 'absolute',
            right: 20,
            bottom: 24,
            width: 94,
            height: 48,
            borderRadius: 24,
            backgroundColor: '#364153',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 16,
            paddingVertical: 13,
            gap: 4,
          }}
        >
          <Icon icon={PlusIcon} size="md" color="#FFFFFF" />
          <Text
            numberOfLines={1}
            style={{
              ...font,
              fontSize: 16,
              lineHeight: 22,
              letterSpacing: -0.16,
              color: '#FFFFFF',
            }}
          >
            글쓰기
          </Text>
        </Pressable>
      </View>
      {publishedPostId !== null && (
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
                : dropdown.kind === 'mode'
                  ? ['모든 교환글', '지금 교환', '일반 교환']
                  : ['최신순', '가까운순']
              ).map((item) => {
                const selected =
                  item ===
                  (dropdown.kind === 'location'
                    ? location
                    : dropdown.kind === 'mode'
                      ? mode
                      : sort);
                return (
                  <Pressable
                    key={item}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => {
                      if (dropdown.kind === 'location') setLocation(item);
                      else if (dropdown.kind === 'mode') setMode(item);
                      else setSort(item);
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
      <Modal
        visible={menuId !== null || editingId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setMenuId(null);
          setEditingId(null);
        }}
      >
        <View className="flex-1 justify-end bg-black/30">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="닫기"
            className="absolute inset-0"
            onPress={() => {
              setMenuId(null);
              setEditingId(null);
            }}
          />
          <View
            accessibilityViewIsModal
            className="rounded-t-2xl bg-white px-6 pt-5"
            style={{ paddingBottom: Math.max(insets.bottom, 20) }}
          >
            {editingId !== null ? (
              <>
                <Text style={font} className="mb-4 text-[18px] text-[#2E2E33]">
                  게시글 수정
                </Text>
                <TextInput
                  accessibilityLabel="게시글 제목"
                  value={title}
                  onChangeText={setTitle}
                  maxLength={80}
                  style={font}
                  className="mb-3 h-12 rounded-lg border border-[#BFBFC7] px-3 text-[15px]"
                />
                <TextInput
                  accessibilityLabel="원하는 굿즈"
                  value={wanted}
                  onChangeText={setWanted}
                  maxLength={80}
                  style={font}
                  className="mb-4 h-12 rounded-lg border border-[#BFBFC7] px-3 text-[15px]"
                />
                <Pressable
                  accessibilityRole="button"
                  disabled={!title.trim() || !wanted.trim()}
                  onPress={() => {
                    setPosts(
                      posts.map((post) =>
                        post.id === editingId
                          ? { ...post, title: title.trim(), wanted: wanted.trim() }
                          : post,
                      ),
                    );
                    setEditingId(null);
                  }}
                  className="h-12 items-center justify-center rounded-lg bg-[#2E2E33] disabled:opacity-40"
                >
                  <Text style={font} className="text-[15px] text-white">
                    저장
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    const post = posts.find((item) => item.id === menuId);
                    if (post) {
                      setTitle(post.title);
                      setWanted(post.wanted);
                      setEditingId(post.id);
                    }
                    setMenuId(null);
                  }}
                  className="min-h-12 justify-center"
                >
                  <Text style={font} className="text-[15px] text-[#2E2E33]">
                    수정
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setPosts(posts.filter((post) => post.id !== menuId));
                    setMenuId(null);
                  }}
                  className="min-h-12 justify-center"
                >
                  <Text style={font} className="text-[15px] text-red-600">
                    삭제
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
