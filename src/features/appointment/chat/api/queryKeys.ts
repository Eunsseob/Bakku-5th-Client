// TanStack Query 키. 채팅(chat) · 교환(exchange) · 약속(appointment)
export const chatKeys = {
  all: ['chat'] as const,
  rooms: ['chat', 'rooms'] as const,
  room: (chatRoomId: number) => ['chat', 'room', chatRoomId] as const,
  messages: (chatRoomId: number) => ['chat', 'messages', chatRoomId] as const,
};

export const exchangeKeys = {
  all: ['exchange'] as const,
  exchange: (exchangeId: number) => ['exchange', exchangeId] as const,
  current: (exchangeId: number) => ['exchange', exchangeId, 'current-appointment'] as const,
  appointments: ['appointment'] as const,
  appointment: (appointmentId: number) => ['appointment', appointmentId] as const,
};
