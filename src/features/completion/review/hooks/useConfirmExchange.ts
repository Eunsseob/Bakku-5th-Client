import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import {
  type AppointmentResponse,
  type ConfirmationRequest,
  confirmExchange,
  getAppointment,
} from '../api/confirmation';
import type { ConfirmResult } from '../types';

/** 서버 결과 → 카드 상태. 결과가 아직 없으면 null */
function resultOf(appointment: AppointmentResponse): ConfirmResult['state'] | null {
  const result = appointment.confirmation?.result;
  if (result === 'COMPLETED') return 'completed';
  if (result === 'NOT_MET') return 'cancelled';
  return null;
}

async function answer(appointmentId: number, body: ConfirmationRequest): Promise<ConfirmResult> {
  try {
    const state = resultOf(await confirmExchange(appointmentId, body));
    if (!state) throw new Error('교환 확인 결과가 없어요.');
    return { state, byPartner: false };
  } catch (error) {
    // 상대가 먼저 답해 결과가 나 있으면 내 응답은 거절된다. 약속을 다시 읽어 그 결과를 따른다.
    const status = isAxiosError(error) ? error.response?.status : undefined;
    if (!status || status >= 500 || status === 401) throw error;
    const state = resultOf(await getAppointment(appointmentId));
    if (!state) throw error;
    return { state, byPartner: true };
  }
}

/** F-1 [무사히 교환했어요] · [교환하지 못했어요] 응답 */
export function useConfirmExchange() {
  return useMutation({
    mutationFn: ({ appointmentId, body }: { appointmentId: number; body: ConfirmationRequest }) =>
      answer(appointmentId, body),
  });
}
