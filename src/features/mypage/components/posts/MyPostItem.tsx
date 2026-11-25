import { semantic } from '@/design-tokens';
import { ArrowsClockwiseIcon } from 'phosphor-react-native/src/icons/ArrowsClockwise';
import { DotsThreeVerticalIcon } from 'phosphor-react-native/src/icons/DotsThreeVertical';
import { Text, View } from 'react-native';

import { Badge, Divider, Icon, IconButton, TextDivider, Thumbnail } from '@/shared/components';

import type { MyPost } from '../../api/mockMyPosts';

// BDS Feed Item (G-2 내 교환글 카드): 썸네일 128 · 제목 · 위치 · 시간 · 배지 · 바꾸고 싶은 아이템

/** 0초 전 · 3분 전 · 5시간 전 · 2일 전 */
function timeAgo(iso: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 1000));
  if (seconds < 60) return `${seconds}초 전`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)}시간 전`;
  return `${Math.floor(seconds / 86_400)}일 전`;
}

function Badges({ post }: { post: MyPost }) {
  if (post.status === 'COMPLETED') {
    return (
      <Badge hierarchy="tertiary" variant="alpha" size="md" muted>
        교환 완료
      </Badge>
    );
  }
  if (!post.nowExchange && post.status !== 'RESERVED') return null;
  return (
    <View className="flex-row items-center gap-1">
      {post.nowExchange ? (
        <Badge hierarchy="accent" variant="alpha" size="md">
          지금교환
        </Badge>
      ) : null}
      {post.status === 'AVAILABLE' && post.expiringSoon ? (
        <Badge theme="red" variant="solid" size="md">
          곧 만료
        </Badge>
      ) : null}
      {post.status === 'RESERVED' ? (
        <Badge hierarchy="tertiary" variant="alpha" size="md">
          예약중
        </Badge>
      ) : null}
    </View>
  );
}

type MyPostItemProps = {
  post: MyPost;
  onMore: () => void;
};

export function MyPostItem({ post, onMore }: MyPostItemProps) {
  return (
    <View className="gap-4">
      <View className="flex-row items-start gap-3">
        <Thumbnail
          source={post.thumbnailUrl}
          size={128}
          cornerStyle="curved"
          variant="outlined"
          accessibilityLabel="굿즈 사진"
        />
        <View className="flex-1 gap-3">
          <View className="gap-2">
            <View className="gap-0.5">
              <View className="flex-row items-start gap-2">
                <Text
                  numberOfLines={1}
                  className="flex-1 font-sans text-label-lg font-medium text-object-bolder"
                >
                  {post.title}
                </Text>
                <View className="py-px">
                  <IconButton
                    icon={DotsThreeVerticalIcon}
                    accessibilityLabel="더보기"
                    size="lg"
                    onPress={onMore}
                  />
                </View>
              </View>
              <View className="flex-row items-center gap-1">
                <Text
                  numberOfLines={1}
                  className="shrink font-sans text-label-sm font-normal text-object-alternative"
                >
                  {post.regionName}
                </Text>
                <TextDivider />
                <Text className="font-sans text-label-sm font-normal text-object-alternative">
                  {timeAgo(post.createdAt)}
                </Text>
              </View>
            </View>
            <Badges post={post} />
          </View>
          {/* Callout: 바꾸고 싶은 아이템 */}
          <View className="flex-row items-start gap-1.5 rounded-8 bg-surface-deep p-2">
            <View className="py-[3px]">
              <Icon icon={ArrowsClockwiseIcon} size="sm" color={semantic.object.assistive} />
            </View>
            <Text
              numberOfLines={1}
              className="flex-1 font-sans text-label-md font-medium text-object-normal"
            >
              {post.wantedItem ?? '상관없음'}
            </Text>
          </View>
        </View>
      </View>
      <Divider />
    </View>
  );
}
