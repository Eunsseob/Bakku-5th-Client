import type {
  AppointmentResponse,
  AppointmentStatus,
  ConfirmationResponse,
} from '@/features/completion/review';
import type { CompletionState } from '@/features/completion/review/types';

import type {
  Appointment,
  ChatMessage,
  ChatRoomDetail,
  ChatRoomSummary,
  ExchangeItem,
  ExchangeStatus,
  ProposalState,
} from '../types';
import type {
  CardType,
  ChatPostStatus,
  ChatRoomResponse,
  ChatRoomSummaryResponse,
  InputDisabledReason,
  MessageResponse,
} from './chatApi';
import type { ExchangeResponse, OfferedItemResponse } from './exchangeApi';

// 서버 응답 → 화면 타입. 화면은 목업과 같은 모양(ChatRoomSummary · ChatRoomDetail)을 그대로 쓴다.

const INPUT_DISABLED_MESSAGE: Record<InputDisabledReason, string> = {
  OTHER_EXCHANGE_COMPLETED: '다른 사람과 교환이 완료되어 대화할 수 없어요',
  COUNTERPART_LEFT: '상대가 채팅방을 나갔어요',
  BLOCKED: '차단한 상대와는 대화할 수 없어요',
};

/** 화면에 따로 그릴 카드가 없는 카드 메시지는 안내 문구로 보여준다 */
const CARD_NOTICE: Partial<Record<CardType, string>> = {
  EXCHANGE_COMPLETED: '교환이 완료됐어요',
  APPOINTMENT_CHANGE: '약속 변경을 요청했어요',
  CANCELLATION_REQUEST: '약속 취소를 요청했어요',
};

/** A-2 로 내용을 다시 읽어야 하는 카드 (targetId = appointmentId) */
const APPOINTMENT_CARDS: CardType[] = [
  'APPOINTMENT_PROPOSAL',
  'APPOINTMENT_CONFIRMED',
  'EXCHANGE_CONFIRMATION',
];

export function toExchangeStatus(
  status: ChatPostStatus,
  badge?: 'RESERVED' | 'COMPLETED' | null,
): ExchangeStatus {
  if (badge === 'COMPLETED' || status === 'COMPLETED') return 'completed';
  if (badge === 'RESERVED' || status === 'RESERVED') return 'reserved';
  return 'available';
}

export function toChatRoomSummary(room: ChatRoomSummaryResponse): ChatRoomSummary {
  return {
    id: String(room.chatRoomId),
    nickname: room.counterpart.nickname,
    thumbnailUrl: room.post.thumbnailUrl ?? undefined,
    lastMessage: room.counterpart.left ? '상대가 나갔어요' : (room.lastMessage?.preview ?? ''),
    lastMessageAt: room.lastMessage?.sentAt ?? '',
    unreadCount: room.unreadCount,
    muted: !room.notificationEnabled,
    status: toExchangeStatus(room.post.status, room.badge),
  };
}

function toOfferedItem(item: OfferedItemResponse): ExchangeItem {
  if (item.type === 'NEW') {
    return {
      id: String(item.id),
      name: item.name ?? '',
      condition: item.opened ? 'opened' : 'sealed',
      imageUrl: item.imageUrls?.[0],
    };
  }
  return {
    id: String(item.id),
    name: item.post?.title ?? '삭제된 교환글',
    imageUrl: item.post?.thumbnailUrl ?? undefined,
  };
}

/** 우사기 키링 외 3개 */
function offerSummary(items: ExchangeItem[]) {
  if (items.length === 0) return '';
  return items.length === 1 ? items[0].name : `${items[0].name} 외 ${items.length - 1}개`;
}

export function toAppointment(appointment: AppointmentResponse): Appointment {
  return {
    meetAt: appointment.scheduledAt ?? appointment.confirmedAt ?? appointment.createdAt,
    place: appointment.place?.name ?? '',
    items: appointment.items.map((item) => ({
      id: String(item.offeredItemId),
      name: item.name,
      imageUrl: item.thumbnailUrl ?? undefined,
    })),
    isNow: appointment.timeType === 'NOW',
  };
}

function toProposalState(status: AppointmentStatus): ProposalState {
  if (status === 'PROPOSED') return 'pending';
  if (status === 'CONFIRMED' || status === 'COMPLETED' || status === 'NOT_MET') return 'accepted';
  return 'rejected';
}

function toCompletionState(confirmation: ConfirmationResponse | null): CompletionState {
  if (confirmation?.result === 'COMPLETED') return 'completed';
  if (confirmation?.result === 'NOT_MET') return 'cancelled';
  return 'asking';
}

