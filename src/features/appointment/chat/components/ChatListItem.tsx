import { Image } from 'expo-image';
import { BellSlashIcon } from 'phosphor-react-native/src/icons/BellSlash';
import { Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { semantic } from '@/design-tokens';
import { Icon } from '@/shared/components';

import type { ChatRoomSummary } from '../types';
import { formatListTime } from '../utils/formatTime';
import { ChatListStatusBadge } from './StatusBadges';

// BDS 채팅 리스트 Chat List (state=reserved · completed · default)
// [썸네일 56] 12 [닉네임 label/lg bold · 상태 배지 · 알림 끔 16 (사이 4) / 채팅 내용 label/md] [시간 label/sm · 안 읽은 수]

/** BDS thumbnail=none 의 바꾸 로고 (26 × 28) */
const LOGO_PATH =
  'M25.5533 11.9533C24.5149 7.91646 22.6369 3.88942 18.9006 1.70402C15.6959 -0.171994 11.736 -0.510853 8.23821 0.746368C2.8325 2.69113 -0.401974 7.8919 0.0402207 13.2204C0.164433 14.7428 1.66491 15.1258 3.16539 14.7624C4.25846 14.4972 5.31674 13.9177 6.1117 13.132C7.17992 12.0859 7.1352 10.7157 7.41344 9.35539C7.88047 7.06685 10.6678 5.67703 12.8837 6.29091C15.5021 7.01283 16.3716 10.8041 13.9818 12.3167L3.47841 18.9663C2.61389 19.5261 2.30088 20.6556 2.79276 21.5544C5.67944 26.8337 12.1186 29.3678 17.9963 27.2561C24.3708 24.9626 27.1631 18.2247 25.5533 11.9631V11.9533ZM22.5723 19.5408L20.6693 19.3444C20.4557 19.3199 20.252 19.4377 20.1625 19.6342L19.3875 21.3579C19.1937 21.7901 18.5478 21.7262 18.4484 21.2597L18.0509 19.4132C18.0062 19.2069 17.8323 19.0497 17.6187 19.0252L15.7158 18.8287C15.2388 18.7796 15.1046 18.151 15.517 17.9153L17.1715 16.9724C17.3603 16.8643 17.4547 16.6532 17.41 16.4469L17.0125 14.6004C16.9132 14.1338 17.4746 13.8146 17.8323 14.1338L19.2533 15.3959C19.4123 15.5384 19.6458 15.5629 19.8346 15.4549L21.4891 14.512C21.9065 14.2762 22.3884 14.7035 22.1897 15.1357L21.4146 16.8594C21.3252 17.0559 21.3749 17.2818 21.5338 17.4242L22.9548 18.6863C23.3126 19.0055 23.0492 19.59 22.5723 19.5408Z';

/** BDS thumbnail: 56 r12, 사진이 없으면 회색 바탕에 로고 */
function ChatThumbnail({ uri }: { uri?: string | null }) {
  return (
    <View className="size-14 items-center justify-center overflow-hidden rounded-12 bg-surface-deepest">
      {uri ? (
        <Image source={uri} contentFit="cover" style={{ width: 56, height: 56 }} />
      ) : (
        <Svg width={26} height={28} viewBox="0 0 26 28" fill="none">
          <Path d={LOGO_PATH} fill={semantic.object.subtler} />
        </Svg>
      )}
    </View>
  );
}

/** BDS Chatlist/number: 안 읽은 메시지 수 (99 초과면 +99) */
function UnreadCount({ count }: { count: number }) {
  return (
    <View className="h-5 items-center justify-center rounded-8 bg-accent-bold px-1.5 py-0.5">
      <Text className="text-center font-sans text-label-xs font-medium text-object-inverse-boldest">
        {count > 99 ? '+99' : count}
      </Text>
    </View>
  );
}

type ChatListItemProps = {
  room: ChatRoomSummary;
  onPress: () => void;
};

export function ChatListItem({ room, onPress }: ChatListItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${room.nickname} 채팅방${room.unreadCount ? `, 안 읽은 메시지 ${room.unreadCount}개` : ''}`}
      onPress={onPress}
      className="h-14 flex-row items-center gap-3"
      style={({ pressed }) => ({ backgroundColor: pressed ? semantic.fill.subtlest : undefined })}
    >
      <ChatThumbnail uri={room.thumbnailUrl} />
      <View className="flex-1 gap-1">
        <View className="flex-row items-center gap-1">
          <Text
            numberOfLines={1}
            className="shrink font-sans text-label-lg font-semibold text-object-boldest"
          >
            {room.nickname}
          </Text>
          {/* BDS Badge 는 self-start 라서 감싸서 세로 가운데에 둔다 */}
          <View>
            <ChatListStatusBadge status={room.status} />
          </View>
          {room.muted ? (
            <Icon icon={BellSlashIcon} size="md" color={semantic.object.subtle} />
          ) : null}
        </View>
        <Text
          numberOfLines={1}
          className="font-sans text-label-md font-normal text-object-assistive"
        >
          {room.lastMessage}
        </Text>
      </View>
      <View className="items-end gap-1">
        <Text className="text-right font-sans text-label-sm font-normal text-object-alternative">
          {formatListTime(room.lastMessageAt)}
        </Text>
        {/* 안 읽은 수가 없어도 같은 높이를 비워 시간 위치를 맞춘다 (state=completed) */}
        {room.unreadCount > 0 ? <UnreadCount count={room.unreadCount} /> : <View className="h-5" />}
      </View>
    </Pressable>
  );
}
