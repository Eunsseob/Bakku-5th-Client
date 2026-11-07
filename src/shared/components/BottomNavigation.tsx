import { semantic } from '@/design-tokens';
import { Pressable, Text, View } from 'react-native';

import { Icon, type IconComponent } from './Icon';
import { IconBadgeAnchor, NotificationBadge } from './NotificationBadge';

// BDS Bottom Navigation: 화면 하단 탭 바

export type BottomNavigationItem<Key extends string = string> = {
  key: Key;
  label: string;
  icon: IconComponent;
  /** 숫자를 주면 숫자 배지, true 면 점 배지 */
  badge?: number | boolean;
};

type BottomNavigationProps<Key extends string> = {
  items: BottomNavigationItem<Key>[];
  selectedKey: Key;
  onSelect: (key: Key) => void;
  className?: string;
};

export function BottomNavigation<Key extends string>({
  items,
  selectedKey,
  onSelect,
  className,
}: BottomNavigationProps<Key>) {
  return (
    <View
      accessibilityRole="tablist"
      className={`flex-row border-t border-stroke-alpha-subtler bg-surface-standard ${className ?? ''}`}
    >
      {items.map((item) => {
        const selected = item.key === selectedKey;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={item.label}
            onPress={() => onSelect(item.key)}
            className="flex-1 items-center justify-center gap-1 py-2.5"
          >
            <View className="size-6">
              <Icon
                icon={item.icon}
                size="xl"
                weight="fill"
                color={selected ? semantic.object.bolder : semantic.object.subtler}
              />
              {item.badge ? (
                <IconBadgeAnchor>
                  <NotificationBadge
                    size="sm"
                    count={typeof item.badge === 'number' ? item.badge : undefined}
                  />
                </IconBadgeAnchor>
              ) : null}
            </View>
            <Text
              className={`text-center font-sans text-label-xs font-medium ${selected ? 'text-object-bolder' : 'text-object-subtle'}`}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
