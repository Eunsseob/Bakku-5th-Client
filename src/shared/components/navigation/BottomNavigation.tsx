import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconComponent } from '../display/Icon';
import { IconBadgeAnchor, NotificationBadge } from './NotificationBadge';

// Bottom Navigation: 화면 하단 탭 바 (48px 탭 + 홈 인디케이터 영역)
// 1차 화면은 Figma UI-Flow '(현)UI 전개 시안' 의 BottomNavigation 값을 쓴다.
//   높이 48 (위 6 · 아래 2), 탭 위 2, 아이콘 24, 글자 label/2xs/normal(10 Medium)
//   선택 #4a5565 (foreground/neutral) · 미선택 #99a1af (foreground/assistive) · 위 선 #e5e7eb (stroke/neutral)
// BDS 하이파이 화면으로 바뀌면 BDS 값(56px, label/xs, object-bolder · object-subtler)으로 돌린다.

const COLOR = {
  selected: '#4a5565',
  unselected: '#99a1af',
} as const;

export type BottomNavigationItem<Key extends string = string> = {
  key: Key;
  label: string;
  icon: IconComponent;
  /** 선택됐을 때 다른 아이콘을 쓸 때 (예: 채운 모양). 없으면 icon */
  selectedIcon?: IconComponent;
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
      className={`bg-white ${className ?? ''}`}
      style={safeArea ? { paddingBottom: insets.bottom } : undefined}
    >
      <View
        accessibilityRole="tablist"
        className="h-12 flex-row border-t border-[#e5e7eb] pb-0.5 pt-1.5"
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
              className="flex-1 items-center justify-center pt-0.5"
            >
              <View className="size-6">
                <Icon
                  icon={selected && item.selectedIcon ? item.selectedIcon : item.icon}
                  size="xl"
                  weight="fill"
                  color={selected ? COLOR.selected : COLOR.unselected}
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
                className={`self-stretch text-center font-sans text-label-2xs font-medium ${selected ? 'text-[#4a5565]' : 'text-[#99a1af]'}`}
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
