import { useSignupStore } from '@/features/auth/store/useSignupStore';
import { Button } from '@/shared/components/Button';
import { Icon } from '@/shared/components/Icon';
import { IconButton } from '@/shared/components/IconButton';
import { Thumbnail } from '@/shared/components/Thumbnail';
import { TopNavigation } from '@/shared/components/TopNavigation';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { CaretLeftIcon } from 'phosphor-react-native/src/icons/CaretLeft';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';
import { DotsThreeVerticalIcon } from 'phosphor-react-native/src/icons/DotsThreeVertical';
import { MapPinIcon } from 'phosphor-react-native/src/icons/MapPin';
import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useExchangeStore } from '../store/useExchangeStore';
import MapCanvas from './MapCanvas';

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
  const post = useExchangeStore((state) => state.posts.find((item) => String(item.id) === id));
  const nickname = useSignupStore((state) => state.profile.nickname);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const photoWidth = width - insets.left - insets.right;
  const [mapOpen, setMapOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(main)/home');
  };

  if (!post)
    return (
      <View
        className="flex-1 items-center justify-center gap-6 bg-white px-4"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="font-sans text-[16px] text-[#364153]">게시글을 찾을 수 없어요.</Text>
        <Button hierarchy="primary" onPress={goBack}>
          돌아가기
        </Button>
      </View>
    );

  const requestCount = post.requestCount ?? 0;
  const isNow = post.onsite !== false;
  const authorName = post.author?.nickname ?? (post.isMine ? nickname : '작성자');
  const actionLabel = post.isMine
    ? requestCount > 0
      ? `받은 요청 ${requestCount}개 보기`
      : '아직 받은 요청이 없어요'
    : '교환 요청하기';

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingLeft: insets.left, paddingRight: insets.right }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        className="flex-1"
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{ paddingBottom: 0 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: photoWidth }} className="overflow-hidden bg-[#E5E7EB]">
          {post.photos?.length ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) =>
                setPhotoIndex(Math.round(event.nativeEvent.contentOffset.x / photoWidth))
              }
            >
              {post.photos.map((uri, index) => (
                <Image
                  key={`${uri}-${index}`}
                  source={uri}
                  accessibilityLabel={`굿즈 사진 ${index + 1}`}
                  style={{ width: photoWidth, height: photoWidth }}
                  contentFit="cover"
                />
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
              onPress={() =>
                Alert.alert(
                  '게시글 메뉴',
                  post.isMine
                    ? '게시글 수정·삭제 기능은 준비 중이에요.'
                    : '신고 기능은 준비 중이에요.',
                )
              }
            />
          </View>
          <View
            style={{ position: 'absolute', bottom: 12, left: 12, flexDirection: 'row', gap: 8 }}
          >
            <DetailBadge dark photo>
              {isNow ? '지금 교환' : '일반 교환'}
            </DetailBadge>
            {post.wanted === '상관없음' && <DetailBadge photo>제시 가능</DetailBadge>}
          </View>
          {!!post.photos?.length && (
            <View
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
                {photoIndex + 1} / {post.photos.length}
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
            <DetailBadge>{isNow && post.remaining <= 0 ? '교환 종료' : '교환 가능'}</DetailBadge>
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
            <InfoRow label="상품상태" value={post.condition?.join(' · ') || '등록된 상태 없음'} />
            <InfoRow label="원해요" value={post.wantedDetail || post.wanted} />
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
              <>
                <MapCanvas point={post.locationPoint} preview />
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: 32,
                    height: 32,
                    transform: [{ translateX: -16 }, { translateY: -32 }],
                  }}
                >
                  <View
                    style={{
                      position: 'absolute',
                      left: 10.67,
                      top: 6.67,
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: '#FFFFFF',
                    }}
                  />
                  <Icon icon={MapPinIcon} size="3xl" weight="fill" color="#364153" />
                </View>
              </>
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
              교환 완료 {post.author?.completedExchanges ?? 0}회
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
            매너 지표 {post.author?.mannerScore ?? '—'}
          </Text>
        </View>
      </ScrollView>
      <View
        style={{
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: Math.max(30, insets.bottom),
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !!post.isMine && requestCount === 0 }}
          disabled={!!post.isMine && requestCount === 0}
          onPress={() =>
            Alert.alert(post.isMine ? '받은 교환 요청' : '교환 요청', '요청 화면은 준비 중이에요.')
          }
          style={{
            height: 52,
            width: '100%',
            borderRadius: 12,
            backgroundColor: post.isMine && requestCount === 0 ? '#D1D5DC' : '#364153',
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
              color: post.isMine && requestCount === 0 ? '#99A1AF' : '#FFFFFF',
              includeFontPadding: false,
            }}
          >
            {actionLabel}
          </Text>
        </Pressable>
      </View>
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
