// G-2 교환 내역 목업. TODO: 교환 내역 목록 API 가 생기면 서버 데이터로 바꾼다 (지금 Swagger 에 없음)

/** COMPLETED 교환 완료 · FAILED 못 함 · 취소 */
export type ExchangeHistoryResult = 'COMPLETED' | 'FAILED';

export type ExchangeHistory = {
  id: number;
  myItem: string;
  receivedItem: string;
  /** 상대 닉네임. 탈퇴한 회원이면 null → '탈퇴한 사용자' */
  partnerNickname: string | null;
  exchangedAt: string;
  result: ExchangeHistoryResult;
  /** 상대가 확인하지 않아 시간이 지나 자동으로 교환 완료된 건 */
  autoCompleted: boolean;
};

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();

export const MOCK_EXCHANGE_HISTORY: ExchangeHistory[] = [
  {
    id: 301,
    myItem: '하치와레 키링',
    receivedItem: '치이카와 키링',
    partnerNickname: '굿즈요정',
    exchangedAt: daysAgo(1),
    result: 'COMPLETED',
    autoCompleted: false,
  },
  {
    id: 302,
    myItem: '쿠로미 마스코트',
    receivedItem: '마이멜로디 마스코트',
    partnerNickname: '산리오러버',
    exchangedAt: daysAgo(4),
    result: 'COMPLETED',
    autoCompleted: true,
  },
  {
    id: 303,
    myItem: '포켓몬 띠부씰 세트',
    receivedItem: '디지몬 카드',
    partnerNickname: null,
    exchangedAt: daysAgo(9),
    result: 'COMPLETED',
    autoCompleted: false,
  },
  {
    id: 304,
    myItem: '짱구 아크릴 스탠드',
    receivedItem: '케로로 아크릴 스탠드',
    partnerNickname: '케로로중사',
    exchangedAt: daysAgo(15),
    result: 'FAILED',
    autoCompleted: false,
  },
];
