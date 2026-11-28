import { semantic } from '@/design-tokens';
import { Badge, Divider, Icon, IconButton, TextDivider, Thumbnail } from '@/shared/components';
import { ArrowsClockwiseIcon } from 'phosphor-react-native/src/icons/ArrowsClockwise';
import { DotsThreeVerticalIcon } from 'phosphor-react-native/src/icons/DotsThreeVertical';
import { Pressable, Text, View } from 'react-native';
import type { HomePost } from '../api/homePosts';
import { postImageSource } from '../api/postDetail';

const secondsPerDay = 86_400;

function timeAgo(createdAt: string, now: number) {
  const seconds = Math.max(0, Math.floor((now - Date.parse(createdAt)) / 1000));
  if (!Number.isFinite(seconds)) return null;
  if (seconds < 60) return `${seconds}초 전`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
  if (seconds < secondsPerDay) return `${Math.floor(seconds / 3600)}시간 전`;
  const days = Math.floor(seconds / secondsPerDay);
  if (days < 7) return `${days}일 전`;
  if (days < 30) return `${Math.floor(days / 7)}주 전`;
  return `${Math.floor(days / 30)}달 전`;
}

export default function ExchangePostCard({
  post,
  now,
  onPress,
  onMore,
  accessToken,
}: {
  post: HomePost;
  now: number;
  onPress: () => void;
  onMore: () => void;
  accessToken: string | null | undefined;
}) {
  const age = timeAgo(post.createdAt, now);
  const remainingMs = Date.parse(post.nowExchangeEndsAt ?? '') - now;
  const expiringSoon = post.nowExchange && remainingMs > 0 && remainingMs <= 10 * 60_000;
  const accessibilityLabel = [
    `${post.title} 상세 보기`,
    post.regionName,
    age,
    expiringSoon ? '곧 만료' : null,
    post.nowExchange ? '지금교환' : null,
    `바꾸고 싶은 아이템: ${post.wantedItem ?? '상관없음'}`,
  ]
    .filter(Boolean)
    .join(', ');
  const thumbnail =
    post.thumbnailUrl && accessToken ? postImageSource(post.thumbnailUrl, accessToken) : null;
  return (
    <View className="gap-4">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
      >
        <View className="min-h-[128px] flex-row items-start gap-3">
          <Thumbnail
            source={thumbnail}
            cachePolicy="none"
            size={128}
            cornerStyle="curved"
            variant="outlined"
            accessibilityLabel="굿즈 사진"
          />
          <View className="min-w-0 flex-1 gap-3 pt-1.5">
            <View className="gap-0.5">
              <Text
                numberOfLines={1}
                className="pr-11 font-sans text-label-lg font-medium text-object-bolder"
              >
                {post.title}
              </Text>
              <View className="flex-row items-center gap-1">
                <Text
                  numberOfLines={1}
                  className="shrink font-sans text-label-sm text-object-alternative"
                >
                  {post.regionName}
                </Text>
                {age !== null && (
                  <>
                    {post.regionName ? <TextDivider /> : null}
                    <Text className="font-sans text-label-sm text-object-alternative">{age}</Text>
                  </>
                )}
              </View>
              {post.nowExchange && (
                <View className="mt-1.5 flex-row flex-wrap items-center gap-1">
                  {expiringSoon && (
                    <Badge
                      theme="red"
                      variant="solid"
                      size="md"
                      className="min-h-[18px] min-w-[39px]"
                    >
                      곧 만료
                    </Badge>
                  )}
                  <Badge
                    hierarchy="accent"
                    variant="alpha"
                    size="md"
                    className="min-h-[18px] min-w-[46px]"
                  >
                    지금교환
                  </Badge>
                </View>
              )}
            </View>
            <View className="min-h-9 flex-row items-center gap-1.5 rounded-8 bg-surface-deep p-2">
              <Icon icon={ArrowsClockwiseIcon} size="sm" color={semantic.object.assistive} />
              <Text
                numberOfLines={1}
                className="flex-1 font-sans text-label-md font-medium text-object-normal"
              >
                {post.wantedItem ?? '상관없음'}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
      <IconButton
        icon={DotsThreeVerticalIcon}
        accessibilityLabel={`${post.title} 더보기`}
        size="lg"
        className="absolute right-0 top-0 z-10 h-11 w-11"
        onPress={onMore}
      />
      <Divider />
    </View>
  );
}
