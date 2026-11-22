/**
 * F-1 교환 완료 확인 카드 상태.
 * asking: 약속 시각이 지나 '교환을 완료했나요?' 를 묻는 중
 * completed: '교환에 성공했어요!'
 * cancelled: 교환하지 못해서 '교환이 취소됐어요'
 */
export type CompletionState = 'asking' | 'completed' | 'cancelled';

/** 교환 확인 결과. 상대가 먼저 답해 결과가 났으면 byPartner */
export type ConfirmResult = {
  state: Exclude<CompletionState, 'asking'>;
  byPartner: boolean;
};
