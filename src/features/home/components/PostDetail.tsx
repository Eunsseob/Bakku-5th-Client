import { postCategories } from '@/features/post-create/api/createPost';
import { useAuthStore } from '@/shared/api/useAuthStore';
import { Button, Icon, IconButton, Thumbnail, TopNavigation } from '@/shared/components';
import { InteractionLayer } from '@/shared/components/decoration/InteractionLayer';
import { type InfiniteData, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { CaretLeftIcon } from 'phosphor-react-native/src/icons/CaretLeft';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';
import { DotsThreeVerticalIcon } from 'phosphor-react-native/src/icons/DotsThreeVertical';
import { PencilSimpleIcon } from 'phosphor-react-native/src/icons/PencilSimple';
import { TrashIcon } from 'phosphor-react-native/src/icons/Trash';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import {
  deletePost,
  getPostDetail,
  postDeleteError,
  postDeleteLockedMessage,
  postDetailError,
  postEditLockedMessage,
  postImageSource,
} from '../api/postDetail';
import { homePostsKey, type HomePostsPage } from '../api/homePosts';
import { useExchangeStore } from '../store/useExchangeStore';
import MapCanvas from './MapCanvas';
import PostPhotoViewer from './PostPhotoViewer';

function DetailDivider() {
  return (
    <View style={{ height: 0 }}>
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 1,
          backgroundColor: '#E5E7EB',
        }}
      />
    </View>
  );
}

