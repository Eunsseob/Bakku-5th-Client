import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';

import { USE_MOCK_CHAT } from '@/constants/chat';
import { type AppointmentResponse, getAppointment } from '@/features/completion/review';
import type { ConfirmResult } from '@/features/completion/review/types';

import {
  blockMember,
  getChatRoom,
  getMessages,
  leaveChatRoom,
  readMessages,
  sendTextMessage,
  updateRoomNotification,
} from '../api/chatApi';
import {
  acceptAppointment,
  getCurrentAppointment,
  getExchange,
  proposeAppointment,
  rejectAppointment,
  withdrawAppointment,
} from '../api/exchangeApi';
import { appointmentIdsOf, toChatRoomDetail } from '../api/mapChat';
import { chatKeys, exchangeKeys } from '../api/queryKeys';
import { useChatStore } from '../store/useChatStore';
import type { AppointmentDraft } from '../types';

/** 메시지 새로고침 간격. 소켓(MESSAGE_CREATED)이 붙기 전까지 주기적으로 다시 읽는다 */
const POLL_MS = 5_000;
/** CH-3 최근 메시지 최대 100개. 이전 메시지 더 보기(nextCursor)는 나중에 붙인다 */
const MESSAGE_PAGE = 100;

/**
 * E 채팅·약속 채팅방. 서버(CH-2 · CH-3 + 교환 E-2 · A-3 · 카드별 A-2) 또는 목업(useChatStore).
 * 화면은 어느 쪽이든 같은 ChatRoomDetail 과 같은 동작을 쓴다.
 */
