import { semantic } from '@/design-tokens';
import { Pressable, Text, View } from 'react-native';

import { Icon, type IconComponent } from '../display/Icon';
import { InteractionLayer } from '../decoration/InteractionLayer';

// BDS Menu: ⋮ 같은 버튼을 누르면 뜨는 작은 메뉴 카드 (흰 바탕, 1px 테두리, r12, 위아래 8)
// 위치는 쓰는 쪽에서 잡는다 (예: 버튼 아래 absolute).

export type MenuItem = {
  key: string;
  label: string;
  onPress: () => void;
  leadingIcon?: IconComponent;
  trailingIcon?: IconComponent;
  disabled?: boolean;
  /** 삭제·신고처럼 되돌릴 수 없는 동작 (빨간 글자) */
  destructive?: boolean;
};

type MenuProps = {
  items: MenuItem[];
  className?: string;
};

function MenuRow({
  label,
  onPress,
  leadingIcon,
  trailingIcon,
  disabled = false,
  destructive = false,
}: MenuItem) {
  const { object } = semantic;
  const iconColor = disabled ? object.subtler : object.assistive;

  let labelColor = 'text-object-bolder';
  if (disabled) labelColor = 'text-object-subtler';
  else if (destructive) labelColor = 'text-theme-red-bold';

  return (
    <Pressable
      accessibilityRole="menuitem"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className="flex-row items-center justify-between gap-6 px-4 py-2.5"
    >
      {({ pressed }) => (
        <>
          <View className="shrink flex-row items-center gap-2">
            {leadingIcon ? <Icon icon={leadingIcon} size="lg" color={iconColor} /> : null}
            <Text
              numberOfLines={1}
              className={`shrink font-sans text-label-lg font-normal ${labelColor}`}
            >
              {label}
            </Text>
          </View>
          {trailingIcon ? <Icon icon={trailingIcon} size="md" color={iconColor} /> : null}
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
