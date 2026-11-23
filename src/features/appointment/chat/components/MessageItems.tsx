import { Image } from 'expo-image';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { CompletionCard } from '@/features/completion/review';
import { Icon } from '@/shared/components';

import type { ChatMessage, ExchangeItem } from '../types';
import { formatClock, formatDateDivider } from '../utils/formatTime';
import { ProposalCard } from './AppointmentCards';
import { ItemConditionBadge } from './StatusBadges';
import { WIRE } from './wire';

/** 말풍선 글자: body/md 크기에 와이어프레임 행간 18 (BDS 에 15/18 스타일이 없다) */
const BUBBLE_TEXT = 'text-body-md leading-[18px]';

export function DateDivider({ date }: { date: string }) {
  return (
    <Text className="py-3 text-center font-sans text-label-sm font-normal text-gray-500">
      {formatDateDivider(date)}
    </Text>
  );
}

/** 말풍선 줄: 반대쪽을 64 비우고, 시각(11)은 말풍선 옆 아래에 붙는다 */
function Row({ mine, sentAt, children }: { mine: boolean; sentAt: string; children: ReactNode }) {
  const time = (
    <Text className="font-sans text-label-xs font-normal text-gray-300">{formatClock(sentAt)}</Text>
  );
  return (
    <View
      className={`flex-row items-end gap-2 ${mine ? 'justify-end pl-16' : 'justify-start pr-16'}`}
    >
      {mine ? time : null}
      <View className="shrink">{children}</View>
      {mine ? null : time}
    </View>
  );
}

/** 받은 교환 요청: 물건마다 사진 카드 하나 (247 × 사진 136) */
function RequestItemCard({ item, onPress }: { item: ExchangeItem; onPress?: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.name}
      onPress={onPress}
      className="overflow-hidden rounded-12 bg-white"
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      {item.imageUrl ? (
        <Image source={item.imageUrl} contentFit="cover" style={{ height: 136 }} />
      ) : (
        <View className="h-[136px] bg-gray-75" />
      )}
      <View className="flex-row items-center gap-2.5 px-2.5 py-3">
        <Text numberOfLines={1} className="flex-1 font-sans text-body-md font-medium text-black">
          {item.name}
        </Text>
        <ItemConditionBadge condition={item.condition} />
      </View>
    </Pressable>
  );
}

/** 보낸 교환 요청: 한 장짜리 목록 카드 */
function RequestCard({
  items,
  onItemPress,
}: {
  items: ExchangeItem[];
  onItemPress?: (item: ExchangeItem) => void;
}) {
  return (
    <View className="gap-2 rounded-12 bg-white py-3">
      <Text className="px-2.5 font-sans text-body-md font-medium text-gray-900">
        교환 요청을 보냈어요
      </Text>
      <View className="h-px bg-gray-75" />
      <View>
        {items.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            onPress={() => onItemPress?.(item)}
            className="h-11 flex-row items-center gap-2 px-2.5"
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text
              numberOfLines={1}
              className="shrink font-sans text-body-sm font-normal text-gray-700"
            >
              {item.name}
            </Text>
            <ItemConditionBadge condition={item.condition} />
            <View className="ml-auto">
              <Icon icon={CaretRightIcon} size="md" color={WIRE.assistive} />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

type MessageItemProps = {
  message: ChatMessage;
  onRequestItemPress?: (item: ExchangeItem) => void;
  onAcceptProposal?: (messageId: string) => void;
  onRejectProposal?: (messageId: string) => void;
  /** F-1 [무사히 교환했어요] */
  onCompleteExchange?: (messageId: string) => void;
  /** F-1 [교환하지 못했어요] */
  onCancelExchange?: (messageId: string) => void;
};

export function MessageItem({
  message,
  onRequestItemPress,
  onAcceptProposal,
  onRejectProposal,
  onCompleteExchange,
  onCancelExchange,
}: MessageItemProps) {
  const mine = message.sender === 'me';

  if (message.type === 'system') {
    // 서버 시스템 메시지 · 따로 그릴 카드가 없는 카드: 가운데 회색 안내
    return (
      <Text className="self-center px-4 py-1 text-center font-sans text-label-sm font-normal text-gray-500">
        {message.text}
      </Text>
    );
  }

  if (message.type === 'completion') {
    // 바꾸가 보내는 안내 카드라 보낸 사람과 상관없이 왼쪽, 시각은 카드 오른쪽 아래
    return (
      <Row mine={false} sentAt={message.sentAt}>
        <CompletionCard
          appointment={message.appointment}
          state={message.state}
          onComplete={() => onCompleteExchange?.(message.id)}
          onFail={() => onCancelExchange?.(message.id)}
        />
      </Row>
    );
  }

  if (message.type === 'proposal') {
    return (
      <View className={`w-[247px] ${mine ? 'self-end' : 'self-start'}`}>
        <ProposalCard
          mine={mine}
          appointment={message.appointment}
          state={message.state}
          onAccept={() => onAcceptProposal?.(message.id)}
          onReject={() => onRejectProposal?.(message.id)}
        />
      </View>
    );
  }

  if (message.type === 'request') {
    if (mine) {
      return (
        <View className="w-[247px] self-end">
          <RequestCard items={message.items} onItemPress={onRequestItemPress} />
        </View>
      );
    }
    return (
      <View className="w-[247px] gap-2 self-start">
        {message.items.map((item) => (
          <RequestItemCard key={item.id} item={item} onPress={() => onRequestItemPress?.(item)} />
        ))}
      </View>
    );
  }

  if (message.type === 'image') {
    return (
      <Row mine={mine} sentAt={message.sentAt}>
        <Image
          source={message.uri}
          contentFit="cover"
          accessibilityLabel="보낸 사진"
          style={{ width: 200, height: 200, borderRadius: 12 }}
        />
      </Row>
    );
  }

  return (
    <Row mine={mine} sentAt={message.sentAt}>
      <View className={`rounded-12 px-2.5 py-2 ${mine ? 'bg-gray-600' : 'bg-white'}`}>
        <Text
          className={`font-sans font-normal ${BUBBLE_TEXT} ${mine ? 'text-white' : 'text-gray-850'}`}
        >
          {message.text}
        </Text>
      </View>
    </Row>
  );
}
