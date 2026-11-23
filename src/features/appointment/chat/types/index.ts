import type { CompletionState } from '@/features/completion/review/types';

import type { LeaveImpact } from '../api/chatApi';

/** 교환글 진행 상태 */
export type ExchangeStatus = 'available' | 'reserved' | 'completed';

/** 물건 상태 */
export type ItemCondition = 'sealed' | 'opened';

/** 내가 보낸 요청인지, 받은 요청인지 */
export type RequestDirection = 'received' | 'sent';

export type ExchangeItem = {
  id: string;
  name: string;
  /** 서버의 POST(내 교환글) 아이템은 개봉 여부를 모른다 */
  condition?: ItemCondition;
  imageUrl?: string;
};

export type ChatRoomSummary = {
  id: string;
  nickname: string;
  thumbnailUrl?: string;
  lastMessage: string;
  /** ISO 시각 */
  lastMessageAt: string;
  unreadCount: number;
  /** 알림 끔 */
  muted: boolean;
  status: ExchangeStatus;
  /** 서버 목록(CH-1)에는 없다 */
  direction?: RequestDirection;
};

type MessageBase = {
  id: string;
  sender: 'me' | 'other';
  /** ISO 시각 */
  sentAt: string;
};

export type Appointment = {
  /** 만나는 시각 (ISO) */
  meetAt: string;
  place: string;
  items: ExchangeItem[];
  /** '지금 바로'로 잡은 약속 */
  isNow: boolean;
};

/**
 * 약속 제안 카드 상태.
 * pending: 받는 쪽은 [거절] [수락하기], 보낸 쪽은 '수락 대기중'
 * accepted: 카드가 '약속 확정' 카드로 바뀐다
 * rejected: '거절했어요'
 */
export type ProposalState = 'pending' | 'accepted' | 'rejected';

export type ChatMessage =
  | (MessageBase & { type: 'text'; text: string })
  | (MessageBase & { type: 'image'; uri: string })
  | (MessageBase & { type: 'request'; items: ExchangeItem[] })
  /** 서버 시스템 메시지 (가운데 회색 안내) */
  | (MessageBase & { type: 'system'; text: string })
  | (MessageBase & {
      type: 'proposal';
      appointment: Appointment;
      state: ProposalState;
      /** 서버 약속 ID (CARD APPOINTMENT_PROPOSAL 의 targetId). 목업 방은 없다 */
      appointmentId?: number;
    })
  /** F-1 약속 시각이 지나면 오는 교환 완료 확인 카드 */
  | (MessageBase & {
      type: 'completion';
      appointment: Appointment;
      state: CompletionState;
      /** 서버 약속 ID (CARD EXCHANGE_CONFIRMATION 의 targetId). 목업 방은 없다 */
      appointmentId?: number;
    });

export type ChatRoomDetail = {
  id: string;
  partner: { nickname: string; exchangeCount: number };
  post: {
    title: string;
    thumbnailUrl?: string;
    /** 내놓은 물건 요약 (예: 우사기 키링 외 3개) */
    offerSummary: string;
    status: ExchangeStatus;
    /** 교환글에 적힌 희망 장소 */
    place: string;
  };
  /** 이번 교환에서 오가는 물건 (약속 잡기의 교환할 물건 후보) */
  requestItems: ExchangeItem[];
  messages: ChatMessage[];
  /** 확정된 약속 (채팅방 상단 배너). 있으면 글은 예약중 */
  appointment: Appointment | null;
  /** 목업 전용: 상대가 이미 교환 완료로 답한 상태. 서버 방은 교환 확인 응답으로 안다 */
  partnerCompleted?: boolean;
  /** 서버 방에만 있는 값 */
  remote?: {
    chatRoomId: number;
    exchangeId: number;
    notificationEnabled: boolean;
    leaveImpact: LeaveImpact;
    /** 입력창 대신 보여줄 안내. 입력 가능하면 null */
    inputDisabledMessage: string | null;
  };
};
