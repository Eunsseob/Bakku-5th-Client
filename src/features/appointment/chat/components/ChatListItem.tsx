import { Image } from 'expo-image';
import { BellSlashIcon } from 'phosphor-react-native/src/icons/BellSlash';
import { Pressable, Text, View } from 'react-native';

import { semantic } from '@/design-tokens';
import { Icon } from '@/shared/components';

import type { ChatRoomSummary } from '../types';
import { formatListTime } from '../utils/formatTime';
import { ExchangeStatusBadge } from './StatusBadges';
import { WIRE, WireCount } from './wire';

type ChatListItemProps = {
  room: ChatRoomSummary;
  onPress: () => void;
};

// 채팅 목록 한 줄: 사진 56 · 닉네임 16 SemiBold · 마지막 메시지 14 · 시각 12 · 안 읽은 수
export function ChatListItem({ room, onPress }: ChatListItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${room.nickname} 채팅방${room.unreadCount ? `, 안 읽은 메시지 ${room.unreadCount}개` : ''}`}
      onPress={onPress}
      className="flex-row items-center gap-3 px-4 py-2.5"
      style={({ pressed }) => ({ backgroundColor: pressed ? semantic.fill.subtlest : undefined })}
    >
      {room.thumbnailUrl ? (
        <Image
          source={room.thumbnailUrl}
          contentFit="cover"
          style={{ width: 56, height: 56, borderRadius: 12 }}
        />
      ) : (
        <View className="size-14 rounded-12 bg-gray-75" />
      )}
      <View className="flex-1 gap-1">
        <View className="flex-row items-center gap-2">
          <Text
            numberOfLines={1}
            className="shrink font-sans text-label-lg font-semibold text-black"
          >
            {room.nickname}
          </Text>
          <ExchangeStatusBadge status={room.status} hideAvailable />
          {room.muted ? <Icon icon={BellSlashIcon} size="md" color={WIRE.assistive} /> : null}
        </View>
        <Text numberOfLines={1} className="font-sans text-label-md font-normal text-gray-500">
          {room.lastMessage}
        </Text>
      </View>
      <View className="items-end justify-center gap-1 self-stretch">
        <Text className="font-sans text-label-sm font-normal text-gray-500">
          {formatListTime(room.lastMessageAt)}
        </Text>
        {room.unreadCount > 0 ? <WireCount count={room.unreadCount} /> : null}
      </View>
    </Pressable>
  );
}
