import { Divider, Icon, Tag, Thumbnail } from '@/shared/components';
import { MapPinIcon } from 'phosphor-react-native/src/icons/MapPin';
import { Pressable, Text, View } from 'react-native';
import type { HomePost } from '../api/homePosts';
import { postImageSource } from '../api/postDetail';

export default function ExchangePostCard({
  post,
  onPress,
  accessToken,
}: {
  post: HomePost;
  onPress: () => void;
  accessToken: string | null | undefined;
}) {
  const now = Date.now();
  const minutes = Math.max(0, Math.floor((now - Date.parse(post.createdAt)) / 60_000));
  const remaining = Math.ceil((Date.parse(post.nowExchangeEndsAt ?? '') - now) / 60_000);
  const thumbnail =
    post.thumbnailUrl && accessToken ? postImageSource(post.thumbnailUrl, accessToken) : null;
  return (
    <View className="pt-4">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${post.title} 상세 보기`}
        onPress={onPress}
      >
        <View className="flex-row gap-3">
          <Thumbnail
            source={thumbnail}
            cachePolicy="none"
            size={112}
            cornerStyle="curved"
            variant="hollow"
            accessibilityLabel="굿즈 사진"
          />
          <View className="min-w-0 flex-1 gap-2">
            <Text
              numberOfLines={2}
              className="font-sans text-[16px] leading-[22px] tracking-[-0.16px] text-[#030712]"
            >
              {post.title}
            </Text>
            <View className="flex-row items-center gap-1">
              <Icon icon={MapPinIcon} size="md" color="#99A1AF" />
              <Text
                numberOfLines={1}
                className="flex-1 font-sans text-[12px] leading-[18px] text-[#99A1AF]"
              >
                {post.regionName}
              </Text>
            </View>
            <Text className="font-sans text-[12px] leading-[18px] text-[#99A1AF]">
              {Number.isFinite(minutes) ? `${minutes}분 전` : null}
            </Text>
            {post.nowExchange && (
              <Tag hierarchy="secondary" size="sm" className="self-start !rounded !bg-[#E5E7EB]">
                {remaining > 0 ? `남은 시간 ${remaining}분` : '교환 마감'}
              </Tag>
            )}
          </View>
        </View>
        <View className="mt-3 h-10 flex-row items-center gap-3 rounded-lg bg-[#F3F4F6] px-3">
          <Text className="font-sans text-[14px] leading-5 text-[#99A1AF]">원해요</Text>
          <Text numberOfLines={1} className="flex-1 font-sans text-[14px] leading-5 text-[#4A5565]">
            {post.wantedItem ?? '상관없음'}
          </Text>
        </View>
      </Pressable>
      <View className="mt-4">
        <Divider />
      </View>
    </View>
  );
}
