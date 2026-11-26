import { router } from 'expo-router';
import { CalendarBlankIcon } from 'phosphor-react-native/src/icons/CalendarBlank';
import { ClockIcon } from 'phosphor-react-native/src/icons/Clock';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, ScrollView, type ScrollViewInstance, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LocationSelection from '@/features/post-create/components/LocationSelection';
import { ActionArea, EmptyState, Toast, TopNavigation } from '@/shared/components';

import { useChatRoom } from '../hooks/useChatRoom';
import type { AppointmentDraft } from '../types';
import { formatClock, formatMonthDay } from '../utils/formatTime';
import {
  FieldError,
  ItemCheckCard,
  PickerControl,
  PlaceControl,
  SelectionCard,
} from './SelectableCards';
import { SheetMenu } from './SheetMenu';

// E-4-1 교환 약속 잡기: 날짜 선택 · 시간 · 장소 · 교환할 굿즈 → [약속 제안하기] (A-1 약속 제안)
// [약속 제안하기] 는 항상 누를 수 있고, 빠진 칸을 모두 안내한 뒤 가장 위 칸으로 스크롤한다.
// 교환할 굿즈는 교환 요청 때 낸 물건 중에서 고른다 (1개면 자동 선택, 칸 숨김).

type Sheet = 'date' | 'time' | null;
type Field = 'date' | 'time' | 'place' | 'items';
type Place = AppointmentDraft['place'];

/** 직접 고를 수 있는 날짜: 내일부터 7일 (서버: 오늘~7일 후) */
const PICKABLE_DAYS = 7;
/** 토스트가 떠 있는 시간 */
const TOAST_MS = 3000;

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function upcomingDays(today: Date) {
  return Array.from({ length: PICKABLE_DAYS }, (_, index) => {
    const date = startOfDay(today);
    date.setDate(date.getDate() + index + 1);
    return date;
  });
}

/** 30분 단위 시간 (서버: 분은 10의 배수). 오늘이면 지금 이후만 */
function timeSlots(day: Date, now: Date) {
  const slots: Date[] = [];
  for (let minutes = 9 * 60; minutes <= 22 * 60; minutes += 30) {
    const slot = startOfDay(day);
    slot.setMinutes(minutes);
    if (slot > now) slots.push(slot);
  }
  return slots;
}

/** 칸 이름 (BDS Field/Label: label/md bold) */
function FieldLabel({ children }: { children: string }) {
  return (
    <Text className="font-sans text-label-md font-semibold text-object-boldest">{children}</Text>
  );
}

