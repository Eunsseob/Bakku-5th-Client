import { BellIcon } from 'phosphor-react-native/src/icons/Bell';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Text, View } from 'react-native';

import { EmptyState, TopNavigation, type TopNavigationTab } from '@/shared/components';

import { useChatRooms } from '../hooks/useChatRooms';
import type { ExchangeStatus } from '../types';
import { ChatListItem } from './ChatListItem';
import { SheetMenu } from './SheetMenu';

// E-1 채팅 목록 · E-1-1 비어있음

type Filter = 'all' | 'status' | 'received' | 'sent';

const STATUS_OPTIONS: { key: ExchangeStatus; label: string }[] = [
  { key: 'available', label: '교환 가능' },
  { key: 'reserved', label: '예약중' },
  { key: 'completed', label: '교환 완료' },
];

export function ChatListScreen() {
  const { rooms, isLoading, isError, refetch } = useChatRooms();
  const [filter, setFilter] = useState<Filter>('all');
  const [status, setStatus] = useState<ExchangeStatus | null>(null);
  const [statusSheetOpen, setStatusSheetOpen] = useState(false);

  const visibleRooms = useMemo(() => {
    if (filter === 'received' || filter === 'sent') {
      return rooms.filter((room) => room.direction === filter);
    }
    if (filter === 'status' && status) {
      return rooms.filter((room) => room.status === status);
    }
    return rooms;
  }, [rooms, filter, status]);

  const statusLabel = STATUS_OPTIONS.find((option) => option.key === status)?.label;
  const tabs: TopNavigationTab[] = [
    { key: 'all', label: '전체' },
    {
      key: 'status',
      label: filter === 'status' && statusLabel ? statusLabel : '상태',
      trailingIconVisible: true,
    },
    { key: 'received', label: '받은 요청' },
    { key: 'sent', label: '보낸 요청' },
  ];

  const selectTab = (key: string) => {
    if (key === 'status') {
      setStatusSheetOpen(true);
      return;
    }
    setFilter(key as Filter);
  };

  return (
    <View className="flex-1 bg-surface-standard">
      <TopNavigation
        type="home"
        title="채팅"
        actions={[{ icon: BellIcon, accessibilityLabel: '알림', onPress: () => {} }]}
        tabs={
          rooms.length > 0 ? { items: tabs, selectedKey: filter, onSelect: selectTab } : undefined
        }
      />
      {isError ? (
        <View className="flex-1 justify-center">
          <EmptyState
            title="채팅 목록을 불러오지 못했어요."
            action={{ label: '다시 시도', onPress: () => refetch() }}
          />
        </View>
      ) : isLoading ? null : rooms.length === 0 ? (
        // E-1-1 채팅 목록-비어있음: BDS Empty state
        <View className="flex-1 justify-center">
          <EmptyState
            title="채팅중인 상대가 없습니다"
            description="새로운 교환을 신청해보세요!"
            action={{ label: '교환글 보러가기', onPress: () => router.navigate('/home') }}
          />
        </View>
      ) : (
        <FlatList
          data={visibleRooms}
          keyExtractor={(room) => room.id}
          // E-1: 좌우 16 · 위 22 · 줄 사이 16
          contentContainerClassName="px-4 pb-4 pt-[22px]"
          ItemSeparatorComponent={() => <View className="h-4" />}
          renderItem={({ item }) => (
            <ChatListItem
              room={item}
              onPress={() => router.push({ pathname: '/chat/[id]', params: { id: item.id } })}
            />
          )}
          ListEmptyComponent={
            <Text className="py-10 text-center font-sans text-body-lg font-medium text-object-assistive">
              조건에 맞는 채팅방이 없어요.
            </Text>
          }
        />
      )}
      <SheetMenu
        visible={statusSheetOpen}
        title="상태"
        options={STATUS_OPTIONS}
        selectedKey={filter === 'status' ? (status ?? undefined) : undefined}
        onSelect={(key) => {
          setStatus(key as ExchangeStatus);
          setFilter('status');
          setStatusSheetOpen(false);
        }}
        onClose={() => setStatusSheetOpen(false)}
      />
    </View>
  );
}
