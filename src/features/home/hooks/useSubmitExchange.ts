import {
  createExchange,
  type CreateExchangeOffer,
} from '@/features/appointment/chat/api/exchangeApi';
import { chatKeys } from '@/features/appointment/chat/api/queryKeys';
import { useAuthStore } from '@/shared/api/useAuthStore';
import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { getPostDetail } from '../api/postDetail';

export function useSubmitExchange(postId: number) {
  const queryClient = useQueryClient();
  const inFlight = useRef(false);
  const focus = useRef(0);
  const [busy, setBusy] = useState(false);

  useFocusEffect(
    useCallback(
      () => () => {
        focus.current += 1;
      },
      [],
    ),
  );

  const submitExchange = async (
    prepareOffer: () => CreateExchangeOffer | Promise<CreateExchangeOffer>,
  ) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    const sessionId = useAuthStore.getState().sessionId;
    const currentFocus = focus.current;
    const sameSession = () => useAuthStore.getState().sessionId === sessionId;
    const canContinue = () => sameSession() && focus.current === currentFocus;
    const postKey = ['post-detail', String(postId)];

    try {
      const post = await getPostDetail(String(postId));
      if (!canContinue()) return;
      let roomId = post.chatRoomId;
      if (!roomId) {
        if (!post.canRequest) throw new Error('이 게시글에 교환을 요청할 수 없어요.');
        const offer = await prepareOffer();
        if (!canContinue()) return;
        roomId = await createExchange(postId, offer);
      }
      if (!sameSession()) return;
      void queryClient.invalidateQueries({ queryKey: postKey });
      void queryClient.invalidateQueries({ queryKey: chatKeys.rooms });
      if (canContinue()) router.replace({ pathname: '/chat/[id]', params: { id: String(roomId) } });
    } catch (error) {
      if (!canContinue()) return;
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message || '교환 요청을 보내지 못했어요. 다시 시도해 주세요.'
        : error instanceof Error
          ? error.message
          : '교환 요청을 보내지 못했어요. 다시 시도해 주세요.';
      Alert.alert('교환 요청 실패', message);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  return { busy, submitExchange };
}
