import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';
import { MapPinIcon } from 'phosphor-react-native/src/icons/MapPin';
import { Pressable, Text, View } from 'react-native';

import { semantic } from '@/design-tokens';
import {
  Badge,
  CheckboxMark,
  Icon,
  type IconComponent,
  InteractionLayer,
  RadioMark,
} from '@/shared/components';

import type { ExchangeItem } from '../types';
import { CONDITION_LABEL } from './StatusBadges';

// E-4-1 약속 잡기의 선택 요소 (BDS Selection Card · Field/Control · 교환할 굿즈 카드)

/** 칸 아래 에러 안내 (BDS Text Field 에러 메시지와 같은 글자) */
export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <Text className="font-sans text-label-md font-normal text-theme-red-bold">{message}</Text>;
}

/**
 * BDS Selection Card: 안쪽 16 · r8 · 라디오 20.
 * 선택되면 테두리 2px stroke/alpha/bold 와 설명(body/xs)을 보여준다. 테두리가 두꺼워져도 크기는 같다.
 */
export function SelectionCard({
  title,
  description,
  selected,
  onPress,
}: {
  title: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      className={`flex-row items-center gap-3 rounded-8 ${selected ? 'border-2 border-stroke-alpha-bold p-[15px]' : 'border border-stroke-alpha-subtle p-4'}`}
    >
      {({ pressed }) => (
        <>
          <View className="flex-1 gap-0.5">
            <Text className="font-sans text-label-lg font-semibold text-object-bolder">
              {title}
            </Text>
            {selected && description ? (
              <Text className="font-sans text-body-xs font-normal text-object-alternative">
                {description}
              </Text>
            ) : null}
          </View>
          <RadioMark checked={selected} />
          <InteractionLayer pressed={pressed} color={semantic.fill.boldest} radius={8} />
        </>
      )}
    </Pressable>
  );
}

/**
 * BDS Field/Control (직접 선택): 비었으면 body/lg 회색 안내 · 테두리 1px,
 * 고르면 label/lg bold · 테두리 2px stroke/alpha/bold · 아이콘 object/boldest
 */
export function PickerControl({
  value,
  placeholder,
  icon,
  accessibilityLabel,
  onPress,
}: {
  value?: string;
  placeholder: string;
  icon: IconComponent;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  const filled = !!value;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={filled ? `${accessibilityLabel}, ${value}` : accessibilityLabel}
      onPress={onPress}
      className={`flex-row items-center gap-2 rounded-8 ${filled ? 'border-2 border-stroke-alpha-bold px-[13px] py-[11px]' : 'border border-stroke-alpha-assistive px-3.5 py-3'}`}
    >
      {({ pressed }) => (
        <>
          <Text
            numberOfLines={1}
            className={`flex-1 font-sans ${filled ? 'text-label-lg font-semibold text-object-boldest' : 'text-body-lg font-normal text-object-assistive'}`}
          >
            {value ?? placeholder}
          </Text>
          <Icon
            icon={icon}
            size="lg"
            color={filled ? semantic.object.boldest : semantic.object.alternative}
          />
          <InteractionLayer pressed={pressed} color={semantic.fill.boldest} radius={8} />
        </>
      )}
    </Pressable>
  );
}

/** BDS Text Field(장소): 핀 · 장소 이름 · 오른쪽 화살표. 누르면 장소 선택 화면 */
export function PlaceControl({
  place,
  error,
  onPress,
}: {
  place?: string;
  error?: boolean;
  onPress: () => void;
}) {
  let control = 'border-stroke-alpha-assistive';
  if (error) control = 'border-theme-red-bold bg-theme-red-subtlest';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={place ? `장소 변경, ${place}` : '장소 선택'}
      onPress={onPress}
      className={`flex-row items-center gap-2 rounded-8 border px-3.5 py-3 ${control}`}
    >
      {({ pressed }) => (
        <>
          <Icon
            icon={MapPinIcon}
            size="lg"
            weight="fill"
            color={place ? semantic.object.normal : semantic.object.subtler}
          />
          <Text
            numberOfLines={1}
            className={`flex-1 font-sans text-body-lg font-normal ${place ? 'text-object-bolder' : 'text-object-assistive'}`}
          >
            {place ?? '장소 선택'}
          </Text>
          <Icon icon={CaretRightIcon} size="lg" color={semantic.object.alternative} />
          <InteractionLayer pressed={pressed} color={semantic.fill.boldest} radius={8} />
        </>
      )}
    </Pressable>
  );
}

/** 교환할 굿즈: [개봉 여부 배지 · 이름 label/lg bold] … [체크박스 accent] */
export function ItemCheckCard({
  item,
  checked,
  onPress,
}: {
  item: ExchangeItem;
  checked: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={item.name}
      onPress={onPress}
      className={`flex-row items-center justify-between gap-3 rounded-8 border px-4 py-3.5 ${checked ? 'border-stroke-subtle' : 'border-stroke-alpha-assistive'}`}
    >
      {({ pressed }) => (
        <>
          <View className="shrink flex-row items-center gap-2">
            {item.condition ? (
              // BDS Badge 는 self-start 라서 감싸서 세로 가운데에 둔다
              <View>
                <Badge hierarchy="tertiary" variant="alpha" size="md">
                  {CONDITION_LABEL[item.condition]}
                </Badge>
              </View>
            ) : null}
            <Text
              numberOfLines={1}
              className="shrink font-sans text-label-lg font-semibold text-object-boldest"
            >
              {item.name}
            </Text>
          </View>
          <CheckboxMark status={checked ? 'checked' : 'unchecked'} hierarchy="accent" />
          <InteractionLayer pressed={pressed} color={semantic.fill.boldest} radius={8} />
        </>
      )}
    </Pressable>
  );
}
