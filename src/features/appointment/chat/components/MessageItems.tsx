import { Image } from 'expo-image';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { semantic } from '@/design-tokens';
import { CompletionCard } from '@/features/completion/review';
import { Icon } from '@/shared/components';

import type { ChatMessage, ExchangeItem } from '../types';
import { formatClock, formatDateDivider } from '../utils/formatTime';
import { ProposalCard } from './AppointmentCards';
import { ItemConditionBadge } from './StatusBadges';

/** 말풍선 글자: body/md 크기에 행간 18 (BDS Chatbubble/message, 15/18 스타일이 따로 없다) */
const BUBBLE_TEXT = 'text-body-md leading-[18px]';

/** BDS Timedivider: [선 118] 날짜 label/sm subtle [선 118], 선은 stroke/subtle */
export function DateDivider({ date }: { date: string }) {
  return (
    <View className="flex-row items-center pb-1 pt-2">
      <View className="h-px w-[118px] bg-stroke-subtle" />
      <Text className="flex-1 text-center font-sans text-label-sm font-normal text-object-assistive">
        {formatDateDivider(date)}
      </Text>
      <View className="h-px w-[118px] bg-stroke-subtle" />
    </View>
  );
}

/**
 * 말풍선 줄: 반대쪽을 64 비우고, 시각(BDS Chatbubble/time: label/xs subtle)은 말풍선 옆 아래에 붙는다.
 * fullWidth: 폭이 정해진 카드(약속 카드 250)는 반대쪽을 비우지 않는다
 */
function Row({
  mine,
  sentAt,
  fullWidth = false,
  children,
}: {
  mine: boolean;
  sentAt: string;
  fullWidth?: boolean;
  children: ReactNode;
}) {
  const time = (
    <Text className="font-sans text-label-xs font-normal text-object-subtle">
      {formatClock(sentAt)}
    </Text>
  );
  const reserve = fullWidth ? '' : mine ? 'pl-16' : 'pr-16';
  return (
    <View
      className={`flex-row items-end gap-2 ${mine ? 'justify-end' : 'justify-start'} ${reserve}`}
    >
      {mine ? time : null}
      <View className="shrink">{children}</View>
      {mine ? null : time}
    </View>
  );
}

/**
 * BDS Chatbubble/itemcard: 교환 요청 물건마다 카드 하나 (247 · r16 · 테두리 stroke/alpha/subtler)
 * 사진 136 → [이름 body/md bold] [개봉 여부 배지 · 화살표 14]
 */
function ItemCard({ item, onPress }: { item: ExchangeItem; onPress?: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.name}
      onPress={onPress}
      className="w-[247px] overflow-hidden rounded-16 border border-stroke-alpha-subtler"
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      {item.imageUrl ? (
        <Image source={item.imageUrl} contentFit="cover" style={{ height: 136 }} />
      ) : (
        <View className="h-[136px] bg-object-inverse-bolder" />
      )}
      <View className="flex-row items-center gap-2.5 rounded-16 bg-surface-standard px-2.5 py-3">
        <Text
          numberOfLines={1}
          className="flex-1 font-sans text-body-md font-medium text-object-bolder"
        >
          {item.name}
        </Text>
        <View className="flex-row items-center gap-1">
          <ItemConditionBadge condition={item.condition} />
          <Icon icon={CaretRightIcon} size="sm" color={semantic.object.alternative} />
        </View>
      </View>
    </Pressable>
  );
}

type MessageItemProps = {
  message: ChatMessage;
  onRequestItemPress?: (item: ExchangeItem) => void;
  onAcceptProposal?: (messageId: string) => void;
  onRejectProposal?: (messageId: string) => void;
  /** 내가 보낸 제안 [약속 취소] (A-6 철회) */
  onWithdrawProposal?: (messageId: string) => void;
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
  onWithdrawProposal,
  onCompleteExchange,
  onCancelExchange,
}: MessageItemProps) {
  const mine = message.sender === 'me';

  if (message.type === 'system') {
    // 서버 시스템 메시지 · 따로 그릴 카드가 없는 카드: 가운데 회색 안내
    return (
      <Text className="self-center px-4 py-1 text-center font-sans text-label-sm font-normal text-object-alternative">
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
    // BDS Chatbubble/reserve: 받은 카드는 [카드 8 시각], 보낸 카드는 [시각 8 카드]
    return (
      <Row mine={mine} sentAt={message.sentAt} fullWidth>
        <ProposalCard
          mine={mine}
          appointment={message.appointment}
          state={message.state}
          onAccept={() => onAcceptProposal?.(message.id)}
          onReject={() => onRejectProposal?.(message.id)}
          onWithdraw={() => onWithdrawProposal?.(message.id)}
        />
      </Row>
    );
  }

  if (message.type === 'request') {
    // BDS Chatbubble/items (E-2-1 · E-2-2): 받은 쪽 · 보낸 쪽 모두 물건마다 카드 + 시각
    return (
      <View className="gap-5">
        {message.items.map((item) => (
          <Row key={item.id} mine={mine} sentAt={message.sentAt} fullWidth>
            <ItemCard item={item} onPress={() => onRequestItemPress?.(item)} />
          </Row>
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

  // BDS Chatbubble/message: 최대 247 · 안쪽 10·8 · r12
  // received: accent/bold 바탕 흰 글자, sent: surface/deeper 바탕 gray/800 글자
  return (
    <Row mine={mine} sentAt={message.sentAt}>
      <View
        className={`max-w-[247px] rounded-12 px-2.5 py-2 ${mine ? 'bg-surface-deeper' : 'bg-accent-bold'}`}
      >
        <Text
          className={`font-sans font-normal ${BUBBLE_TEXT} ${mine ? 'text-gray-800' : 'text-object-inverse-boldest'}`}
        >
          {message.text}
        </Text>
      </View>
    </Row>
  );
}
