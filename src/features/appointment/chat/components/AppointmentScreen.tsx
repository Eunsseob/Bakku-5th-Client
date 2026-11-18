import { router } from 'expo-router';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';
import { MapPinIcon } from 'phosphor-react-native/src/icons/MapPin';
import { type ReactNode, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { EmptyState, Icon, TopNavigation } from '@/shared/components';

import { useAppointmentDraftStore } from '../store/useAppointmentDraftStore';
import { useChatStore } from '../store/useChatStore';
import { formatClock, formatMonthDay } from '../utils/formatTime';
import { ItemCheckCard, OptionCard } from './SelectableCards';
import { SheetMenu } from './SheetMenu';
import { WIRE, WireBottomButton } from './wire';

// E 채팅·약속-4 (1차): 약속 잡기 — 날짜 · 시간(지금 바로 / 시간 선택) · 장소 · 교환할 물건
// '교환 약속'(물건 편집 · 약속 전 알림) 화면은 2차

type Sheet = 'date' | 'time' | null;

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** 오늘을 뺀 앞으로 14일 */
function upcomingDays(today: Date) {
  return Array.from({ length: 14 }, (_, index) => {
    const date = startOfDay(today);
    date.setDate(date.getDate() + index + 1);
    return date;
  });
}

/** 30분 단위 시간. 오늘이면 지금 이후만 */
function timeSlots(day: Date, now: Date) {
  const slots: Date[] = [];
  for (let minutes = 9 * 60; minutes <= 22 * 60; minutes += 30) {
    const slot = startOfDay(day);
    slot.setMinutes(minutes);
    if (slot > now) slots.push(slot);
  }
  return slots;
}

function Section({
  title,
  trailing,
  children,
}: {
  title: string;
  trailing?: ReactNode;
  children: ReactNode;
}) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="font-sans text-label-md font-semibold text-gray-900">{title}</Text>
        {trailing}
      </View>
      {children}
    </View>
  );
}

