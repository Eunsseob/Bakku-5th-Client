import { semantic } from '@/design-tokens';
import { router } from 'expo-router';
import { ArrowsLeftRightIcon } from 'phosphor-react-native/src/icons/ArrowsLeftRight';
import { DotsThreeVerticalIcon } from 'phosphor-react-native/src/icons/DotsThreeVertical';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { BottomSheet, Icon, IconButton, TopNavigation } from '@/shared/components';

import {
  type ExchangeHistory,
  type ExchangeHistoryResult,
  MOCK_EXCHANGE_HISTORY,
} from '../../api/mockExchangeHistory';
import { useToastMessage } from '../../hooks/useToastMessage';
import { MiniBadge } from '../common/MiniBadge';
import { ToastOverlay } from '../common/ToastOverlay';

// G-2 교환 내역 (추가 프레임 5-07 · 3115:53152, ⋮ 메뉴 3115:53233, 0건 3115:53323)
// TODO: 교환 내역 API 가 생기면 목업(MOCK_EXCHANGE_HISTORY) 대신 서버 데이터로 바꾼다

type Filter = 'ALL' | ExchangeHistoryResult;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'COMPLETED', label: '교환 완료' },
  { value: 'FAILED', label: '못 함 · 취소' },
];

function formatDate(iso: string) {
  const date = new Date(iso);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

/** 칩: r16 · 안쪽 12×6 · 13 medium. 고른 칩은 #2b2d36 흰 글씨, 나머지는 #f3f4f6 회색 글씨 */
function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`rounded-16 px-3 py-1.5 ${selected ? 'bg-surface-inverse-deep' : 'bg-surface-deeper'}`}
    >
      <Text
        className={`font-sans text-body-xs font-medium ${selected ? 'text-object-inverse-boldest' : 'text-object-alternative'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** 내역 한 줄: 내 제품 ⇄ 받은 제품 · 상대 · 날짜 · 배지 (안쪽 16×14) */
function HistoryRow({ item, onMore }: { item: ExchangeHistory; onMore: () => void }) {
  const completed = item.result === 'COMPLETED';
  return (
    <View className="flex-row items-center justify-between gap-2 px-4 py-3.5">
      <View className="flex-1 gap-1">
        <View className="flex-row items-center gap-1.5">
          <Text
            numberOfLines={1}
            className="shrink font-sans text-body-md font-medium text-object-boldest"
          >
            {item.myItem}
          </Text>
          <Icon icon={ArrowsLeftRightIcon} size="sm" color={semantic.object.alternative} />
          <Text
            numberOfLines={1}
            className="shrink font-sans text-body-md font-medium text-object-boldest"
          >
            {item.receivedItem}
          </Text>
        </View>
        <Text className="font-sans text-label-sm font-normal text-object-alternative">
          {`${item.partnerNickname ?? '탈퇴한 사용자'} · ${formatDate(item.exchangedAt)}`}
        </Text>
        <View className="flex-row items-start gap-1">
          {completed ? (
            <>
              <MiniBadge tone="dark">교환 완료</MiniBadge>
              {item.autoCompleted ? <MiniBadge tone="light">자동</MiniBadge> : null}
            </>
          ) : (
            <MiniBadge tone="light">못 함 · 취소</MiniBadge>
          )}
        </View>
      </View>
      {/* 못 함 · 취소 건은 ⋮ 가 없다 (신고할 교환이 없음) */}
      {completed ? (
        <IconButton
          icon={DotsThreeVerticalIcon}
          accessibilityLabel="더보기"
          size="lg"
          onPress={onMore}
        />
      ) : (
        <View className="size-5" />
      )}
    </View>
  );
}

export function ExchangeHistoryScreen() {
  const [toast, setToast] = useToastMessage();
  const [filter, setFilter] = useState<Filter>('ALL');
  const [menuItem, setMenuItem] = useState<ExchangeHistory | null>(null);

  const visible = MOCK_EXCHANGE_HISTORY.filter(
    (item) => filter === 'ALL' || item.result === filter,
  );
  const closeMenu = () => setMenuItem(null);

  return (
    <View className="flex-1 bg-surface-standard">
      <TopNavigation type="screen" title="교환 내역" onBack={() => router.back()} />

      <View className="flex-row items-start gap-2 px-4 py-2">
        {FILTERS.map((item) => (
          <FilterChip
            key={item.value}
            label={item.label}
            selected={filter === item.value}
            onPress={() => setFilter(item.value)}
          />
        ))}
      </View>

      {visible.length === 0 ? (
        // 0건: 칩 아래 220 에 15 회색 문구
        <View className="items-center pt-[220px]">
          <Text className="font-sans text-body-md font-normal text-object-alternative">
            아직 교환 내역이 없어요
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerClassName="pb-6">
          {visible.map((item) => (
            <View key={item.id}>
              <HistoryRow item={item} onMore={() => setMenuItem(item)} />
              <View className="h-px bg-stroke-subtler" />
            </View>
          ))}
        </ScrollView>
      )}

      {/* 5-07 ⋮ 메뉴: 신고하기(글자만) · [닫기] */}
      <BottomSheet visible={!!menuItem} onRequestClose={closeMenu}>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            closeMenu();
            // TODO: RP-1 신고하기 화면이 생기면 연결 (게시글 상세 신고도 아직 준비 중)
            setToast('신고 기능은 준비 중이에요');
          }}
          className="flex-row items-center px-1 py-3.5 active:bg-surface-deep"
        >
          <Text className="font-sans text-label-lg font-normal text-object-boldest">신고하기</Text>
        </Pressable>
        <View className="pb-2 pt-2">
          <Pressable
            accessibilityRole="button"
            onPress={closeMenu}
            className="h-[52px] items-center justify-center rounded-12 bg-surface-deeper px-3 active:bg-surface-deepest"
          >
            <Text className="font-sans text-label-lg font-medium text-object-boldest">닫기</Text>
          </Pressable>
        </View>
      </BottomSheet>
      <ToastOverlay message={toast} />
    </View>
  );
}