export function AppointmentScreen({ roomId }: { roomId: string }) {
  const chat = useChatRoom(roomId);
  const { room } = chat;
  const [now] = useState(() => new Date());

  const [dateChoice, setDateChoice] = useState<'today' | 'pick' | null>(null);
  const [pickedDate, setPickedDate] = useState<Date | null>(null);
  const [timeChoice, setTimeChoice] = useState<'now' | 'pick' | null>(null);
  const [pickedTime, setPickedTime] = useState<Date | null>(null);
  const [place, setPlace] = useState<Place | null>(null);
  /** 장소 선택 화면을 다시 열 때 넘겨줄 지역 이름 */
  const [placeRegion, setPlaceRegion] = useState('');
  const [pickedItemIds, setPickedItemIds] = useState<string[]>([]);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [placeOpen, setPlaceOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const scrollRef = useRef<ScrollViewInstance>(null);
  const fieldY = useRef<Partial<Record<Field, number>>>({});

  const day = dateChoice === 'today' ? startOfDay(now) : pickedDate;
  const days = useMemo(() => upcomingDays(now), [now]);
  const slots = useMemo(() => timeSlots(day ?? now, now), [day, now]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!room) {
    return (
      <View className="flex-1 bg-surface-standard">
        <TopNavigation type="screen" onBack={() => router.back()} />
        <View className="flex-1 justify-center">
          {chat.isLoading ? null : <EmptyState title="채팅방을 찾을 수 없어요." />}
        </View>
      </View>
    );
  }

  const items = room.requestItems;
  // 고를 수 있는 굿즈가 1개면 자동으로 고르고 칸을 숨긴다
  const showItems = items.length > 1;
  const itemIds = showItems ? pickedItemIds : items.map((item) => item.id);

  const errors: Partial<Record<Field, string>> = {
    date: day ? undefined : '날짜를 선택해 주세요.',
    time:
      timeChoice === 'now' || (timeChoice === 'pick' && pickedTime)
        ? undefined
        : '시간을 선택해 주세요.',
    place: place ? undefined : '장소를 선택해 주세요.',
    items: itemIds.length > 0 ? undefined : '교환할 굿즈를 선택해 주세요.',
  };
  const shown = (field: Field) => (submitted ? errors[field] : undefined);

  const selectToday = () => {
    setDateChoice('today');
    setPickedDate(null);
    // 날짜가 바뀌면 그날 고를 수 없는 시간이 남지 않게 다시 고르게 한다
    if (timeChoice === 'pick') setPickedTime(null);
  };

  const pickDate = (date: Date) => {
    setDateChoice('pick');
    setPickedDate(date);
    // '지금 바로'는 오늘만 된다
    if (timeChoice === 'now') setTimeChoice(null);
    setPickedTime(null);
  };

  const selectNow = () => {
    setTimeChoice('now');
    setPickedTime(null);
    // 지금 바로 만나면 날짜는 오늘
    setDateChoice('today');
    setPickedDate(null);
  };

  const toggleItem = (itemId: string) =>
    setPickedItemIds((ids) =>
      ids.includes(itemId) ? ids.filter((id) => id !== itemId) : [...ids, itemId],
    );

  const submit = async () => {
    setSubmitted(true);
    const order: Field[] = ['date', 'time', 'place', 'items'];
    const firstError = order.find((field) => errors[field]);
    if (firstError) {
      scrollRef.current?.scrollTo({ y: fieldY.current[firstError] ?? 0, animated: true });
      return;
    }
    if (!place || busy) return;
    const isNow = timeChoice === 'now';
    const meetAt = isNow ? new Date() : pickedTime;
    if (!meetAt) return;

    setBusy(true);
    try {
      // 채팅방에 약속 제안 카드(E-5)가 생기고 돌아간다
      await chat.propose({ isNow, meetAt, place, itemIds });
      router.back();
    } catch {
      setToast('잠시 후 다시 시도해 주세요');
    } finally {
      setBusy(false);
    }
  };

  const section = (field: Field, gap: string, children: ReactNode) => (
    <View
      className={gap}
      onLayout={(event) => {
        fieldY.current[field] = event.nativeEvent.layout.y;
      }}
    >
      {children}
    </View>
  );

  return (
    <View className="flex-1 bg-surface-standard">
      <TopNavigation type="screen" title="교환 약속 잡기" onBack={() => router.back()} />
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerClassName="gap-9 px-4 pb-6 pt-3"
      >
        {section(
          'date',
          'gap-2',
          <>
            <FieldLabel>날짜 선택</FieldLabel>
            <View className="gap-2">
              <SelectionCard
                title="오늘"
                description={formatMonthDay(now)}
                selected={dateChoice === 'today'}
                onPress={selectToday}
              />
              <PickerControl
                icon={CalendarBlankIcon}
                placeholder="직접 선택"
                accessibilityLabel="날짜 직접 선택"
                value={dateChoice === 'pick' && pickedDate ? formatMonthDay(pickedDate) : undefined}
                onPress={() => setSheet('date')}
              />
            </View>
            <FieldError message={shown('date')} />
          </>,
        )}

        {section(
          'time',
          'gap-2',
          <>
            <FieldLabel>시간</FieldLabel>
            <View className="gap-2">
              <PickerControl
                icon={ClockIcon}
                placeholder="직접 선택"
                accessibilityLabel="시간 직접 선택"
                value={timeChoice === 'pick' && pickedTime ? formatClock(pickedTime) : undefined}
                onPress={() => setSheet('time')}
              />
              <SelectionCard
                title="지금 바로"
                description={formatClock(now)}
                selected={timeChoice === 'now'}
                onPress={selectNow}
              />
            </View>
            <FieldError message={shown('time')} />
          </>,
        )}

        {section(
          'place',
          'gap-3',
          <>
            <FieldLabel>장소</FieldLabel>
            <View className="gap-2">
              <PlaceControl
                place={place?.name}
                error={!!shown('place')}
                onPress={() => setPlaceOpen(true)}
              />
              <FieldError message={shown('place')} />
            </View>
          </>,
        )}

        {showItems
          ? section(
              'items',
              'gap-4',
              <>
                <FieldLabel>교환할 굿즈</FieldLabel>
                <View className="gap-2">
                  {items.map((item) => (
                    <ItemCheckCard
                      key={item.id}
                      item={item}
                      checked={itemIds.includes(item.id)}
                      onPress={() => toggleItem(item.id)}
                    />
                  ))}
                  <FieldError message={shown('items')} />
                </View>
              </>,
            )
          : null}
      </ScrollView>

      {toast ? (
        <View pointerEvents="none" className="absolute inset-x-4 bottom-[120px]">
          <Toast title={toast} />
        </View>
      ) : null}

      <ActionArea main={{ label: '약속 제안하기', onPress: submit, disabled: busy }} />

      <SheetMenu
        visible={sheet === 'date'}
        title="날짜 선택"
        options={days.map((date) => ({ key: date.toISOString(), label: formatMonthDay(date) }))}
        selectedKey={dateChoice === 'pick' ? pickedDate?.toISOString() : undefined}
        onSelect={(key) => {
          pickDate(new Date(key));
          setSheet(null);
        }}
        onClose={() => setSheet(null)}
      />
      <SheetMenu
        visible={sheet === 'time'}
        title="시간 선택"
        options={slots.map((slot) => ({ key: slot.toISOString(), label: formatClock(slot) }))}
        selectedKey={timeChoice === 'pick' ? pickedTime?.toISOString() : undefined}
        onSelect={(key) => {
          setPickedTime(new Date(key));
          setTimeChoice('pick');
          // 날짜를 아직 안 골랐으면 고른 시간은 오늘
          if (!dateChoice) setDateChoice('today');
          setSheet(null);
        }}
        onClose={() => setSheet(null)}
      />

      {/* 장소 선택: 교환글 작성과 같은 B-4 교환 장소 화면 (지도 · 장소 검색) */}
      <Modal
        visible={placeOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setPlaceOpen(false)}
      >
        {placeOpen ? (
          <SafeAreaProvider>
            <LocationSelection
              initialLocation={place?.name ?? ''}
              initialDetail=""
              initialRegionName={placeRegion}
              initialPoint={place ? { latitude: place.lat, longitude: place.lng } : undefined}
              onClose={() => setPlaceOpen(false)}
              onConfirm={(location, regionName, point) => {
                setPlaceRegion(regionName);
                setPlace({ name: location, lat: point.latitude, lng: point.longitude });
                setPlaceOpen(false);
              }}
            />
          </SafeAreaProvider>
        ) : null}
      </Modal>
    </View>
  );
}
