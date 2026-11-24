import { semantic } from '@/design-tokens';
import { Pressable, Text, View } from 'react-native';

import { Icon, type IconComponent } from '../display/Icon';
import { InteractionLayer } from '../decoration/InteractionLayer';

// BDS Menu: ⋮ 같은 버튼을 누르면 뜨는 작은 메뉴 카드 (흰 바탕, 1px 테두리, r12, 위아래 8)
// 위치는 쓰는 쪽에서 잡는다 (예: 버튼 아래 absolute).
// MenuRow(↳ Menu/Parts) 는 설정 목록처럼 화면에 바로 쌓아서도 쓴다.

export type MenuItem = {
  key: string;
  label: string;
  onPress?: () => void;
  leadingIcon?: IconComponent;
  trailingIcon?: IconComponent;
  /** 오른쪽 글자 (예: 앱 버전 1.0.0) */
  trailingLabel?: string;
  disabled?: boolean;
  /** 삭제·신고처럼 되돌릴 수 없는 동작 (빨간 글자) */
  destructive?: boolean;
  /** 레이블 굵게 (label/lg/bold) */
  emphasized?: boolean;
};

type MenuProps = {
  items: MenuItem[];
  className?: string;
};

/** ↳ Menu/Parts: 44px 한 줄 (좌우 16 · 위아래 10, 레이블과 오른쪽 사이 24) */
export function MenuRow({
  label,
  onPress,
  leadingIcon,
  trailingIcon,
  trailingLabel,
  disabled = false,
  destructive = false,
  emphasized = false,
}: Omit<MenuItem, 'key'>) {
  const { object } = semantic;
  const iconColor = disabled ? object.subtler : object.assistive;

  let labelColor = 'text-object-bolder';
  if (disabled) labelColor = 'text-object-subtler';
  else if (destructive) labelColor = 'text-theme-red-bold';
  const weight = emphasized ? 'font-semibold' : 'font-normal';

  return (
    <Pressable
      accessibilityRole="menuitem"
      accessibilityState={{ disabled }}
      disabled={disabled || !onPress}
      onPress={onPress}
      className="min-h-11 flex-row items-center justify-between gap-6 px-4 py-2.5"
    >
      {({ pressed }) => (
        <>
          <View className="shrink flex-row items-center gap-2">
            {leadingIcon ? <Icon icon={leadingIcon} size="lg" color={iconColor} /> : null}
            <Text
              numberOfLines={1}
              className={`shrink font-sans text-label-lg ${weight} ${labelColor}`}
            >
              {label}
            </Text>
          </View>
          {trailingLabel ? (
            <Text className={`font-sans text-label-lg font-normal ${labelColor}`}>
              {trailingLabel}
            </Text>
          ) : null}
          {trailingIcon ? (
            <Icon
              icon={trailingIcon}
              size="lg"
              color={disabled ? object.subtler : object.neutral}
            />
          ) : null}
          <InteractionLayer pressed={pressed} color={semantic.fill.boldest} />
        </>
      )}
    </Pressable>
  );
}

export function Menu({ items, className }: MenuProps) {
  return (
    <View
      accessibilityRole="menu"
      className={`self-start overflow-hidden rounded-12 border border-stroke-alpha-subtle bg-surface-standard py-2 ${className ?? ''}`}
    >
      {items.map(({ key, ...item }) => (
        <MenuRow key={key} {...item} />
      ))}
    </View>
  );
}
