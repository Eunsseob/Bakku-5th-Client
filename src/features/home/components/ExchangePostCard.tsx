import { Divider } from '@/shared/components/Divider';
import { Icon } from '@/shared/components/Icon';
import { IconButton } from '@/shared/components/IconButton';
import { Tag } from '@/shared/components/Tag';
import { Thumbnail } from '@/shared/components/Thumbnail';
import { DotsThreeVerticalIcon } from 'phosphor-react-native/src/icons/DotsThreeVertical';
import { MapPinIcon } from 'phosphor-react-native/src/icons/MapPin';
import { Pressable, Text, View } from 'react-native';
import type { ExchangePost } from '../store/useExchangeStore';

export default function ExchangePostCard({
  post,
  onPress,
  onMore,
}: {
  post: ExchangePost;
  onPress: () => void;
  onMore: () => void;
}) {
  return (
    <View className="pt-4">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${post.title} 상세 보기`}
        onPress={onPress}
      >
        <View className="flex-row gap-3">
          <Thumbnail
            source={post.photos?.[0]}
            size={112}
            cornerStyle="curved"
            variant="hollow"
            accessibilityLabel="굿즈 사진"
          />
          <View className="min-w-0 flex-1 gap-2 pr-6">
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
                {post.location}
              </Text>
            </View>
            <Text className="font-sans text-[12px] leading-[18px] text-[#99A1AF]">
              {post.minutes}분 전
            </Text>
            {post.onsite !== false && (
              <Tag hierarchy="secondary" size="sm" className="self-start !rounded !bg-[#E5E7EB]">
                {post.remaining > 0 ? `남은 시간 ${post.remaining}분` : '교환 마감'}
              </Tag>
            )}
          </View>
        </View>
        <View className="mt-3 h-10 flex-row items-center gap-3 rounded-lg bg-[#F3F4F6] px-3">
          <Text className="font-sans text-[14px] leading-5 text-[#99A1AF]">원해요</Text>
          <Text numberOfLines={1} className="flex-1 font-sans text-[14px] leading-5 text-[#4A5565]">
            {post.wantedDetail || post.wanted}
          </Text>
        </View>
      </Pressable>
      <View className="absolute right-0 top-3">
        <IconButton
          icon={DotsThreeVerticalIcon}
          size="lg"
          accessibilityLabel={`${post.title} 더보기`}
          onPress={onMore}
        />
      </View>
      <View className="mt-4">
        <Divider />
      </View>
    </View>
  );
}
