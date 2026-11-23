import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { USE_MOCK_CHAT } from '@/constants/chat';

import { getChatRooms } from '../api/chatApi';
import { toChatRoomSummary } from '../api/mapChat';
import { MOCK_CHAT_ROOMS } from '../api/mockChats';
import { chatKeys } from '../api/queryKeys';
import { useChatStore } from '../store/useChatStore';

/** 목록 새로고침 간격. 소켓(MESSAGE_CREATED)이 붙기 전까지 주기적으로 다시 읽는다 */
const POLL_MS = 10_000;
/** CH-1 한 번에 최대 50개. 더 보기(nextCursor)는 목록이 길어지면 붙인다 */
const PAGE_SIZE = 50;

/** E 채팅·약속-1 채팅 목록. 서버(CH-1) 또는 목업 */
export function useChatRooms() {
  const roomDetails = useChatStore((state) => state.rooms);
  const query = useQuery({
    queryKey: chatKeys.rooms,
    queryFn: () => getChatRooms({ size: PAGE_SIZE }),
    enabled: !USE_MOCK_CHAT,
    refetchInterval: POLL_MS,
  });

  // 채팅방에서 돌아오면 안 읽은 수 · 마지막 메시지를 다시 읽는다
  const { refetch } = query;
  useFocusEffect(
    useCallback(() => {
      if (!USE_MOCK_CHAT) refetch();
    }, [refetch]),
  );

  const rooms = useMemo(() => {
    if (!USE_MOCK_CHAT) return query.data?.content.map(toChatRoomSummary) ?? [];
    // 목업: 약속 확정 · 취소로 바뀐 글 상태(예약중 등)를 목록에도 반영한다
    return MOCK_CHAT_ROOMS.map((summary) => ({
      ...summary,
      status: roomDetails[summary.id]?.post.status ?? summary.status,
    }));
  }, [query.data, roomDetails]);

  return {
    rooms,
    isLoading: !USE_MOCK_CHAT && query.isLoading,
    isError: !USE_MOCK_CHAT && query.isError,
    refetch,
  };
}
