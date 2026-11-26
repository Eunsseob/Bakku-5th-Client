// G-2 내 교환글 목업. TODO: 내 교환글 목록 API 가 생기면 서버 데이터로 바꾼다 (지금 Swagger 에 없음)

export type MyPostStatus = 'AVAILABLE' | 'RESERVED' | 'COMPLETED';

export type MyPost = {
  id: number;
  title: string;
  regionName: string;
  createdAt: string;
  status: MyPostStatus;
  /** 지금 교환 글 */
  nowExchange: boolean;
  /** 지금 교환 마감이 가까움 (곧 만료) */
  expiringSoon: boolean;
  wantedItem: string | null;
  thumbnailUrl: string | null;
  /** 이 글로 채팅한 상대 닉네임 (G-4 '누구와 교환했나요?') */
  chatPartners: string[];
};

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

export const MOCK_MY_POSTS: MyPost[] = [
  {
    id: 101,
    title: '하치와레 키링 (미개봉)',
    regionName: '서울 마포구 서교동',
    createdAt: minutesAgo(3),
    status: 'AVAILABLE',
    nowExchange: true,
    expiringSoon: true,
    wantedItem: '치이카와 키링',
    thumbnailUrl: null,
    chatPartners: ['굿즈요정', '치이카와덕후'],
  },
  {
    id: 102,
    title: '산리오 쿠로미 마스코트',
    regionName: '서울 용산구 한강로동',
    createdAt: minutesAgo(40),
    status: 'AVAILABLE',
    nowExchange: true,
    expiringSoon: false,
    wantedItem: '마이멜로디 마스코트',
    thumbnailUrl: null,
    chatPartners: ['산리오러버'],
  },
  {
    id: 103,
    title: '아이브 포토카드 세트',
    regionName: '서울 성동구 성수동',
    createdAt: minutesAgo(60 * 5),
    status: 'AVAILABLE',
    nowExchange: false,
    expiringSoon: false,
    wantedItem: '뉴진스 포토카드',
    thumbnailUrl: null,
    chatPartners: [],
  },
  {
    id: 104,
    title: '포켓몬 피카츄 인형',
    regionName: '서울 구로구 신도림동',
    createdAt: minutesAgo(60 * 26),
    status: 'AVAILABLE',
    nowExchange: false,
    expiringSoon: false,
    wantedItem: null,
    thumbnailUrl: null,
    chatPartners: ['포켓몬마스터'],
  },
  {
    id: 105,
    title: '치이카와 랜덤 뱃지',
    regionName: '서울 광진구 화양동',
    createdAt: minutesAgo(15),
    status: 'RESERVED',
    nowExchange: true,
    expiringSoon: false,
    wantedItem: '우사기 뱃지',
    thumbnailUrl: null,
    chatPartners: ['케로로중사', '짱구엄마'],
  },
  {
    id: 106,
    title: '야구 유니폼 키링',
    regionName: '서울 마포구 서교동',
    createdAt: minutesAgo(60 * 3),
    status: 'RESERVED',
    nowExchange: false,
    expiringSoon: false,
    wantedItem: '응원 타월',
    thumbnailUrl: null,
    chatPartners: [],
  },
  {
    id: 107,
    title: '세븐틴 응원봉 키링',
    regionName: '서울 용산구 한강로동',
    createdAt: minutesAgo(60 * 24 * 3),
    status: 'COMPLETED',
    nowExchange: false,
    expiringSoon: false,
    wantedItem: '응원봉 스트랩',
    thumbnailUrl: null,
    chatPartners: ['하치와레'],
  },
];