export function useChatRoom(roomId: string) {
  const queryClient = useQueryClient();
  const mockRoom = useChatStore((state) => state.rooms[roomId]);

  const chatRoomId = Number(roomId);
  const enabled = !USE_MOCK_CHAT && Number.isInteger(chatRoomId);

  const roomQuery = useQuery({
    queryKey: chatKeys.room(chatRoomId),
    queryFn: () => getChatRoom(chatRoomId),
    enabled,
  });
  const messagesQuery = useQuery({
    queryKey: chatKeys.messages(chatRoomId),
    queryFn: () => getMessages(chatRoomId, { size: MESSAGE_PAGE }),
    enabled,
    refetchInterval: POLL_MS,
  });

  const exchangeId = roomQuery.data?.exchangeId;
  const exchangeQuery = useQuery({
    queryKey: exchangeKeys.exchange(exchangeId ?? 0),
    queryFn: () => getExchange(exchangeId as number),
    enabled: enabled && exchangeId !== undefined,
  });
  const currentQuery = useQuery({
    queryKey: exchangeKeys.current(exchangeId ?? 0),
    queryFn: () => getCurrentAppointment(exchangeId as number),
    enabled: enabled && exchangeId !== undefined,
  });

  const messages = messagesQuery.data?.content;
  const appointmentIds = useMemo(() => (messages ? appointmentIdsOf(messages) : []), [messages]);
  const appointmentQueries = useQueries({
    queries: appointmentIds.map((appointmentId) => ({
      queryKey: exchangeKeys.appointment(appointmentId),
      queryFn: () => getAppointment(appointmentId),
      enabled,
    })),
  });

  const appointments = new Map<number, AppointmentResponse>();
  appointmentQueries.forEach((query, index) => {
    if (query.data) appointments.set(appointmentIds[index], query.data);
  });

  const remoteRoom =
    roomQuery.data && messages
      ? toChatRoomDetail({
          room: roomQuery.data,
          messages,
          exchange: exchangeQuery.data,
          current: currentQuery.data,
          appointments,
        })
      : undefined;

  /** 약속 · 교환 상태가 바뀌었을 수 있으니 카드와 상단 정보를 다시 읽는다 */
  const refreshCards = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(chatRoomId) }),
      queryClient.invalidateQueries({ queryKey: exchangeKeys.all }),
      queryClient.invalidateQueries({ queryKey: exchangeKeys.appointments }),
      queryClient.invalidateQueries({ queryKey: chatKeys.rooms }),
    ]);

  // 새 메시지가 오면: 카드 상태를 다시 읽고(상대가 수락 · 응답했을 수 있다), 읽음 처리(CH-5)
  const lastMessageId = messages?.reduce((max, message) => Math.max(max, message.messageId), 0);
  const seenLastRef = useRef<number | undefined>(undefined);
  const readRef = useRef<number>(0);
  const myLastRead = roomQuery.data?.myLastReadMessageId ?? 0;
  useEffect(() => {
    if (!enabled || !lastMessageId) return;
    if (seenLastRef.current !== undefined && lastMessageId > seenLastRef.current) {
      queryClient.invalidateQueries({ queryKey: exchangeKeys.all });
      queryClient.invalidateQueries({ queryKey: exchangeKeys.appointments });
    }
    seenLastRef.current = lastMessageId;

    if (lastMessageId <= Math.max(readRef.current, myLastRead)) return;
    readRef.current = lastMessageId;
    readMessages(chatRoomId, lastMessageId)
      .then(() => queryClient.invalidateQueries({ queryKey: chatKeys.rooms }))
      .catch(() => {
        // 읽음 처리는 실패해도 다음 메시지 때 다시 보낸다
        readRef.current = 0;
      });
  }, [enabled, lastMessageId, myLastRead, chatRoomId, queryClient]);

  const store = useChatStore.getState;
  const appointmentIdOf = (messageId: string) => {
    const message = remoteRoom?.messages.find((item) => item.id === messageId);
    return message?.type === 'proposal' || message?.type === 'completion'
      ? message.appointmentId
      : undefined;
  };

  return {
    room: USE_MOCK_CHAT ? mockRoom : remoteRoom,
    /** 서버 방인지 (목업이면 false) */
    remote: !USE_MOCK_CHAT,
    isLoading: enabled && (roomQuery.isLoading || messagesQuery.isLoading),
    isError: enabled && (roomQuery.isError || messagesQuery.isError),
    refetch: () => Promise.all([roomQuery.refetch(), messagesQuery.refetch()]),

    /** CH-4 텍스트 보내기 */
    sendText: async (text: string) => {
      if (USE_MOCK_CHAT) return store().send(roomId, { type: 'text', text });
      await sendTextMessage(chatRoomId, text);
      await queryClient.invalidateQueries({ queryKey: chatKeys.messages(chatRoomId) });
    },

    /** 사진 보내기. 서버는 이미지 업로드 API(imageKeys)가 붙기 전이라 false */
    sendImage: (uri: string) => {
      if (!USE_MOCK_CHAT) return false;
      store().send(roomId, { type: 'image', uri });
      return true;
    },

    /** A-1 약속 제안 (E-4-1 약속 잡기) */
    propose: async (draft: AppointmentDraft) => {
      if (USE_MOCK_CHAT) {
        const items = mockRoom?.requestItems.filter((item) => draft.itemIds.includes(item.id));
        return store().propose(roomId, {
          meetAt: draft.meetAt.toISOString(),
          place: draft.place.name,
          items: items ?? [],
          isNow: draft.isNow,
        });
      }
      const exchangeIdValue = roomQuery.data?.exchangeId;
      if (exchangeIdValue === undefined) throw new Error('교환 정보를 확인할 수 없어요.');
      await proposeAppointment(exchangeIdValue, {
        timeType: draft.isNow ? 'NOW' : 'SCHEDULED',
        scheduledAt: draft.isNow ? undefined : draft.meetAt.toISOString(),
        place: draft.place,
        offeredItemIds: draft.itemIds.map(Number),
      });
      await refreshCards();
    },

    /** A-6 내가 보낸 제안 철회 */
    withdraw: async (messageId: string) => {
      const appointmentId = appointmentIdOf(messageId);
      if (appointmentId === undefined) return store().withdraw(roomId, messageId);
      await withdrawAppointment(appointmentId);
      await refreshCards();
    },

    /** A-4 약속 수락 */
    accept: async (messageId: string) => {
      const appointmentId = appointmentIdOf(messageId);
      if (appointmentId === undefined) return store().accept(roomId, messageId);
      await acceptAppointment(appointmentId);
      await refreshCards();
    },

    /** A-5 약속 제안 거절 */
    reject: async (messageId: string) => {
      const appointmentId = appointmentIdOf(messageId);
      if (appointmentId === undefined) return store().reject(roomId, messageId);
      await rejectAppointment(appointmentId);
      await refreshCards();
    },

    /** F-1 교환 확인 결과 반영. 서버 방은 카드를 다시 읽는다 */
    resolveCompletion: (messageId: string, state: ConfirmResult['state']) => {
      if (USE_MOCK_CHAT) return store().resolveCompletion(roomId, messageId, state);
      return refreshCards();
    },

    /** CH-6 이 방 알림 끄기 · 켜기 */
    setNotification: async (enabledValue: boolean) => {
      const room = await updateRoomNotification(chatRoomId, enabledValue);
      queryClient.setQueryData(chatKeys.room(chatRoomId), room);
      await queryClient.invalidateQueries({ queryKey: chatKeys.rooms });
    },

    /** BL-1 상대 차단. 채팅 목록과 이 방을 다시 읽는다 */
    block: async () => {
      const userId = roomQuery.data?.counterpart.userId;
      if (userId === undefined) throw new Error('상대 정보를 확인할 수 없어요.');
      await blockMember(userId);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: chatKeys.rooms }),
        queryClient.invalidateQueries({ queryKey: chatKeys.room(chatRoomId) }),
      ]);
    },

    /** CH-7 채팅방 나가기 */
    leave: async () => {
      const result = await leaveChatRoom(chatRoomId);
      await queryClient.invalidateQueries({ queryKey: chatKeys.rooms });
      return result;
    },
  };
}
