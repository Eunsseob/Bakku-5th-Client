import type {
  Appointment,
  ChatMessage,
  ChatRoomDetail,
  ChatRoomSummary,
  ExchangeItem,
} from '../types';

// 서버 API 가 붙기 전까지 쓰는 화면 확인용 더미 데이터 (와이어프레임 E. 채팅·약속 기준)

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60 * 1000).toISOString();
const daysAgo = (days: number, hour: number, minute: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

export const MOCK_CHAT_ROOMS: ChatRoomSummary[] = [
  {
    id: '1',
    nickname: '하치와레좋아',
    lastMessage: '교환 요청이 왔어요',
    lastMessageAt: minutesAgo(0),
    unreadCount: 1,
    muted: false,
    status: 'available',
    direction: 'received',
  },
  {
    id: '2',
    nickname: '우사기 수집가',
    lastMessage: '안녕하세요! 혹시 오늘 6시 전에 홍대입구역에서 교환 가능할까요?',
    lastMessageAt: minutesAgo(0),
    unreadCount: 13,
    muted: false,
    status: 'available',
    direction: 'received',
  },
  {
    id: '3',
    nickname: '모몽가',
    lastMessage: '교환 요청을 보냈어요',
    lastMessageAt: minutesAgo(12),
    unreadCount: 0,
    muted: false,
    status: 'available',
    direction: 'sent',
  },
  {
    id: '4',
    nickname: '가챠 러버',
    lastMessage: '네 그럼 토요일 3시에 봬요',
    lastMessageAt: minutesAgo(60),
    unreadCount: 0,
    muted: true,
    status: 'reserved',
    direction: 'sent',
  },
  {
    // F-1: 약속 시각이 지나 교환 완료를 묻는 중
    id: '8',
    nickname: '하치와레러버',
    lastMessage: '교환을 무사히 완료했나요?',
    lastMessageAt: minutesAgo(30),
    unreadCount: 1,
    muted: false,
    status: 'reserved',
    direction: 'sent',
  },
  {
    // F-1: 상대가 먼저 교환 완료로 답한 방 (완료를 누르면 토스트)
    id: '9',
    nickname: '우사기 팬',
    lastMessage: '교환을 무사히 완료했나요?',
    lastMessageAt: minutesAgo(90),
    unreadCount: 1,
    muted: false,
    status: 'reserved',
    direction: 'received',
  },
  {
    id: '5',
    nickname: '키링부자',
    lastMessage: '사진',
    lastMessageAt: minutesAgo(4 * 60),
    unreadCount: 120,
    muted: true,
    status: 'available',
    direction: 'received',
  },
  {
    id: '6',
    nickname: '굿즈왕',
    lastMessage: '교환 잘 했어요 감사합니다',
    lastMessageAt: daysAgo(16, 14, 0),
    unreadCount: 0,
    muted: false,
    status: 'completed',
    direction: 'received',
  },
  {
    id: '7',
    nickname: '치이카와팬',
    lastMessage: '상대가 나갔어요',
    lastMessageAt: daysAgo(20, 11, 30),
    unreadCount: 0,
    muted: false,
    status: 'completed',
    direction: 'sent',
  },
];

const REQUEST_ITEMS: ExchangeItem[] = [
  { id: 'i1', name: '우사기 키링', condition: 'sealed' },
  { id: 'i2', name: '하치와레 아크릴 키링', condition: 'opened' },
  { id: 'i3', name: '한교동 봉제인형', condition: 'sealed' },
  { id: 'i4', name: '마이멜로디 미니 피규어 세트', condition: 'sealed' },
];

const tomorrowAt = (hour: number) => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

const TOMORROW_3PM: Appointment = {
  meetAt: tomorrowAt(15),
  place: '홍대입구역 9번 출구',
  items: REQUEST_ITEMS.slice(0, 3),
  isNow: false,
};

const SATURDAY_3PM: Appointment = {
  meetAt: (() => {
    const date = new Date();
    date.setDate(date.getDate() + ((6 - date.getDay() + 7) % 7 || 7));
    date.setHours(15, 0, 0, 0);
    return date.toISOString();
  })(),
  place: '홍대입구역 9번 출구',
  items: REQUEST_ITEMS.slice(0, 3),
  isNow: false,
};

/** 어제 오후 3시에 만난 약속 (교환 완료 확인 카드가 온 방) */
const YESTERDAY_3PM: Appointment = {
  meetAt: daysAgo(1, 15, 0),
  place: '홍대입구역 9번 출구',
  items: REQUEST_ITEMS.slice(0, 3),
  isNow: false,
};

/** 약속을 잡고 약속 시각이 지나 교환 완료를 묻는 방 */
const COMPLETION_ROOMS = ['8', '9'];

function buildMessages(room: ChatRoomSummary): ChatMessage[] {
  const start = new Date(new Date(room.lastMessageAt).getTime() - 20 * 60 * 1000).toISOString();
  const request: ChatMessage = {
    id: `${room.id}-m1`,
    type: 'request',
    sender: room.direction === 'received' ? 'other' : 'me',
    sentAt: start,
    items: REQUEST_ITEMS,
  };
  const intro: ChatMessage = {
    id: `${room.id}-m2`,
    type: 'text',
    sender: request.sender,
    sentAt: start,
    text: '치이카와 피규어랑 꼭 바꾸고 싶어요!',
  };
  if (room.id === '1') {
    // 채팅·약속-5: 상대가 보낸 약속 제안 (받는 쪽에서 거절 / 수락하기)
    return [
      request,
      intro,
      {
        id: '1-m3',
        type: 'text',
        sender: 'other',
        sentAt: room.lastMessageAt,
        text: '내일 3시에 홍대 어떠세요?',
      },
      {
        id: '1-m4',
        type: 'proposal',
        sender: 'other',
        sentAt: room.lastMessageAt,
        state: 'pending',
        appointment: TOMORROW_3PM,
      },
    ];
  }
  if (COMPLETION_ROOMS.includes(room.id)) {
    // F-1: 약속 확정 → 약속 시각이 지나 '교환을 완료했나요?' 카드
    const before = daysAgo(2, 10, 0);
    return [
      { ...request, sentAt: before },
      { ...intro, sentAt: before },
      {
        id: `${room.id}-m3`,
        type: 'proposal',
        sender: request.sender,
        sentAt: before,
        state: 'accepted',
        appointment: YESTERDAY_3PM,
      },
      {
        id: `${room.id}-m4`,
        type: 'completion',
        sender: 'other',
        sentAt: room.lastMessageAt,
        state: 'asking',
        appointment: YESTERDAY_3PM,
      },
    ];
  }
  if (room.id === '4') {
    // 채팅·약속-5 (수락 후): 제안 카드가 '약속 확정' 카드로 바뀌고 글은 예약중
    return [
      request,
      intro,
      {
        id: '4-m3',
        type: 'proposal',
        sender: 'me',
        sentAt: room.lastMessageAt,
        state: 'accepted',
        appointment: SATURDAY_3PM,
      },
    ];
  }
  return [
    request,
    intro,
    {
      id: `${room.id}-m3`,
      type: 'text',
      sender: room.direction === 'received' ? 'me' : 'other',
      sentAt: room.lastMessageAt,
      text: '안녕하세요! 지금 홍대에 계세요?',
    },
    {
      id: `${room.id}-m4`,
      type: 'text',
      sender: room.direction === 'received' ? 'other' : 'me',
      sentAt: room.lastMessageAt,
      text: '네 9번 출구 쪽이에요',
    },
  ];
}

export function getMockChatRoom(id: string): ChatRoomDetail | undefined {
  const room = MOCK_CHAT_ROOMS.find((candidate) => candidate.id === id);
  if (!room) return undefined;

  return {
    id: room.id,
    partner: { nickname: room.nickname, exchangeCount: 12 },
    post: {
      title: '치이카와 미니 피규어',
      offerSummary: '우사기 키링 외 3개',
      status: room.status,
      place: '홍대입구역 9번 출구',
    },
    requestItems: REQUEST_ITEMS,
    messages: buildMessages(room),
    appointment:
      room.id === '4' ? SATURDAY_3PM : COMPLETION_ROOMS.includes(room.id) ? YESTERDAY_3PM : null,
    partnerCompleted: room.id === '9',
  };
}