export function AppointmentScreen({ roomId }: { roomId: string }) {
  const room = useChatStore((state) => state.rooms[roomId]);
  const propose = useChatStore((state) => state.propose);
  const storedItemIds = useAppointmentDraftStore((state) => state.selectedItemIds[roomId]);
  const setStoredItemIds = useAppointmentDraftStore((state) => state.setSelectedItemIds);
  const [now] = useState(() => new Date());

  const [dateMode, setDateMode] = useState<'today' | 'pick'>('today');
  const [pickedDate, setPickedDate] = useState<Date | null>(null);
  const [timeMode, setTimeMode] = useState<'now' | 'pick'>('now');
  const [pickedTime, setPickedTime] = useState<Date | null>(null);
  const [sheet, setSheet] = useState<Sheet>(null);

  const day = dateMode === 'today' ? startOfDay(now) : pickedDate;
  const days = useMemo(() => upcomingDays(now), [now]);
  const slots = useMemo(() => (day ? timeSlots(day, now) : []), [day, now]);

  if (!room) {
    return (
      <View className="flex-1 bg-white">
        <TopNavigation type="screen" backType="close" onBack={() => router.back()} />
        <View className="flex-1 justify-center">
          <EmptyState title="채팅방을 찾을 수 없어요." />
        </View>
      </View>
    );
  }

  const selectedIds = storedItemIds ?? room.requestItems.map((item) => item.id);
  const selectedItems = room.requestItems.filter((item) => selectedIds.includes(item.id));
  // '지금 바로'는 오늘일 때만 고를 수 있다
  const canMeetNow = dateMode === 'today';
  const usingNow = canMeetNow && timeMode === 'now';
  const canSubmit = day !== null && (usingNow || pickedTime !== null) && selectedItems.length > 0;

  const toggleItem = (itemId: string) => {
    const next = selectedIds.includes(itemId)
      ? selectedIds.filter((id) => id !== itemId)
      : [...selectedIds, itemId];
    setStoredItemIds(room.id, next);
  };

  const selectDay = (mode: 'today' | 'pick', date: Date | null) => {
    setDateMode(mode);
    setPickedDate(date);
    // 날짜가 바뀌면 그날 고를 수 없는 시간이 남지 않게 시간을 다시 고르게 한다
    setPickedTime(null);
    setTimeMode(mode === 'today' ? 'now' : 'pick');
  };

  const submit = () => {
    const meetAt = usingNow ? new Date() : pickedTime;
    if (!meetAt) return;
    // 채팅방에 약속 제안 카드(채팅·약속-5)를 보내고 돌아간다
    propose(room.id, {
      meetAt: meetAt.toISOString(),
      place: room.post.place,
      items: selectedItems,
      isNow: usingNow,
    });
    router.back();
  };

  return (
    <View className="flex-1 bg-white">
      <TopNavigation
        type="screen"
        backType="close"
        title="약속 잡기"
        onBack={() => router.back()}
      />
      <ScrollView contentContainerClassName="gap-8 px-4 pb-6 pt-4">
        <Section title="날짜">
          <View className="gap-2.5">
            <OptionCard
              title="오늘"
              subtitle={formatMonthDay(now)}
              selected={dateMode === 'today'}
              onPress={() => selectDay('today', null)}
            />
            <OptionCard
              title="날짜 선택"
              subtitle={pickedDate ? formatMonthDay(pickedDate) : undefined}
              selected={dateMode === 'pick'}
              onPress={() => setSheet('date')}
            />
          </View>
        </Section>

        <Section title="시간">
          <View className="gap-2.5">
            {canMeetNow ? (
              <OptionCard
                title="지금 바로"
                selected={timeMode === 'now'}
                onPress={() => setTimeMode('now')}
              />
            ) : null}
            <OptionCard
              title="시간 선택"
              subtitle={pickedTime ? formatClock(pickedTime) : undefined}
              selected={timeMode === 'pick'}
              onPress={() => setSheet('time')}
            />
          </View>
        </Section>

        <Section title="장소">
          {/* TODO: 장소 선택 화면 연결 (지금은 교환글의 희망 장소) */}
          <Pressable
            accessibilityRole="button"
            className="h-[52px] flex-row items-center gap-2 rounded-8 border border-gray-150 px-3.5"
          >
            <Icon icon={MapPinIcon} size="lg" weight="fill" color={WIRE.neutral} />
            <Text className="flex-1 font-sans text-body-lg font-medium text-gray-600">
              {room.post.place}
            </Text>
            <Icon icon={CaretRightIcon} size="xl" color={WIRE.assistive} />
          </Pressable>
        </Section>

        <Section
          title="교환할 물건"
          trailing={
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => router.push({ pathname: '/chat/[id]/items', params: { id: room.id } })}
            >
              <Text className="font-sans text-label-md font-medium text-gray-900">물건선택</Text>
            </Pressable>
          }
        >
          <View className="gap-2.5">
            {room.requestItems.map((item) => (
              <ItemCheckCard
                key={item.id}
                item={item}
                checked={selectedIds.includes(item.id)}
                onPress={() => toggleItem(item.id)}
              />
            ))}
          </View>
        </Section>
      </ScrollView>

      <WireBottomButton label="약속 제안하기" disabled={!canSubmit} onPress={submit} />

      <SheetMenu
        visible={sheet === 'date'}
        title="날짜 선택"
        options={days.map((date) => ({ key: date.toISOString(), label: formatMonthDay(date) }))}
        selectedKey={pickedDate?.toISOString()}
        onSelect={(key) => {
          selectDay('pick', new Date(key));
          setSheet(null);
        }}
        onClose={() => setSheet(null)}
      />
      <SheetMenu
        visible={sheet === 'time'}
        title="시간 선택"
        options={slots.map((slot) => ({ key: slot.toISOString(), label: formatClock(slot) }))}
        selectedKey={pickedTime?.toISOString()}
        onSelect={(key) => {
          setPickedTime(new Date(key));
          setTimeMode('pick');
          setSheet(null);
        }}
        onClose={() => setSheet(null)}
      />
    </View>
  );
}
