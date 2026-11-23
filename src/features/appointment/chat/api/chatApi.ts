import { uuid } from 'expo';

import { apiData } from '@/shared/api/client';

// Swagger chat: CH-1 ~ CH-7

/** 커서 기반 목록 */
export type CursorPage<T> = {
  content: T[];
  /** 다음 페이지 커서. 마지막이면 null */
  nextCursor: string | null;
  hasNext: boolean;
};

export type ChatPostStatus = 'AVAILABLE' | 'RESERVED' | 'COMPLETED' | 'DELETED';

/** CH-1 채팅 목록 항목 */
export type ChatRoomSummaryResponse = {
  chatRoomId: number;
  exchangeId: number;
  counterpart: {
    userId: number;
    nickname: string;
    /** 상대가 나간 방이면 true → "상대가 나갔어요" */
    left: boolean;
  };
  post: { id: number; thumbnailUrl: string | null; status: ChatPostStatus };
  /** 방 배지. 없으면 null */
  badge: 'RESERVED' | 'COMPLETED' | null;
  /** 마지막 메시지. 메시지가 없으면 null */
  lastMessage: { messageId: number; preview: string; sentAt: string } | null;
  unreadCount: number;
  notificationEnabled: boolean;
};

export type InputDisabledReason = 'OTHER_EXCHANGE_COMPLETED' | 'COUNTERPART_LEFT' | 'BLOCKED';

/** 나가기 확인 팝업 종류 */
export type LeaveImpact = 'NONE' | 'UNILATERAL_CANCEL' | 'UNILATERAL_CANCEL_IMMINENT';

/** CH-2 채팅방 상세 */
export type ChatRoomResponse = {
  chatRoomId: number;
  /** 상단 교환 카드는 Exchange API E-2, A-3 으로 조회 */
  exchangeId: number;
  status: 'OPEN' | 'READ_ONLY';
  /** 입력창 대신 보여줄 안내. 입력 가능하면 null */
  inputDisabledReason: InputDisabledReason | null;
  counterpart: { userId: number; nickname: string; completedCount: number; left: boolean };
  notificationEnabled: boolean;
  leaveImpact: LeaveImpact;
  myLastReadMessageId: number | null;
};

export type MessageType = 'TEXT' | 'IMAGE' | 'PLACE' | 'SYSTEM' | 'CARD';

export type CardType =
  | 'EXCHANGE_ITEMS'
  | 'APPOINTMENT_PROPOSAL'
  | 'APPOINTMENT_CONFIRMED'
  | 'APPOINTMENT_CHANGE'
  | 'CANCELLATION_REQUEST'
  | 'EXCHANGE_CONFIRMATION'
  | 'EXCHANGE_COMPLETED';

export type TextMessageContent = { text: string; externalTradeDetected: boolean };
export type ImageMessageContent = { imageUrls: string[] };
export type PlaceMessageContent = {
  name: string;
  address: string | null;
  lat: number;
  lng: number;
};
export type SystemMessageContent = {
  code: string;
  /** 서버가 만든 문구 */
  text: string;
  link: { type: 'POST' | 'EXCHANGE_ITEM'; id: number } | null;
};
/** 카드 상태는 targetId 로 Exchange API 를 다시 조회한다 */
export type CardMessageContent = {
  cardType: CardType;
  /** cardType 에 따라 exchangeId · appointmentId · changeId · cancellationId */
  targetId: number;
};

type MessageBase = {
  /** 방 안에서 시간순 증가 */
  messageId: number;
  chatRoomId: number;
  clientMessageId: string | null;
  sentAt: string;
};

/** 메시지. 시스템 · 카드 메시지는 senderUserId 가 null */
export type MessageResponse =
  | (MessageBase & { type: 'TEXT'; senderUserId: number; content: TextMessageContent })
  | (MessageBase & { type: 'IMAGE'; senderUserId: number; content: ImageMessageContent })
  | (MessageBase & { type: 'PLACE'; senderUserId: number; content: PlaceMessageContent })
  | (MessageBase & { type: 'SYSTEM'; senderUserId: null; content: SystemMessageContent })
  | (MessageBase & { type: 'CARD'; senderUserId: null; content: CardMessageContent });

export type LeaveChatRoomResponse = {
  chatRoomId: number;
  /** 확정 약속이 일방 취소되었는지 */
  appointmentCanceled: boolean;
  /** 임박 취소로 매너 지표에 반영되었는지 */
  penaltyApplied: boolean;
};

const roomUrl = (chatRoomId: number) => `/v1/chat-rooms/${chatRoomId}`;

/** CH-1 채팅 목록 (최근 메시지 시각 내림차순) */
export function getChatRooms(params: { cursor?: string; size?: number } = {}) {
  return apiData<CursorPage<ChatRoomSummaryResponse>>({
    method: 'GET',
    url: '/v1/members/me/chat-rooms',
    params,
  });
}

/** CH-2 채팅방 상세 */
export function getChatRoom(chatRoomId: number) {
  return apiData<ChatRoomResponse>({ method: 'GET', url: roomUrl(chatRoomId) });
}

/** CH-3 메시지 목록. cursor 는 더 오래된 메시지(최신순), after 는 이 ID 이후만 */
export function getMessages(
  chatRoomId: number,
  params: { cursor?: string; size?: number; after?: number } = {},
) {
  return apiData<CursorPage<MessageResponse>>({
    method: 'GET',
    url: `${roomUrl(chatRoomId)}/messages`,
    params,
  });
}

/** CH-4 텍스트 보내기. 사진(imageKeys)은 업로드 API 가 붙으면 추가 */
export function sendTextMessage(chatRoomId: number, text: string) {
  return apiData<MessageResponse>({
    method: 'POST',
    url: `${roomUrl(chatRoomId)}/messages`,
    data: { clientMessageId: uuid.v4(), type: 'TEXT', text },
  });
}

/** CH-5 읽음 처리 */
export function readMessages(chatRoomId: number, lastReadMessageId: number) {
  return apiData<{ chatRoomId: number; lastReadMessageId: number; unreadCount: number }>({
    method: 'POST',
    url: `${roomUrl(chatRoomId)}/read`,
    data: { lastReadMessageId },
  });
}

/** CH-6 이 방 알림 끄기 · 켜기 */
export function updateRoomNotification(chatRoomId: number, enabled: boolean) {
  return apiData<ChatRoomResponse>({
    method: 'PUT',
    url: `${roomUrl(chatRoomId)}/notification`,
    data: { enabled },
  });
}

/** CH-7 채팅방 나가기. 나간 방에는 다시 들어올 수 없다 */
export function leaveChatRoom(chatRoomId: number) {
  return apiData<LeaveChatRoomResponse>({ method: 'POST', url: `${roomUrl(chatRoomId)}/leave` });
}
