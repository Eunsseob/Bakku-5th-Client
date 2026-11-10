import { semantic } from '@/design-tokens';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconComponent } from './Icon';
import { IconBadgeAnchor, NotificationBadge } from './NotificationBadge';

// BDS Bottom Navigation: 화면 하단 탭 바 (56px 탭 + 홈 인디케이터 영역)

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
  /** 하단 홈 인디케이터 높이만큼 여백을 둔다. 화면이 이미 safe area 를 처리하면 false */
  safeArea?: boolean;
  className?: string;
};

export function BottomNavigation<Key extends string>({
  items,
  selectedKey,
  onSelect,
  safeArea = true,
  className,
}: BottomNavigationProps<Key>) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={`bg-surface-standard ${className ?? ''}`}
      style={safeArea ? { paddingBottom: insets.bottom } : undefined}
    >
      <View accessibilityRole="tablist" className="flex-row border-t border-stroke-alpha-subtler">
        {items.map((item) => {
          const selected = item.key === selectedKey;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={item.label}
              onPress={() => onSelect(item.key)}
              className="flex-1 items-center justify-center gap-1 py-1.5"
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
                    {typeof item.badge === 'number' ? (
                      <NotificationBadge size="sm" count={item.badge} />
                    ) : (
                      <NotificationBadge size="md" />
                    )}
                  </IconBadgeAnchor>
                ) : null}
              </View>
              <Text
                className={`self-stretch text-center font-sans text-label-xs font-medium ${selected ? 'text-object-bolder' : 'text-object-subtle'}`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
