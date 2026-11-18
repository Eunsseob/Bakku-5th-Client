import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { TopNavigation } from '@/shared/components';

import { useChatStore } from '../store/useChatStore';
import { useAppointmentDraftStore } from '../store/useAppointmentDraftStore';
import { ItemCheckCard } from './SelectableCards';
import { WireBottomButton } from './wire';

// E 채팅·약속-4: 약속 잡기 > [물건선택] → 교환할 물건 (회색 배경 위 흰 카드 r12, 카드 사이 8)

export function ItemSelectScreen({ roomId }: { roomId: string }) {
  const room = useChatStore((state) => state.rooms[roomId]);
  const storedItemIds = useAppointmentDraftStore((state) => state.selectedItemIds[roomId]);
  const setStoredItemIds = useAppointmentDraftStore((state) => state.setSelectedItemIds);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    () => storedItemIds ?? room?.requestItems.map((item) => item.id) ?? [],
  );

  const toggle = (itemId: string) =>
    setSelectedIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
    );

  return (
    <View className="flex-1 bg-gray-50">
      <TopNavigation
        type="screen"
        title="교환할 물건"
        onBack={() => router.back()}
        trailingLabel="새로 작성"
        onTrailingPress={() => router.push('/write')}
      />
      {room ? (
        <ScrollView contentContainerClassName="gap-2 px-4 py-4">
          {room.requestItems.map((item) => (
            <ItemCheckCard
              key={item.id}
              item={item}
              variant="elevated"
              showThumbnail
              checked={selectedIds.includes(item.id)}
              onPress={() => toggle(item.id)}
            />
          ))}
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="font-sans text-body-lg font-medium text-gray-300">
            채팅방을 찾을 수 없어요.
          </Text>
        </View>
      )}
      <WireBottomButton
        label="확인"
        disabled={!room || selectedIds.length === 0}
        onPress={() => {
          setStoredItemIds(roomId, selectedIds);
          router.back();
        }}
      />
    </View>
  );
}
