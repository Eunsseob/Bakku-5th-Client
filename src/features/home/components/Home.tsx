import { router, useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { useExchangeStore } from '../store/useExchangeStore';
import { type ComponentRef, useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
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
const categories = [
  { label: '전체', width: 50 },
  { label: '애니메이션', width: 86 },
  { label: '아이돌(케이팝)', width: 122 },
  { label: '스포츠', width: 62 },
];
const locations = ['전체', '홍대', '강남', '성수', '잠실'];
export default function Home() {
  const insets = useSafeAreaInsets();
  const locationButton = useRef<ComponentRef<typeof View>>(null);
  const sortButton = useRef<ComponentRef<typeof View>>(null);
  const [category, setCategory] = useState('전체');
  const [location, setLocation] = useState('전체');
  const [searchVisible, setSearchVisible] = useState(false);
  const [query, setQuery] = useState('');
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
    kind: 'location' | 'sort';
    x: number;
    y: number;
    width: number;
  } | null>(null);
  const [menuId, setMenuId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [wanted, setWanted] = useState('');
  const visiblePosts = posts
    .filter(
      (post) =>
        (category === '전체' || category === post.category) &&
        (location === '전체' || location === post.location) &&
        `${post.title} ${post.wanted}`.includes(query.trim()),
    )
    .sort((a, b) => (sort === '최신순' ? a.minutes - b.minutes : a.distance - b.distance));

  return (
    <View
      className="flex-1 bg-white"
      style={{
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <View className="h-[60px] flex-row items-center justify-between px-5">
        <Text style={font} className="text-[20px] leading-7 text-[#2E2E33]">
          가챠교환
        </Text>
        <View className="flex-row">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="검색"
            accessibilityState={{ expanded: searchVisible }}
            onPress={() => setSearchVisible(!searchVisible)}
            className="h-11 w-11 items-center justify-center"
          >
            <Text style={font} className="text-[24px] text-[#2E2E33]">
              ⌕
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="알림"
            onPress={() => Alert.alert('알림', '새로운 알림이 없어요.')}
            className="h-11 w-11 items-center justify-center"
          >
            <Text className="text-[18px]">🔔</Text>
          </Pressable>
        </View>
      </View>
      {searchVisible && (
        <TextInput
          accessibilityLabel="교환할 굿즈 검색"
          placeholder="굿즈를 검색해 보세요"
          value={query}
          onChangeText={setQuery}
          style={font}
          className="mx-4 mb-3 h-11 rounded-lg border border-[#BFBFC7] px-3 text-[14px] text-[#2E2E33]"
          returnKeyType="search"
        />
      )}
      <View className="pb-[10px] pt-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {categories.map((item) => (
            <Pressable
              key={item.label}
              accessibilityRole="button"
              accessibilityState={{ selected: category === item.label }}
              onPress={() => setCategory(item.label)}
              style={{ width: item.width }}
              className={`h-[34px] items-center justify-center rounded-full border-2 ${category === item.label ? 'border-[#2E2E33] bg-[#2E2E33]' : 'border-[#BFBFC7] bg-white'}`}
            >
              <Text
                style={font}
                className={`text-[13px] leading-[18px] ${category === item.label ? 'text-white' : 'text-[#2E2E33]'}`}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`거점 ${location}, 변경`}
          ref={locationButton}
          accessibilityState={{ expanded: dropdown?.kind === 'location' }}
          onPress={() =>
            locationButton.current?.measureInWindow((x, y, width, height) => {
              setDropdown({ kind: 'location', x, y: y + height + 4, width });
            })
          }
          className="ml-4 mt-2 h-[34px] w-[110px] items-center justify-center rounded-full border-2 border-[#BFBFC7]"
        >
          <Text style={font} className="text-[13px] leading-[18px] text-[#2E2E33]">
            거점 {location} ▾
          </Text>
        </Pressable>
      </View>
      <View className="h-px bg-[#E0E0E6]" />
      <View className="flex-1">
        <View className="h-11 flex-row items-center justify-end px-4">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`정렬 ${sort}, 변경`}
            ref={sortButton}
            accessibilityState={{ expanded: dropdown?.kind === 'sort' }}
            onPress={() =>
              sortButton.current?.measureInWindow((x, y, width, height) => {
                setDropdown({ kind: 'sort', x: x + width - 120, y: y + height + 4, width: 120 });
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
              <View key={post.id} className="mb-5">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${post.title} 상세 보기`}
                  onPress={() =>
                    router.push({ pathname: '/post/[id]', params: { id: String(post.id) } })
                  }
                  className="flex-row gap-[14px] pr-6"
                >
                  <View
                    accessibilityLabel={post.photos?.length ? '굿즈 사진' : '굿즈 사진 준비 중'}
                    className="h-24 w-24 items-center justify-center rounded-lg bg-[#E0E0E6]"
                  >
                    {post.photos?.[0] ? (
                      <Image
                        source={post.photos[0]}
                        style={{ width: 96, height: 96, borderRadius: 8 }}
                        contentFit="cover"
                      />
                    ) : (
                      <Text style={font} className="text-[11px] leading-[15px] text-[#737380]">
                        사진
                      </Text>
                    )}
                  </View>
                  <View className="min-w-0 flex-1 pt-0.5">
                    <Text style={font} className="pr-6 text-[15px] leading-[21px] text-[#2E2E33]">
                      {post.title}
                    </Text>
                    <Text
                      style={font}
                      className="mt-[5px] text-[12px] leading-[17px] text-[#737380]"
                    >
                      {post.location} · {post.minutes}분 전
                    </Text>
                    <Text
                      style={font}
                      className="mt-[3px] text-[12px] leading-[17px] text-[#737380]"
                    >
                      원해요: {post.wanted}
                    </Text>
                    {post.onsite !== false && (
                      <View className="mt-[7px] h-[22px] w-[116px] items-center justify-center rounded-md bg-[#2E2E33]">
                        <Text style={font} className="text-[11px] leading-[15px] text-white">
                          현장 · {post.remaining}분
                        </Text>
                      </View>
                    )}
                  </View>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="게시글 더 보기"
                  onPress={() => setMenuId(post.id)}
                  className="absolute -right-2 -top-3 h-11 w-11 items-center justify-center"
                >
                  <Text style={font} className="text-[18px] text-[#737380]">
                    ⋮
                  </Text>
                </Pressable>
              </View>
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
          className="absolute bottom-7 right-4 h-12 w-[120px] items-center justify-center rounded-full bg-[#2E2E33] active:opacity-80"
        >
          <Text style={font} className="text-[15px] leading-[21px] text-white">
            + 글쓰기
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
      <Modal
        visible={dropdown !== null}
        transparent
        statusBarTranslucent
        animationType="none"
        onRequestClose={() => setDropdown(null)}
      >
        <View className="flex-1">
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
              {(dropdown.kind === 'location' ? locations : ['최신순', '가까운순']).map((item) => {
                const selected = item === (dropdown.kind === 'location' ? location : sort);
                return (
                  <Pressable
                    key={item}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => {
                      if (dropdown.kind === 'location') setLocation(item);
                      else setSort(item);
                      setDropdown(null);
                    }}
                    className={`min-h-11 flex-row items-center justify-between px-3 ${selected ? 'bg-gray-50' : 'bg-white'}`}
                  >
                    <Text style={font} className="text-[13px] leading-[18px] text-[#2E2E33]">
                      {item}
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
      </Modal>
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
