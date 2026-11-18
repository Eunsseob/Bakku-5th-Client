import type { CompleteResult, CompletionState } from '@/features/completion/review/types';
import { create } from 'zustand';

import { getMockChatRoom, MOCK_CHAT_ROOMS } from '../api/mockChats';
import type { Appointment, ChatMessage, ChatRoomDetail } from '../types';

// 채팅방 상태 (메시지 · 글 상태 · 확정 약속). 서버 API 가 붙으면 TanStack Query + 소켓으로 바꾼다.

/** 내가 새로 보내는 메시지 (id·보낸 사람·시각은 보낼 때 채운다) */
export type NewMessage = ChatMessage extends infer Message
  ? Message extends ChatMessage
    ? Omit<Message, 'id' | 'sender' | 'sentAt'>
    : never
  : never;

type ChatState = {
  rooms: Record<string, ChatRoomDetail>;
  send: (roomId: string, message: NewMessage) => void;
  /** 약속 잡기 → 제안 카드 보내기 */
  propose: (roomId: string, appointment: Appointment) => void;
  /** 받은 제안 수락 → 카드가 '약속 확정'으로, 글은 예약중 */
  accept: (roomId: string, messageId: string) => void;
  reject: (roomId: string, messageId: string) => void;
  /** F-1 [교환을 완료했어요!] → 확정: 카드가 '교환에 성공했어요!' 로, 글은 교환 완료 */
  completeExchange: (roomId: string, messageId: string) => CompleteResult;
  /** F-1 [교환에 실패했어요] · [합의하에 취소했어요]: 카드가 '약속이 취소됐어요' 로, 글은 다시 교환 가능 */
  cancelExchange: (roomId: string, messageId: string) => void;
};

let sequence = 0;
const nextId = () => `local-${Date.now()}-${(sequence += 1)}`;

function initialRooms() {
  const rooms: Record<string, ChatRoomDetail> = {};
  for (const summary of MOCK_CHAT_ROOMS) {
    const room = getMockChatRoom(summary.id);
    if (room) rooms[room.id] = room;
  }
  return rooms;
}

export const useChatStore = create<ChatState>((set, get) => {
  /** 한 채팅방만 바꾼다 */
  const update = (roomId: string, change: (room: ChatRoomDetail) => ChatRoomDetail) =>
    set((state) => {
      const room = state.rooms[roomId];
      return room ? { rooms: { ...state.rooms, [roomId]: change(room) } } : state;
    });

  const myMessage = (body: NewMessage): ChatMessage =>
    ({ ...body, id: nextId(), sender: 'me', sentAt: new Date().toISOString() }) as ChatMessage;

  /** 받은 제안(pending)만 처리한다 */
  const settle = (room: ChatRoomDetail, messageId: string, state: 'accepted' | 'rejected') => {
    const proposal = room.messages.find((item) => item.id === messageId);
    if (proposal?.type !== 'proposal' || proposal.state !== 'pending') return null;
    return {
      proposal,
      messages: room.messages.map((item) =>
        item.id === messageId ? { ...proposal, state } : item,
      ),
    };
  };

  /** 아직 답하지 않은(asking) 교환 완료 확인 카드만 바꾼다 */
  const answer = (room: ChatRoomDetail, messageId: string, state: CompletionState) => {
    const card = room.messages.find((item) => item.id === messageId);
    if (card?.type !== 'completion' || card.state !== 'asking') return null;
    return room.messages.map((item) => (item.id === messageId ? { ...card, state } : item));
  };

  return {
    rooms: initialRooms(),

    send: (roomId, body) =>
      update(roomId, (room) => ({ ...room, messages: [...room.messages, myMessage(body)] })),

    propose: (roomId, appointment) =>
      update(roomId, (room) => ({
        ...room,
        messages: [
          ...room.messages,
          myMessage({ type: 'proposal', appointment, state: 'pending' }),
        ],
      })),

    accept: (roomId, messageId) =>
      update(roomId, (room) => {
        const result = settle(room, messageId, 'accepted');
        if (!result) return room;
        return {
          ...room,
          post: { ...room.post, status: 'reserved' },
          appointment: result.proposal.appointment,
          messages: result.messages,
        };
      }),

    reject: (roomId, messageId) =>
      update(roomId, (room) => {
        const result = settle(room, messageId, 'rejected');
        return result ? { ...room, messages: result.messages } : room;
      }),

    completeExchange: (roomId, messageId) => {
      const alreadyCompleted = !!get().rooms[roomId]?.partnerCompleted;
      update(roomId, (room) => {
        const messages = answer(room, messageId, 'completed');
        if (!messages) return room;
        return {
          ...room,
          post: { ...room.post, status: 'completed' },
          appointment: null,
          messages,
        };
      });
      return alreadyCompleted ? 'alreadyCompleted' : 'completed';
    },

    cancelExchange: (roomId, messageId) =>
      update(roomId, (room) => {
        const messages = answer(room, messageId, 'cancelled');
        if (!messages) return room;
        return {
          ...room,
          post: { ...room.post, status: 'available' },
          appointment: null,
          messages,
        };
      }),
  };
});