/** 메시지 중 A-2 로 다시 읽어야 하는 약속 ID */
export function appointmentIdsOf(messages: MessageResponse[]) {
  const ids = new Set<number>();
  for (const message of messages) {
    if (message.type === 'CARD' && APPOINTMENT_CARDS.includes(message.content.cardType)) {
      ids.add(message.content.targetId);
    }
  }
  return [...ids];
}

type RoomSources = {
  room: ChatRoomResponse;
  messages: MessageResponse[];
  exchange?: ExchangeResponse;
  /** A-3 현재 유효한 약속 */
  current?: AppointmentResponse | null;
  /** 카드의 약속 (A-2). 아직 못 읽은 카드는 그리지 않는다 */
  appointments: Map<number, AppointmentResponse>;
};

export function toChatRoomDetail({
  room,
  messages,
  exchange,
  current,
  appointments,
}: RoomSources): ChatRoomDetail {
  const partnerId = room.counterpart.userId;
  const senderOf = (userId: number) => (userId === partnerId ? 'other' : 'me');
  const requestItems = exchange?.offeredItems.map(toOfferedItem) ?? [];

  // 오래된 것부터. 같은 약속의 제안 카드가 있으면 확정 카드는 따로 그리지 않는다 (제안 카드가 '약속 확정' 으로 바뀐다)
  const ordered = [...messages].sort((a, b) => a.messageId - b.messageId);
  const proposalIds = new Set(
    ordered.flatMap((message) =>
      message.type === 'CARD' && message.content.cardType === 'APPOINTMENT_PROPOSAL'
        ? [message.content.targetId]
        : [],
    ),
  );

  const chat: ChatMessage[] = ordered.flatMap((message): ChatMessage[] => {
    const id = String(message.messageId);
    const sentAt = message.sentAt;
    switch (message.type) {
      case 'TEXT':
        return [
          {
            id,
            sentAt,
            sender: senderOf(message.senderUserId),
            type: 'text',
            text: message.content.text,
          },
        ];
      case 'IMAGE':
        return message.content.imageUrls.map((uri, index) => ({
          id: `${id}-${index}`,
          sentAt,
          sender: senderOf(message.senderUserId),
          type: 'image' as const,
          uri,
        }));
      case 'PLACE':
        return [
          {
            id,
            sentAt,
            sender: senderOf(message.senderUserId),
            type: 'text',
            text: `장소: ${message.content.name}`,
          },
        ];
      case 'SYSTEM':
        return [{ id, sentAt, sender: 'other', type: 'system', text: message.content.text }];
      case 'CARD': {
        const { cardType, targetId } = message.content;
        if (cardType === 'EXCHANGE_ITEMS') {
          if (!exchange) return [];
          return [
            {
              id,
              sentAt,
              sender: senderOf(exchange.requester.userId),
              type: 'request',
              items: requestItems,
            },
          ];
        }
        const notice = CARD_NOTICE[cardType];
        if (notice) return [{ id, sentAt, sender: 'other', type: 'system', text: notice }];
        const appointment = appointments.get(targetId);
        if (!appointment) return [];
        if (cardType === 'EXCHANGE_CONFIRMATION') {
          return [
            {
              id,
              sentAt,
              sender: 'other',
              type: 'completion',
              appointment: toAppointment(appointment),
              state: toCompletionState(appointment.confirmation),
              appointmentId: targetId,
            },
          ];
        }
        if (cardType === 'APPOINTMENT_CONFIRMED' && proposalIds.has(targetId)) return [];
        return [
          {
            id,
            sentAt,
            sender: senderOf(appointment.proposerUserId),
            type: 'proposal',
            appointment: toAppointment(appointment),
            state:
              cardType === 'APPOINTMENT_CONFIRMED'
                ? 'accepted'
                : toProposalState(appointment.status),
            appointmentId: targetId,
          },
        ];
      }
      default:
        return [];
    }
  });

  return {
    id: String(room.chatRoomId),
    partner: {
      nickname: room.counterpart.nickname,
      exchangeCount: room.counterpart.completedCount,
    },
    post: {
      title: exchange?.post.title ?? (exchange ? '삭제된 교환글' : ''),
      thumbnailUrl: exchange?.post.thumbnailUrl ?? undefined,
      offerSummary: offerSummary(requestItems),
      status: exchange ? toExchangeStatus(exchange.post.status) : 'available',
      place: '',
    },
    requestItems,
    messages: chat,
    appointment: current?.status === 'CONFIRMED' ? toAppointment(current) : null,
    remote: {
      chatRoomId: room.chatRoomId,
      exchangeId: room.exchangeId,
      notificationEnabled: room.notificationEnabled,
      leaveImpact: room.leaveImpact,
      inputDisabledMessage: room.inputDisabledReason
        ? INPUT_DISABLED_MESSAGE[room.inputDisabledReason]
        : room.status === 'READ_ONLY'
          ? '대화할 수 없는 채팅방이에요'
          : null,
    },
  };
}
