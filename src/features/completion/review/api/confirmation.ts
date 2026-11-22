import { apiRequest, type ApiResponse } from '@/shared/api/client';

// Swagger exchange: F-1 교환 확인 응답 · A-2 약속 상세
// 한 명만 답해도 처리되고, 응답은 1인 1회라 바꿀 수 없다.

export type ConfirmationAnswer = 'DONE' | 'NOT_MET';

/** 교환하지 못한 이유 */
export type NotMetReason =
  'NO_SHOW' | 'ITEM_MISMATCH' | 'MONEY_DEMANDED' | 'MUTUAL_CANCEL' | 'OTHER';

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

/** 약속 (교환 확인에 쓰는 값만) */
export type AppointmentResponse = {
  id: number;
  exchangeId: number;
  status: AppointmentStatus;
  confirmation: ConfirmationResponse | null;
};

const appointmentUrl = (appointmentId: number) => `/api/v1/appointments/${appointmentId}`;

/** F-1 교환 확인 응답 */
export async function confirmExchange(appointmentId: number, body: ConfirmationRequest) {
  const { data } = await apiRequest<ApiResponse<AppointmentResponse>>({
    method: 'POST',
    url: `${appointmentUrl(appointmentId)}/confirmation`,
    data: body,
  });
  return data.data;
}

/** A-2 약속 상세 */
export async function getAppointment(appointmentId: number) {
  const { data } = await apiRequest<ApiResponse<AppointmentResponse>>({
    method: 'GET',
    url: appointmentUrl(appointmentId),
  });
  return data.data;
}