function DetailBadge({
  children,
  dark = false,
  photo = false,
}: {
  children: string;
  dark?: boolean;
  photo?: boolean;
}) {
  return (
    <View
      style={{
        height: photo ? 24 : 20,
        paddingHorizontal: 6,
        borderRadius: 4,
        backgroundColor: dark ? (photo ? '#4A5565' : '#6A7282') : photo ? '#F9FAFB' : '#F3F4F6',
        justifyContent: 'center',
        borderWidth: photo && !dark ? 1 : 0,
        borderColor: '#E5E7EB',
      }}
    >
      <Text
        className="font-sans"
        style={{
          fontSize: photo ? 13 : 11,
          lineHeight: photo ? 20 : 16,
          color: dark ? '#FFFFFF' : photo ? '#6A7282' : '#4A5565',
          includeFontPadding: false,
        }}
      >
        {children}
      </Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 16, minHeight: 22 }}>
      <Text
        numberOfLines={1}
        className="font-sans"
        style={{
          width: 56,
          flexShrink: 0,
          fontSize: 14,
          lineHeight: 22,
          color: '#6A7282',
          includeFontPadding: false,
        }}
      >
        {label}
      </Text>
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        className="font-sans"
        style={{
          flex: 1,
          minWidth: 0,
          fontSize: 14,
          lineHeight: 22,
          color: '#030712',
          includeFontPadding: false,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

export default function PostDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const accessToken = useAuthStore((state) => state.accessToken);
  const sessionId = useAuthStore((state) => state.sessionId);
  const queryInstance = useId();
  const queryClient = useQueryClient();
  const detailKey = ['post-detail', id, queryInstance, sessionId] as const;
  const validId = typeof id === 'string' && /^[1-9]\d*$/.test(id);
  const detail = useQuery({
    queryKey: detailKey,
    queryFn: ({ signal }) => getPostDetail(id, signal),
    enabled: validId && !!accessToken,
    retry: false,
  });
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const photoWidth = width - insets.left - insets.right;
  const [mapOpen, setMapOpen] = useState(false);
  const [postMenuOpen, setPostMenuOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const deleteInProgress = useRef(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now);
  const images = detail.data?.images;
  const photos = useMemo(() => {
    if (!images || !accessToken) return [];

    return images
      .map(({ url }) => postImageSource(url, accessToken))
      .filter((source) => source !== null)
      .map((source) => ({
        ...source,
        cacheKey: `post-photo:${sessionId}:${queryInstance}:${source.uri}`,
      }));
  }, [images, accessToken, sessionId, queryInstance]);
  useEffect(() => {
    if (!detail.data?.nowExchangeEndsAt) return;
    const timer = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(timer);
  }, [detail.data?.nowExchangeEndsAt]);
  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(main)/home');
  };

  const isLoadingDetail = Boolean(accessToken) && validId && detail.isPending;

  if (!accessToken || !validId || !detail.data)
    return (
      <View
        className="flex-1 items-center justify-center gap-6 bg-white px-4"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Stack.Screen options={{ headerShown: false }} />
        {isLoadingDetail ? (
          <ActivityIndicator accessibilityLabel="게시글 불러오는 중" />
        ) : (
          <Text className="font-sans text-[16px] text-[#364153]">
            {!validId
              ? '게시글을 찾을 수 없어요.'
              : !accessToken
                ? '게시글을 보려면 로그인해 주세요.'
                : postDetailError(detail.error)}
          </Text>
        )}
        {accessToken && validId && detail.isError && (
          <Button hierarchy="primary" onPress={() => void detail.refetch()}>
            다시 시도
          </Button>
        )}
        {!isLoadingDetail && (
          <Button hierarchy="primary" onPress={goBack}>
            돌아가기
          </Button>
        )}
      </View>
    );

  const response = detail.data;
  const closePostMenu = () => {
    if (!deleteInProgress.current) setPostMenuOpen(false);
  };
  const resetDelete = () => {
    deleteInProgress.current = false;
    setDeleteBusy(false);
  };
  const confirmDelete = async () => {
    if (deleteInProgress.current || !response.isMine || response.status !== 'AVAILABLE') return;
    deleteInProgress.current = true;
    setDeleteBusy(true);
    const sameSession = () => useAuthStore.getState().sessionId === sessionId;
    if (__DEV__) console.info('[post-delete] precheck request', { postId: id });
    try {
      const latest = await getPostDetail(id);
      if (__DEV__)
        console.info('[post-delete] precheck result', {
          postId: id,
          status: latest.status,
          isMine: latest.isMine,
          requestCount: latest.requestCount,
        });
      if (!sameSession()) {
        resetDelete();
        return;
      }
      queryClient.setQueryData(detailKey, latest);
      if (!latest.isMine || latest.status !== 'AVAILABLE') {
        Alert.alert('교환글 삭제', postDeleteLockedMessage);
        resetDelete();
        return;
      }
      const description =
        latest.requestCount > 0
          ? `받은 요청이 ${latest.requestCount}개 있어요. 그래도 교환글을 삭제할까요?`
          : '삭제한 교환글은 복구할 수 없어요.';
      if (__DEV__) console.info('[post-delete] confirm opened', { postId: id });
      Alert.alert(
        '교환글을 삭제할까요?',
        description,
        [
          {
            text: '취소',
            style: 'cancel',
            onPress: () => {
              if (__DEV__) console.info('[post-delete] canceled', { postId: id });
              resetDelete();
            },
          },
          {
            text: '삭제하기',
            style: 'destructive',
            onPress: async () => {
              try {
                if (__DEV__)
                  console.info('[post-delete] confirmed', {
                    postId: id,
                    sameSession: sameSession(),
                  });
                if (!sameSession()) return;
                await deletePost(id);
                if (!sameSession()) return;
                const listKey = [...homePostsKey, sessionId];
                await queryClient.cancelQueries({ queryKey: listKey });
                queryClient.setQueriesData<InfiniteData<HomePostsPage>>(
                  { queryKey: listKey },
                  (cached) =>
                    cached && {
                      ...cached,
                      pages: cached.pages.map((page) => ({
                        ...page,
                        content: page.content.filter((post) => post.id !== response.id),
                      })),
                    },
                );
                useExchangeStore.getState().removeOwnPost(response.id);
                void queryClient.invalidateQueries({ queryKey: listKey });
                setPostMenuOpen(false);
                goBack();
              } catch (error) {
                if (sameSession()) {
                  Alert.alert('교환글 삭제 실패', postDeleteError(error));
                  void detail.refetch();
                }
              } finally {
                resetDelete();
              }
            },
          },
        ],
        { cancelable: false },
      );
    } catch (error) {
      if (__DEV__)
        console.warn('[post-delete] precheck failed', {
          postId: id,
          message: postDeleteError(error),
        });
      if (sameSession()) Alert.alert('삭제 가능 여부 확인 실패', postDeleteError(error));
      resetDelete();
    }
  };
  const elapsed = Math.floor((now - Date.parse(response.createdAt)) / 60_000);
  const remaining = Math.ceil((Date.parse(response.nowExchangeEndsAt ?? '') - now) / 60_000);
  const post = {
    ...response,
    photos,
    category:
      Object.entries(postCategories).find(([, value]) => value === response.category)?.[0] ??
      response.category,
    wanted: response.wantedItem ?? '상관없음',
    condition: response.opened ? '개봉' : '미개봉',
    location: response.place.name,
    locationDetail: response.place.memo,
    locationPoint: { latitude: response.place.lat, longitude: response.place.lng },
    minutes: Math.max(0, elapsed || 0),
    remaining: Math.max(0, remaining || 0),
  };
  const requestCount = post.requestCount;
  const isNow = post.nowExchange || !!post.nowExchangeEndsAt;
  const authorName = post.author.nickname;
  const showAction = !post.isMine || requestCount > 0;
  const actionDisabled = !post.isMine && !post.chatRoomId && !post.canRequest;
  const actionLabel = post.isMine
    ? `받은 요청 ${requestCount}개 보기`
    : post.chatRoomId
      ? '채팅으로 이동'
      : post.canRequest
        ? '교환 요청하기'
        : '교환을 요청할 수 없어요';
  const statusLabel =
    post.status === 'COMPLETED'
      ? '교환 완료'
      : post.status === 'RESERVED'
        ? '예약 중'
        : isNow && post.remaining <= 0
          ? '교환 종료'
          : '교환 가능';

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingLeft: insets.left, paddingRight: insets.right }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        className="flex-1"
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{ paddingBottom: showAction ? 0 : insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: photoWidth }} className="overflow-hidden bg-[#E5E7EB]">
          {post.photos?.length ? (
            <ScrollView
              horizontal
              pagingEnabled
              directionalLockEnabled
              removeClippedSubviews={false}
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) =>
                setPhotoIndex(Math.round(event.nativeEvent.contentOffset.x / photoWidth))
              }
            >
              {post.photos.map((source, index) => (
                <Pressable
                  key={`${source.uri}-${index}`}
                  accessibilityRole="button"
                  accessibilityLabel={`굿즈 사진 ${index + 1} 크게 보기`}
                  onPress={() => setViewerIndex(index)}
                >
                  <Image
                    source={source}
                    cachePolicy="memory"
                    onLoadStart={() => {
                      if (__DEV__)
                        console.info('[post-images] GET request', {
                          url: source.uri.split(/[?#]/, 1)[0],
                          authenticated: Boolean(source.headers?.Authorization),
                        });
                    }}
                    onLoad={({ source: loaded, cacheType }) => {
                      if (__DEV__)
                        console.info('[post-images] GET loaded', {
                          url: source.uri.split(/[?#]/, 1)[0],
                          width: loaded.width,
                          height: loaded.height,
                          cacheType,
                        });
                    }}
                    onError={({ error }) => {
                      if (__DEV__)
                        console.warn('[post-images] GET error', {
                          url: source.uri.split(/[?#]/, 1)[0],
                          error: error?.replace(source.uri, source.uri.split(/[?#]/, 1)[0]),
                        });
                    }}
                    style={{ width: photoWidth, height: photoWidth }}
                    contentFit="cover"
                  />
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="font-sans text-[13px] text-[#99A1AF]">사진</Text>
            </View>
          )}
          <Svg pointerEvents="none" width="100%" height="100%" style={{ position: 'absolute' }}>
            <Defs>
              <LinearGradient id="photoShade" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#000000" stopOpacity={0.16} />
                <Stop offset="1" stopColor="#000000" stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#photoShade)" />
          </Svg>
          <View
            pointerEvents="box-none"
            className="absolute left-3 right-3 flex-row justify-between"
            style={{ top: insets.top + 4 }}
          >
            <IconButton
              icon={CaretLeftIcon}
              accessibilityLabel="뒤로가기"
              hierarchy="primary"
              onPress={goBack}
              className="h-11 w-11"
            />
            <IconButton
              icon={DotsThreeVerticalIcon}
              accessibilityLabel="게시글 더보기"
              hierarchy="primary"
              className="h-11 w-11"
              onPress={() => {
                if (post.isMine) {
                  if (__DEV__)
                    console.info('[post-delete] menu opened', {
                      postId: id,
                      status: post.status,
                      canDelete: post.status === 'AVAILABLE',
                    });
                  setPostMenuOpen(true);
                } else Alert.alert('게시글 메뉴', '신고 기능은 준비 중이에요.');
              }}
            />
          </View>
          <View
            pointerEvents="none"
            style={{ position: 'absolute', bottom: 12, left: 12, flexDirection: 'row', gap: 8 }}
          >
            <DetailBadge dark photo>
              {isNow ? '지금 교환' : '일반 교환'}
            </DetailBadge>
            {post.wanted === '상관없음' && <DetailBadge photo>제시 가능</DetailBadge>}
          </View>
          {!!post.photos?.length && (
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                right: 12,
                bottom: 12,
                minWidth: 45,
                height: 24,
                borderRadius: 12,
                backgroundColor: 'rgba(0,0,0,0.4)',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 10,
              }}
            >
              <Text
                className="font-sans"
                style={{
                  fontSize: 12,
                  lineHeight: 18,
                  color: '#FFFFFF',
                  includeFontPadding: false,
                }}
              >
                {Math.min(photoIndex + 1, post.photos.length)} / {post.photos.length}
              </Text>
            </View>
          )}
        </View>
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <Text
            accessibilityRole="header"
            className="font-sans"
            style={{
              fontSize: 20,
              lineHeight: 26,
              letterSpacing: -0.2,
              color: '#030712',
              includeFontPadding: false,
            }}
          >
            {post.title}
          </Text>
          <Text
            className="font-sans"
            style={{
              marginTop: 8,
              fontSize: 14,
              lineHeight: 22,
              color: '#6A7282',
              includeFontPadding: false,
            }}
          >
            {post.location} · {post.minutes}분 전
          </Text>
          <View
            style={{
              marginTop: 8,
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 8,
              minHeight: 20,
            }}
          >
            {isNow && (
              <DetailBadge dark>
                {post.remaining > 0 ? `${post.remaining}분 남음` : '교환 마감'}
              </DetailBadge>
            )}
            <DetailBadge>{statusLabel}</DetailBadge>
            <Text
              className="font-sans"
              style={{
                marginLeft: 'auto',
                fontSize: 12,
                lineHeight: 18,
                color: '#6A7282',
                includeFontPadding: false,
              }}
            >
              요청 {requestCount} · 조회 {post.viewCount ?? 0}
            </Text>
          </View>
          <View style={{ marginTop: 20 }}>
            <DetailDivider />
          </View>
          <View style={{ marginTop: 16, gap: 8 }}>
            <InfoRow label="카테고리" value={post.category} />
            <InfoRow label="상품상태" value={post.condition} />
            <InfoRow label="원해요" value={post.wanted} />
          </View>
          <Text
            className="font-sans"
            style={{
              marginTop: 24,
              marginBottom: 24,
              fontSize: 16,
              lineHeight: 26,
              color: '#364153',
              includeFontPadding: false,
            }}
          >
            {post.description || '등록된 상세 설명이 없어요.'}
          </Text>
          {!!post.tags?.length && (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8,
                marginBottom: 24,
              }}
            >
              {post.tags?.map((tag) => (
                <DetailBadge key={tag}>{`#${tag}`}</DetailBadge>
              ))}
            </View>
          )}
          <DetailDivider />
          <View
            style={{
              marginTop: 16,
              marginBottom: 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
              minHeight: 22,
            }}
          >
            <Text
              numberOfLines={1}
              className="font-sans"
              style={{
                width: 56,
                flexShrink: 0,
                fontSize: 14,
                lineHeight: 22,
                color: '#6A7282',
                includeFontPadding: false,
              }}
            >
              교환장소
            </Text>
            <View
              style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                className="font-sans"
                style={{
                  flexShrink: 1,
                  fontSize: 14,
                  lineHeight: 22,
                  color: '#030712',
                  includeFontPadding: false,
                }}
              >
                {post.location}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="교환 장소 지도 열기"
                onPress={() => setMapOpen(true)}
                hitSlop={12}
                style={{ width: 16, height: 16, flexShrink: 0 }}
              >
                <Icon icon={CaretRightIcon} size="md" color="#364153" />
              </Pressable>
            </View>
          </View>
          <View
            style={{
              height: 120,
              overflow: 'hidden',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.08)',
              backgroundColor: '#F3F4F6',
            }}
          >
            {post.locationPoint ? (
              <MapCanvas point={post.locationPoint} preview />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Text className="font-sans text-[13px] text-[#99A1AF]">
                  등록된 위치 좌표가 없어요.
                </Text>
              </View>
            )}
            {!!post.locationPoint && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="교환 장소 지도 보기"
                onPress={() => setMapOpen(true)}
                style={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  minWidth: 57,
                  height: 24,
                  paddingHorizontal: 6,
                  borderRadius: 8,
                  backgroundColor: '#FFFFFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  className="font-sans"
                  style={{
                    fontSize: 12,
                    lineHeight: 18,
                    letterSpacing: -0.12,
                    color: '#4A5565',
                    includeFontPadding: false,
                  }}
                >
                  지도 보기
                </Text>
              </Pressable>
            )}
          </View>
          {!!post.locationDetail && (
            <Text
              className="font-sans"
              style={{
                marginTop: 8,
                fontSize: 14,
                lineHeight: 22,
                color: '#030712',
                includeFontPadding: false,
              }}
            >
              {post.locationDetail}
            </Text>
          )}
        </View>
        <View style={{ marginTop: 24, height: 6, backgroundColor: '#F3F4F6' }} />
        <View
          style={{
            minHeight: 74,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingHorizontal: 16,
            paddingVertical: 16,
          }}
        >
          <Thumbnail
            size={40}
            cornerStyle="rounded"
            variant="hollow"
            accessibilityLabel="작성자 프로필 이미지"
          />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              numberOfLines={1}
              className="font-sans"
              style={{
                fontSize: 16,
                lineHeight: 22,
                letterSpacing: -0.16,
                color: '#030712',
                includeFontPadding: false,
              }}
            >
              {authorName}
            </Text>
            <Text
              className="font-sans"
              style={{ fontSize: 13, lineHeight: 20, color: '#6A7282', includeFontPadding: false }}
            >
              교환 완료 {post.author.completedCount}회
            </Text>
          </View>
          <Text
            className="font-sans"
            style={{
              fontSize: 14,
              lineHeight: 20,
              letterSpacing: -0.14,
              color: '#6A7282',
              textAlign: 'right',
              includeFontPadding: false,
            }}
          >
            매너 지표 —
          </Text>
        </View>
      </ScrollView>
      {showAction && (
        <View
          style={{
            backgroundColor: '#FFFFFF',
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 8 + insets.bottom,
            flexShrink: 0,
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: actionDisabled }}
            disabled={actionDisabled}
            onPress={() => Alert.alert(actionLabel, '이 화면은 준비 중이에요.')}
            style={{
              height: 52,
              width: '100%',
              borderRadius: 12,
              backgroundColor: actionDisabled ? '#D1D5DC' : '#364153',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              className="font-sans"
              style={{
                fontSize: 16,
                lineHeight: 22,
                letterSpacing: -0.16,
                color: actionDisabled ? '#99A1AF' : '#FFFFFF',
                includeFontPadding: false,
              }}
            >
              {actionLabel}
            </Text>
          </Pressable>
        </View>
      )}
      <Modal
        visible={post.isMine && postMenuOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={closePostMenu}
      >
        <View className="flex-1 justify-end">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="게시글 메뉴 닫기"
            className="absolute inset-0"
            style={{ backgroundColor: '#00000070' }}
            onPress={closePostMenu}
          />
          <View
            accessibilityViewIsModal
            style={{
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              overflow: 'hidden',
              paddingBottom: Math.max(34, insets.bottom),
            }}
          >
            <View style={{ height: 12, alignItems: 'center', justifyContent: 'flex-end' }}>
              <View
                style={{ width: 48, height: 4, borderRadius: 2, backgroundColor: '#000D4B25' }}
              />
            </View>
            <View style={{ height: 104, paddingHorizontal: 16, paddingTop: 8, overflow: 'hidden' }}>
              {[
                {
                  action: 'edit',
                  label: '수정하기',
                  icon: PencilSimpleIcon,
                  color: '#232531',
                  iconColor: '#00051E8D',
                  disabled: post.status !== 'AVAILABLE',
                  disabledMessage: postEditLockedMessage,
                },
                {
                  action: 'delete',
                  label: '삭제하기',
                  icon: TrashIcon,
                  color: '#EC0042',
                  iconColor: '#EC0042',
                  disabled: post.status !== 'AVAILABLE',
                  disabledMessage: postDeleteLockedMessage,
                },
              ].map(
                ({
                  action,
                  label,
                  icon: ActionIcon,
                  color,
                  iconColor,
                  disabled,
                  disabledMessage,
                }) => (
                  <Pressable
                    key={label}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: disabled || deleteBusy }}
                    accessibilityHint={disabled ? disabledMessage : undefined}
                    disabled={disabled || deleteBusy}
                    onPress={() => {
                      if (action === 'delete') {
                        void confirmDelete();
                        return;
                      }
                      setPostMenuOpen(false);
                      router.push({ pathname: '/post/edit/[id]', params: { id: String(post.id) } });
                    }}
                    style={{
                      height: 48,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      overflow: 'hidden',
                    }}
                  >
                    {({ pressed }) => (
                      <>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <ActionIcon size={20} color={disabled ? '#99A1AF' : iconColor} />
                          <View>
                            <Text
                              style={{
                                fontFamily: 'Pretendard',
                                color: disabled ? '#99A1AF' : color,
                                fontSize: 16,
                                lineHeight: 22,
                                letterSpacing: -0.16,
                                includeFontPadding: false,
                                transform: [{ translateY: -1.4 }],
                              }}
                            >
                              {label}
                            </Text>
                            {disabled && (
                              <Text className="font-sans text-[12px] leading-4 text-[#6A7282]">
                                {disabledMessage}
                              </Text>
                            )}
                          </View>
                        </View>
                        <CaretRightIcon size={20} color="#000A3161" />
                        <InteractionLayer pressed={pressed} color="#000212D1" />
                      </>
                    )}
                  </Pressable>
                ),
              )}
            </View>
            <View style={{ height: 72, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
              <Pressable
                accessibilityRole="button"
                onPress={closePostMenu}
                disabled={deleteBusy}
                style={{
                  height: 52,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#00264E0D',
                  overflow: 'hidden',
                }}
              >
                {({ pressed }) => (
                  <>
                    <Text
                      style={{
                        fontFamily: 'Pretendard',
                        color: '#000419AA',
                        fontSize: 18,
                        lineHeight: 24,
                        letterSpacing: -0.18,
                        includeFontPadding: false,
                        transform: [{ translateY: -1.2 }],
                      }}
                    >
                      닫기
                    </Text>
                    <InteractionLayer pressed={pressed} color="#000212D1" />
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      {viewerIndex !== null && (
        <PostPhotoViewer
          photos={post.photos}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
      <Modal
        visible={mapOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setMapOpen(false)}
      >
        <View className="flex-1 bg-white" style={{ paddingBottom: insets.bottom }}>
          <TopNavigation type="screen" title="교환 장소" onBack={() => setMapOpen(false)} />
          {mapOpen && post.locationPoint && <MapCanvas point={post.locationPoint} />}
          <Text className="px-4 py-4 font-sans text-[14px] leading-[22px] text-[#364153]">
            {post.location}
          </Text>
        </View>
      </Modal>
    </View>
  );
}
