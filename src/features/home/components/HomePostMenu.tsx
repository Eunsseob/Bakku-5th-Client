import { useAuthStore } from '@/shared/api/useAuthStore';
import { BottomSheet, Button, ListItem } from '@/shared/components';
import { type InfiniteData, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ArrowsClockwiseIcon } from 'phosphor-react-native/src/icons/ArrowsClockwise';
import { PencilSimpleIcon } from 'phosphor-react-native/src/icons/PencilSimple';
import { SirenIcon } from 'phosphor-react-native/src/icons/Siren';
import { TrashIcon } from 'phosphor-react-native/src/icons/Trash';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';

import { homePostsKey, type HomePostsPage } from '../api/homePosts';
import {
  deletePost,
  getPostDetail,
  postDeleteError,
  postDeleteLockedMessage,
  postEditLockedMessage,
  postDetailError,
} from '../api/postDetail';
import { useExchangeStore } from '../store/useExchangeStore';

export default function HomePostMenu({
  postId,
  sessionId,
  onClose,
}: {
  postId: number;
  sessionId: number;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const deleteInProgress = useRef(false);
  const id = String(postId);
  const detail = useQuery({
    queryKey: ['home-post-menu', sessionId, postId],
    queryFn: ({ signal }) => getPostDetail(id, signal),
    staleTime: 0,
    retry: false,
  });
  const post = detail.isSuccess ? detail.data : undefined;
  const locked = post?.status !== 'AVAILABLE';
  const sameSession = () => useAuthStore.getState().sessionId === sessionId;
  const finishDelete = () => {
    deleteInProgress.current = false;
    setBusy(false);
  };
  const close = () => {
    if (!deleteInProgress.current) onClose();
  };

  const confirmDelete = async () => {
    if (!post?.isMine || locked || deleteInProgress.current || !sameSession()) return;
    deleteInProgress.current = true;
    setBusy(true);
    try {
      const latest = await getPostDetail(id);
      if (!sameSession() || !latest.isMine || latest.status !== 'AVAILABLE') {
        if (sameSession()) Alert.alert('교환글 삭제', postDeleteLockedMessage);
        finishDelete();
        return;
      }
      Alert.alert(
        '교환글을 삭제할까요?',
        latest.requestCount > 0
          ? `받은 요청이 ${latest.requestCount}개 있어요. 그래도 교환글을 삭제할까요?`
          : '삭제한 교환글은 복구할 수 없어요.',
        [
          { text: '취소', style: 'cancel', onPress: finishDelete },
          {
            text: '삭제하기',
            style: 'destructive',
            onPress: async () => {
              try {
                if (!sameSession()) return;
                await deletePost(id);
                if (!sameSession()) return;
                const queryKey = [...homePostsKey, sessionId];
                await queryClient.cancelQueries({ queryKey });
                if (!sameSession()) return;
                queryClient.setQueriesData<InfiniteData<HomePostsPage>>(
                  { queryKey },
                  (cached) =>
                    cached && {
                      ...cached,
                      pages: cached.pages.map((page) => ({
                        ...page,
                        content: page.content.filter(({ id }) => id !== post.id),
                      })),
                    },
                );
                useExchangeStore.getState().removeOwnPost(post.id);
                void queryClient.invalidateQueries({ queryKey });
                onClose();
              } catch (error) {
                if (sameSession()) Alert.alert('교환글 삭제 실패', postDeleteError(error));
              } finally {
                finishDelete();
              }
            },
          },
        ],
        { cancelable: false },
      );
    } catch (error) {
      if (sameSession()) Alert.alert('삭제 가능 여부 확인 실패', postDeleteError(error));
      finishDelete();
    }
  };

  return (
    <BottomSheet
      visible
      animationType="slide"
      minimumBottomInset={34}
      onRequestClose={close}
    >
      {detail.isFetching ? (
        <View className="h-14 items-center justify-center">
          <ActivityIndicator accessibilityLabel="게시글 메뉴 불러오는 중" />
        </View>
      ) : detail.isError ? (
        <View className="gap-2 pt-2">
          <Text className="font-sans text-label-md text-object-bold">
            {postDetailError(detail.error)}
          </Text>
          <Button hierarchy="secondary" size="md" onPress={() => void detail.refetch()}>
            다시 시도
          </Button>
        </View>
      ) : post?.isMine ? (
        <View className="pt-2">
          <ListItem
            label="수정하기"
            leading={{ type: 'icon', icon: PencilSimpleIcon }}
            trailing="chevronRight"
            disabled={locked || busy}
            accessibilityHint={locked ? postEditLockedMessage : undefined}
            onPress={() => {
              close();
              router.push({ pathname: '/post/edit/[id]', params: { id } });
            }}
          />
          <ListItem
            label="교환 완료로 바꾸기"
            leading={{ type: 'icon', icon: ArrowsClockwiseIcon }}
            trailing="chevronRight"
            disabled={busy || post.status === 'COMPLETED'}
            onPress={() => {
              close();
              Alert.alert(
                '교환 완료로 바꾸기',
                '게시글에서 바로 교환을 완료하는 기능은 준비 중이에요.',
              );
            }}
          />
          <ListItem
            label="삭제하기"
            leading={{ type: 'icon', icon: TrashIcon }}
            trailing="chevronRight"
            feedback="destructive"
            disabled={locked || busy}
            accessibilityHint={locked ? postDeleteLockedMessage : undefined}
            onPress={() => void confirmDelete()}
          />
        </View>
      ) : post ? (
        <View className="pt-2">
          <ListItem
            label="신고하기"
            leading={{ type: 'icon', icon: SirenIcon }}
            trailing="chevronRight"
            feedback="destructive"
            onPress={() => {
              close();
              router.push({ pathname: '/post/report', params: { id } });
            }}
          />
        </View>
      ) : null}
      <View className="pb-2 pt-3">
        <Button hierarchy="secondary" className="self-stretch" disabled={busy} onPress={close}>
          닫기
        </Button>
      </View>
    </BottomSheet>
  );
}
