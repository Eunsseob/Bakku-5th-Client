import { BellIcon } from 'phosphor-react-native/src/icons/Bell';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { EmptyState, TopNavigation, type TopNavigationTab } from '@/shared/components';

import { useChatRooms } from '../hooks/useChatRooms';
import type { ExchangeStatus } from '../types';
import { ChatListItem } from './ChatListItem';
import { SheetMenu } from './SheetMenu';

// E 채팅·약속-1: 채팅 목록

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
    <View className="flex-1 bg-white">
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
        // 채팅·약속-1(비어있음): body/lg Medium 회색 문구 + 회색 버튼
        <View className="flex-1 items-center justify-center gap-4">
          <Text className="font-sans text-body-lg font-medium text-gray-300">채팅방이 없어요.</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.navigate('/home')}
            className="rounded-8 bg-gray-75 px-3 py-2"
          >
            <Text className="font-sans text-label-md font-medium text-gray-700">
              교환글 둘러보기
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={visibleRooms}
          keyExtractor={(room) => room.id}
          contentContainerClassName="pb-2 pt-1.5"
          renderItem={({ item }) => (
            <ChatListItem
              room={item}
              onPress={() => router.push({ pathname: '/chat/[id]', params: { id: item.id } })}
            />
          )}
          ListEmptyComponent={
            <Text className="py-10 text-center font-sans text-body-lg font-medium text-gray-300">
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
