import type { AppointmentResponse } from '@/features/completion/review';
import { apiData } from '@/shared/api/client';

import type { ChatPostStatus } from './chatApi';

// Swagger exchange: 채팅방에서 쓰는 것만
// (E-2 교환 상세 · A-1 제안 · A-3 현재 약속 · A-4 수락 · A-5 거절 · A-6 철회)

export type PostSummaryResponse = {
  id: number;
  /** 삭제된 글이면 null */
  title: string | null;
  thumbnailUrl: string | null;
  status: ChatPostStatus;
};

export type ParticipantResponse = { userId: number; nickname: string; completedCount: number };

/** 교환 요청에 첨부된 아이템. POST 는 내 교환글, NEW 는 새로 작성 */
export type OfferedItemResponse = {
  id: number;
  type: 'POST' | 'NEW';
  availability: 'AVAILABLE' | 'RESERVED_HERE' | 'RESERVED_ELSEWHERE' | 'COMPLETED' | 'DELETED';
  editable: boolean;
  /** POST 일 때 원본 교환글. NEW 면 null */
  post: PostSummaryResponse | null;
  /** NEW 일 때만 */
  name: string | null;
  opened: boolean | null;
  description: string | null;
  imageUrls: string[] | null;
};

/** E-2 교환 상세 */
export type ExchangeResponse = {
  id: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CLOSED' | 'LEFT';
  /** 요청한 교환글의 현재 정보 (상단 고정 카드) */
  post: PostSummaryResponse;
  requester: ParticipantResponse;
  owner: ParticipantResponse;
  offerType: 'POST' | 'NEW';
  offeredItems: OfferedItemResponse[];
  chatRoomId: number;
  /** 입력창 위 버튼 상태 */
  appointmentButton: 'PROPOSE' | 'PROPOSE_DISABLED' | 'CANCEL' | 'NONE';
  createdAt: string;
};

export type CreateExchangeOffer =
  | { offerType: 'POST'; offeredPostIds: number[] }
  | {
      offerType: 'NEW';
      newItem: { imageKeys: string[]; name: string; opened: boolean; description: string | null };
    };

export async function createExchange(postId: number, offer: CreateExchangeOffer) {
  const result = await apiData<{ chatRoomId: number }>({
    method: 'POST',
    url: '/v1/exchanges',
    data: { postId, ...offer },
  });
  if (!result || !Number.isSafeInteger(result.chatRoomId) || result.chatRoomId <= 0) {
    throw new Error('생성된 채팅방 정보를 확인할 수 없어요.');
  }
  return result.chatRoomId;
}

/** E-2 교환 상세 */
export function getExchange(exchangeId: number) {
  return apiData<ExchangeResponse>({ method: 'GET', url: `/v1/exchanges/${exchangeId}` });
}

/** A-3 현재 유효한 약속 (PROPOSED · CONFIRMED). 없으면 null */
export function getCurrentAppointment(exchangeId: number) {
  return apiData<AppointmentResponse | null>({
    method: 'GET',
    url: `/v1/exchanges/${exchangeId}/appointments/current`,
  });
}

/** A-1 약속 장소 */
export type PlaceRequest = {
  /** 1~100자 */
  name: string;
  /** 최대 255자 */
  address?: string;
  lat: number;
  lng: number;
};

/**
 * A-1 약속 제안.
 * SCHEDULED 면 scheduledAt 필수 (미래 · 분은 10의 배수 · 오늘~7일 후), NOW 면 보내지 않는다.
 * offeredItemIds 는 고를 수 있는 아이템이 1개면 생략할 수 있다.
 */
export type ProposeAppointmentRequest = {
  timeType: 'NOW' | 'SCHEDULED';
  scheduledAt?: string;
  place: PlaceRequest;
  offeredItemIds?: number[];
};

/** A-1 약속 제안. 한 채팅방에 진행 중인 제안은 1개 */
export function proposeAppointment(exchangeId: number, body: ProposeAppointmentRequest) {
  return apiData<AppointmentResponse>({
    method: 'POST',
    url: `/v1/exchanges/${exchangeId}/appointments`,
    data: body,
  });
}

/** A-6 제안 철회 (제안한 사람이 자기 제안을 취소) */
export function withdrawAppointment(appointmentId: number) {
  return apiData<AppointmentResponse>({
    method: 'POST',
    url: `/v1/appointments/${appointmentId}/withdraw`,
  });
}

/** A-4 약속 수락. 본문은 생략할 수 있다 (약속 전 알림은 2차) */
export function acceptAppointment(appointmentId: number) {
  return apiData<AppointmentResponse>({
    method: 'POST',
    url: `/v1/appointments/${appointmentId}/accept`,
  });
}

/** A-5 약속 제안 거절 */
export function rejectAppointment(appointmentId: number) {
  return apiData<AppointmentResponse>({
    method: 'POST',
    url: `/v1/appointments/${appointmentId}/reject`,
  });
}
