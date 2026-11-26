// G-1 내 프로필 노쇼 기록 목업. TODO: 노쇼 건별 목록 API 가 생기면 서버 데이터로 바꾼다 (지금 Swagger 에 없음)

/** PENDING 확인 중 · CONFIRMED 인정 */
export type NoShowStatus = 'PENDING' | 'CONFIRMED';

export type NoShowCase = {
  id: number;
  /** 약속 시각 */
  appointmentAt: string;
  placeName: string;
  partnerNickname: string;
  status: NoShowStatus;
};

export const MOCK_NO_SHOW_CASES: NoShowCase[] = [
  {
    id: 1,
    appointmentAt: '2025-10-30T15:00:00+09:00',
    placeName: '홍대입구역 9번 출구',
    partnerNickname: '닉네임',
    status: 'PENDING',
  },
  {
    id: 2,
    appointmentAt: '2025-10-30T15:00:00+09:00',
    placeName: '홍대입구역 9번 출구',
    partnerNickname: '닉네임',
    status: 'CONFIRMED',
  },
];
