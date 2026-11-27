import { apiData } from '@/shared/api/client';

// Swagger exchange: F-1 교환 확인 응답 · A-2 약속 상세
// 한 명만 답해도 처리되고, 응답은 1인 1회라 바꿀 수 없다.

export type ConfirmationAnswer = 'DONE' | 'NOT_MET';

/** 교환하지 못한 이유 (F-1-3). SELF_ABSENT: 내가 약속 장소에 가지 못함 */
export type NotMetReason =
  'NO_SHOW' | 'SELF_ABSENT' | 'ITEM_MISMATCH' | 'MONEY_DEMANDED' | 'MUTUAL_CANCEL' | 'OTHER';

export type ConfirmationRequest =
  | { answer: 'DONE' }
  /** notMetDetail 은 OTHER 일 때 직접 입력 (100자까지) */
  | { answer: 'NOT_MET'; notMetReason: NotMetReason; notMetDetail?: string };

/** 교환 확인 정보. 확정 전이면 null */
export type ConfirmationResponse = {
  /** 교환 확인 카드 발송 시각 (약속 시각 + 30분) */
  askedAt: string | null;
  /** 결과 전이면 null */
  result: 'COMPLETED' | 'NOT_MET' | null;
  /** 3일 무응답 자동 완료 */
  autoCompleted: boolean;
  /** 내 응답. 응답 전이면 null */
  myAnswer: ConfirmationAnswer | null;
  resolvedAt: string | null;
};

export type AppointmentStatus =
  | 'PROPOSED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'EXPIRED'
  | 'AUTO_REJECTED'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'NOT_MET'
  | 'CANCELED';

/** 약속 장소. 합의 시점 값으로 고정 */
export type AppointmentPlaceResponse = {
  name: string;
  address: string | null;
  lat: number;
  lng: number;
};

/** 약속에서 교환할 물건 */
export type AppointmentItemResponse = {
  offeredItemId: number;
  type: 'POST' | 'NEW';
  /** POST 는 원본 글 현재 제목 */
  name: string;
  thumbnailUrl: string | null;
};

/** 약속 (A-2 약속 상세) */
export type AppointmentResponse = {
  id: number;
  exchangeId: number;
  /** 이 약속을 제안한 사람 */
  proposerUserId: number;
  /** 제안받은 사람. 수락 · 거절 권한 */
  receiverUserId: number;
  status: AppointmentStatus;
  timeType: 'NOW' | 'SCHEDULED';
  scheduledAt: string | null;
  place: AppointmentPlaceResponse | null;
  items: AppointmentItemResponse[];
  confirmation: ConfirmationResponse | null;
  confirmedAt: string | null;
  createdAt: string;
};

const appointmentUrl = (appointmentId: number) => `/v1/appointments/${appointmentId}`;

/** F-1 교환 확인 응답 */
export async function confirmExchange(appointmentId: number, body: ConfirmationRequest) {
  return apiData<AppointmentResponse>({
    method: 'POST',
    url: `${appointmentUrl(appointmentId)}/confirmation`,
    data: body,
  });
}

/** A-2 약속 상세 */
export async function getAppointment(appointmentId: number) {
  return apiData<AppointmentResponse>({
    method: 'GET',
    url: appointmentUrl(appointmentId),
  });
}
