import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import type { ExchangeItem } from '../types';
import { ItemConditionBadge } from './StatusBadges';
import { WireCheckbox, WireRadio } from './wire';

// 약속 잡기의 선택 카드 (와이어프레임 List: 안쪽 16, r8, 선택 시 진한 테두리)

const OUTLINE = {
  /** 라디오 선택: 2px #364153 */
  radio: 'border-2 border-gray-700',
  /** 체크 선택: 1px #364153 */
  check: 'border border-gray-700',
  idle: 'border border-gray-150',
};

/** 라디오가 붙은 선택 카드 (예: 오늘 / 날짜 선택). 선택되면 제목 16 Medium */
export function OptionCard({
  title,
  subtitle,
  selected,
  onPress,
}: {
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      className={`flex-row items-center gap-4 rounded-8 p-4 ${selected ? OUTLINE.radio : OUTLINE.idle}`}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <View className="flex-1 gap-0.5">
        <Text
          className={`font-sans text-label-lg text-gray-900 ${selected ? 'font-medium' : 'font-normal'}`}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text className="font-sans text-body-xs font-normal text-gray-600">{subtitle}</Text>
        ) : null}
      </View>
      <WireRadio checked={selected} />
    </Pressable>
  );
}

/**
 * 체크박스가 붙은 물건 카드.
 * outlined: 약속 잡기 (테두리 r8, 이름 옆 태그)
 * elevated: 물건 선택 화면 (회색 배경 위 흰 카드 r12, 사진 64)
 */
export function ItemCheckCard({
  item,
  checked,
  onPress,
  variant = 'outlined',
  showThumbnail = false,
}: {
  item: ExchangeItem;
  checked: boolean;
  onPress: () => void;
  variant?: 'outlined' | 'elevated';
  showThumbnail?: boolean;
}) {
  const elevated = variant === 'elevated';
  const container = elevated
    ? 'gap-3 rounded-12 bg-white p-3'
    : `gap-4 rounded-8 p-4 ${checked ? OUTLINE.check : OUTLINE.idle}`;

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={item.name}
      onPress={onPress}
      className={`flex-row items-center ${container}`}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      {showThumbnail ? (
        item.imageUrl ? (
          <Image
            source={item.imageUrl}
            contentFit="cover"
            style={{ width: 64, height: 64, borderRadius: 8 }}
          />
        ) : (
          <View className="size-16 rounded-8 bg-gray-50" />
        )
      ) : null}
      <View
        className={`flex-1 ${showThumbnail ? 'items-start gap-1' : 'flex-row items-center gap-2'}`}
      >
        <Text
          numberOfLines={1}
          className="shrink font-sans text-label-lg font-normal text-gray-900"
        >
          {item.name}
        </Text>
        <ItemConditionBadge condition={item.condition} />
      </View>
      <WireCheckbox checked={checked} />
    </Pressable>
  );
}
