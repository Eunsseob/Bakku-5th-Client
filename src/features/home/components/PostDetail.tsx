import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ArrowLeftIcon } from 'phosphor-react-native/src/icons/ArrowLeft';
import { DotsThreeVerticalIcon } from 'phosphor-react-native/src/icons/DotsThreeVertical';
import { Alert, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/shared/components/Button';
import { Divider } from '@/shared/components/Divider';
import { IconButton } from '@/shared/components/IconButton';
import { Tag } from '@/shared/components/Tag';
import { Thumbnail } from '@/shared/components/Thumbnail';
import { useExchangeStore } from '../store/useExchangeStore';
import MapCanvas from './MapCanvas';

const font = { fontFamily: 'Pretendard', includeFontPadding: false };

export default function PostDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const post = useExchangeStore((state) => state.posts.find((item) => String(item.id) === id));
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const photoWidth = width - insets.left - insets.right;
  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(main)/home');
  };

  if (!post) {
    return (
      <View
        className="flex-1 items-center justify-center gap-6 bg-white px-4"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={font} className="text-[16px] text-[#2E2E33]">
          게시글을 찾을 수 없어요.
        </Text>
        <Button hierarchy="primary" onPress={goBack}>
          돌아가기
        </Button>
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingLeft: insets.left, paddingRight: insets.right }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="h-[300px] overflow-hidden rounded-[8px] bg-[#E0E0E6]">
          {post.photos?.length ? (
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
              {post.photos.map((uri, index) => (
                <Image
                  key={`${uri}-${index}`}
                  source={uri}
                  accessibilityLabel={`굿즈 사진 ${index + 1}`}
                  style={{ width: photoWidth, height: 300 }}
                  contentFit="cover"
                />
              ))}
            </ScrollView>
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text style={font} className="text-[13px] text-[#737380]">
                사진
              </Text>
            </View>
          )}
          <View
            className="absolute left-4 right-4 flex-row justify-between"
            style={{ top: insets.top + 12 }}
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
              onPress={() => Alert.alert('게시글 메뉴', '신고 기능은 준비 중이에요.')}
            />
          </View>
        </View>
        <View className="min-h-[72px] flex-row items-center gap-[10px] px-4 py-4">
          <Thumbnail
            size={40}
            cornerStyle="rounded"
            variant="hollow"
            accessibilityLabel="작성자 프로필 이미지"
          />
          <View className="min-w-0 flex-1">
            <Text style={font} className="text-[14px] leading-5 text-[#2E2E33]">
              {post.author?.nickname ?? '작성자'}
            </Text>
            <Text style={font} className="mt-0.5 text-[12px] leading-[17px] text-[#737380]">
              {post.location}
            </Text>
          </View>
          <View className="items-end">
            <Text style={font} className="text-[13px] leading-[18px] text-[#2E2E33]">
              매너 지표 {post.author?.mannerScore ?? '—'}
            </Text>
            <Text style={font} className="mt-1 text-[12px] leading-[17px] text-[#737380]">
              교환 완료 {post.author ? `${post.author.completedExchanges}회` : '—'}
            </Text>
          </View>
        </View>
        <Divider />
        <View className="px-4 pt-4">
          <Text
            accessibilityRole="header"
            style={font}
            className="text-[18px] leading-[25px] text-[#2E2E33]"
          >
            {post.title}
          </Text>
          <Text style={font} className="mt-[5px] text-[12px] leading-[17px] text-[#737380]">
            {post.category} · {post.minutes}분 전
          </Text>
          <View className="mt-[11px] flex-row flex-wrap gap-[6px]">
            {post.onsite !== false && (
              <Tag hierarchy="primary" size="sm">
                {post.remaining > 0 ? `현장 · ${post.remaining}분 남음` : '현장 교환 마감'}
              </Tag>
            )}
            {post.condition?.map((condition) => (
              <Tag key={condition} hierarchy="secondary" size="sm">
                {condition}
              </Tag>
            ))}
          </View>
          <View className="mt-[18px] min-h-[66px] justify-center rounded-[10px] bg-[#F5F5F7] px-[14px] py-[10px]">
            <Text style={font} className="text-[12px] leading-[17px] text-[#737380]">
              원해요
            </Text>
            <Text style={font} className="mt-[3px] text-[14px] leading-5 text-[#2E2E33]">
              {post.wantedDetail || post.wanted}
            </Text>
          </View>
          <View className="mt-[18px] flex-row gap-5">
            <Text style={font} className="w-[84px] text-[13px] leading-[18px] text-[#737380]">
              교환 개수
            </Text>
            <Text style={font} className="flex-1 text-[13px] leading-[18px] text-[#2E2E33]">
              {post.quantity || '협의 가능'}
            </Text>
          </View>
          <View className="mt-[10px] flex-row gap-5">
            <Text style={font} className="w-[84px] text-[13px] leading-[18px] text-[#737380]">
              희망 장소
            </Text>
            <Text style={font} className="flex-1 text-[13px] leading-[18px] text-[#2E2E33]">
              {post.locationDetail || post.location}
            </Text>
          </View>
          <View
            accessibilityLabel={`희망 장소: ${post.locationDetail || post.location}`}
            className="mt-[18px] h-[100px] overflow-hidden rounded-[10px] bg-[#E0E0E6]"
          >
            {post.locationPoint ? (
              <MapCanvas point={post.locationPoint} preview />
            ) : (
              <View className="flex-1 items-center justify-center px-4">
                <Text style={font} className="text-center text-[12px] text-[#737380]">
                  등록된 위치 좌표가 없어요.
                </Text>
              </View>
            )}
          </View>
          <Text style={font} className="mt-[18px] text-[14px] leading-5 text-[#2E2E33]">
            {post.description || '등록된 상세 설명이 없어요.'}
          </Text>
          {!!post.tags?.length && (
            <Text style={font} className="mt-4 text-[13px] leading-[18px] text-[#737380]">
              {post.tags.map((tag) => `#${tag}`).join(' ')}
            </Text>
          )}
          <Text style={font} className="mt-[26px] text-[12px] leading-[17px] text-[#737380]">
            요청 {post.requestCount ?? 0} · 조회 {post.viewCount ?? 0}
          </Text>
        </View>
      </ScrollView>
      <View
        className="border-t border-[#E0E0E6] px-4 pt-[14px]"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <Button
          hierarchy="primary"
          variant="solid"
          size="lg"
          className="w-full"
          onPress={() => Alert.alert('교환 요청', '교환 요청 화면은 준비 중이에요.')}
        >
          교환 요청하기
        </Button>
      </View>
    </View>
  );
}
