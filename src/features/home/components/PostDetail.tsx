import { useSignupStore } from '@/features/auth/store/useSignupStore';
import { Button } from '@/shared/components/Button';
import { Divider } from '@/shared/components/Divider';
import { Icon } from '@/shared/components/Icon';
import { IconButton } from '@/shared/components/IconButton';
import { LabelButton } from '@/shared/components/LabelButton';
import { Tag } from '@/shared/components/Tag';
import { Thumbnail } from '@/shared/components/Thumbnail';
import { TopNavigation } from '@/shared/components/TopNavigation';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ArrowLeftIcon } from 'phosphor-react-native/src/icons/ArrowLeft';
import { DotsThreeVerticalIcon } from 'phosphor-react-native/src/icons/DotsThreeVertical';
import { MapPinIcon } from 'phosphor-react-native/src/icons/MapPin';
import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useExchangeStore } from '../store/useExchangeStore';
import MapCanvas from './MapCanvas';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row gap-4">
      <Text className="w-[49px] font-sans text-[14px] leading-[22px] text-[#6A7282]">{label}</Text>
      <Text className="flex-1 font-sans text-[14px] leading-[22px] text-[#030712]">{value}</Text>
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
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: photoWidth }} className="overflow-hidden bg-[#E5E7EB]">
          {post.photos?.length ? (
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
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
              icon={ArrowLeftIcon}
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
          <View className="absolute bottom-3 left-3 flex-row gap-2">
            <Tag hierarchy="primary" size="sm" className="!rounded !bg-[#4A5565] !px-1.5 !py-0.5">
              {isNow ? '지금 교환' : '일반 교환'}
            </Tag>
            {post.wanted === '상관없음' && (
              <Tag
                hierarchy="secondary"
                size="sm"
                className="!rounded border border-[#E5E7EB] !bg-[#F9FAFB]"
              >
                제시 가능
              </Tag>
            )}
          </View>
        </View>
        <View className="px-4 pt-4">
          <Text
            accessibilityRole="header"
            className="font-sans text-[20px] leading-[26px] tracking-[-0.2px] text-[#030712]"
          >
            {post.title}
          </Text>
          <Text className="mt-2 font-sans text-[14px] leading-[22px] text-[#6A7282]">
            {post.location} · {post.minutes}분 전
          </Text>
          <View className="mt-2 flex-row flex-wrap items-center gap-2">
            {isNow && (
              <Tag hierarchy="primary" size="sm" className="!rounded !bg-[#6A7282]">
                {post.remaining > 0 ? `${post.remaining}분 남음` : '교환 마감'}
              </Tag>
            )}
            <Tag hierarchy="secondary" size="sm" className="!rounded !bg-[#F3F4F6]">
              {isNow && post.remaining <= 0 ? '교환 종료' : '교환 가능'}
            </Tag>
            <Text className="ml-auto font-sans text-[12px] leading-[18px] text-[#6A7282]">
              요청 {requestCount} · 조회 {post.viewCount ?? 0}
            </Text>
          </View>
          <View className="mt-5">
            <Divider />
          </View>
          <View className="mt-4 gap-2">
            <InfoRow label="카테고리" value={post.category} />
            <InfoRow label="상품상태" value={post.condition?.join(' · ') || '등록된 상태 없음'} />
            <InfoRow label="원해요" value={post.wantedDetail || post.wanted} />
          </View>
          <Text className="mb-[72px] mt-5 font-sans text-[16px] leading-[26px] text-[#364153]">
            {post.description || '등록된 상세 설명이 없어요.'}
          </Text>
          <Divider />
          <View className="mb-2 mt-4 flex-row items-center gap-4">
            <Text className="w-[49px] font-sans text-[14px] leading-[22px] text-[#6A7282]">
              교환장소
            </Text>
            <View className="flex-1 flex-row items-center gap-1">
              <Icon icon={MapPinIcon} size="md" color="#364153" />
              <Text className="flex-1 font-sans text-[14px] leading-[22px] text-[#030712]">
                {post.location}
              </Text>
            </View>
          </View>
          <View className="h-[120px] overflow-hidden rounded-2xl border border-black/10 bg-[#F3F4F6]">
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
              <View className="absolute bottom-2 right-2 rounded-lg bg-white px-1.5 py-[3px]">
                <LabelButton hierarchy="tertiary" size="sm" onPress={() => setMapOpen(true)}>
                  지도 보기
                </LabelButton>
              </View>
            )}
          </View>
          {!!post.locationDetail && (
            <Text className="mb-8 mt-2 font-sans text-[14px] leading-[22px] text-[#030712]">
              {post.locationDetail}
            </Text>
          )}
        </View>
        <View className="mt-8">
          <Divider thickness="boldest" />
        </View>
        <View className="min-h-[74px] flex-row items-center gap-3 px-4 py-3">
          <Thumbnail
            size={40}
            cornerStyle="rounded"
            variant="hollow"
            accessibilityLabel="작성자 프로필 이미지"
          />
          <View className="flex-1 gap-1">
            <Text className="font-sans text-[16px] leading-[22px] text-[#030712]">
              {authorName}
            </Text>
            <Text className="font-sans text-[13px] leading-5 text-[#6A7282]">
              교환 완료 {post.author?.completedExchanges ?? 0}회
            </Text>
          </View>
          <Text className="font-sans text-[14px] leading-5 text-[#6A7282]">
            매너 지표 {post.author?.mannerScore ?? '—'}
          </Text>
        </View>
      </ScrollView>
      <View className="bg-white px-4 pt-3" style={{ paddingBottom: 8 + insets.bottom }}>
        <Button
          hierarchy="primary"
          disabled={!!post.isMine && requestCount === 0}
          onPress={() =>
            Alert.alert(post.isMine ? '받은 교환 요청' : '교환 요청', '요청 화면은 준비 중이에요.')
          }
          className={`!h-[52px] w-full !rounded-xl ${post.isMine && requestCount === 0 ? '!bg-[#D1D5DC]' : '!bg-[#364153]'}`}
        >
          {actionLabel}
        </Button>
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
