import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { EmptyState, LabelButton, TopNavigation } from '@/shared/components';

import { getBlockedMembers, unblockMember } from '../api/mypageApi';
import { mypageKeys } from '../api/queryKeys';
import { useToastMessage } from '../hooks/useToastMessage';
import { ToastOverlay } from './ToastOverlay';

// G-1-4. 설정 - 차단 사용자 (2729:30848). BL-2 목록 · BL-3 차단 해제 후 토스트

const UNBLOCKED = '차단을 해제했습니다';

export function BlockedUsersScreen() {
  const queryClient = useQueryClient();
  const [toast, setToast] = useToastMessage();
  const blocks = useQuery({ queryKey: mypageKeys.blocks, queryFn: () => getBlockedMembers() });

  const unblock = useMutation({
    mutationFn: unblockMember,
    onSuccess: async () => {
      setToast(UNBLOCKED);
      await queryClient.invalidateQueries({ queryKey: mypageKeys.blocks });
    },
    onError: () => setToast('잠시 후 다시 시도해 주세요'),
  });

  const members = blocks.data?.content ?? [];

  let body;
  if (blocks.isError) {
    body = (
      <EmptyState
        title="차단 목록을 불러오지 못했어요."
        action={{ label: '다시 시도', onPress: () => blocks.refetch() }}
      />
    );
  } else if (blocks.data && members.length === 0) {
    body = <EmptyState title="차단한 사용자가 없어요." />;
  }

  return (
    <View className="flex-1 bg-surface-standard">
      <TopNavigation type="screen" title="차단한 사용자" onBack={() => router.back()} />
      {body ? (
        <View className="flex-1 justify-center">{body}</View>
      ) : (
        // 한 줄: 위아래 10 · 닉네임 label/lg/normal object/alternative · [차단해제] Label button
        <ScrollView contentContainerClassName="gap-2 px-4 pb-6 pt-4">
          {members.map((member) => (
            <View key={member.userId} className="flex-row items-center gap-2.5 py-2.5">
              <Text
                numberOfLines={1}
                className="flex-1 font-sans text-label-lg font-medium text-object-alternative"
              >
                {member.nickname}
              </Text>
              <LabelButton
                hierarchy="primary"
                size="lg"
                disabled={unblock.isPending}
                onPress={() => unblock.mutate(member.userId)}
              >
                차단해제
              </LabelButton>
            </View>
          ))}
        </ScrollView>
      )}
      <ToastOverlay message={toast} leading={toast === UNBLOCKED ? 'positive' : undefined} />
    </View>
  );
}
