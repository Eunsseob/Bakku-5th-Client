import { semantic } from '@/design-tokens';
import { Pressable, Text } from 'react-native';

import { Icon, type IconComponent, InteractionLayer } from '@/shared/components';

// G-2-3 내 교환글 ⋮ 바텀시트 한 줄 (2729:31372)

/** 바텀시트 한 줄: 높이 48 · 20 아이콘 + 간격 8 + label/lg regular. 삭제는 빨강 */
export function SheetAction({
  icon,
  iconColor,
  label,
  destructive = false,
  onPress,
}: {
  icon: IconComponent;
  iconColor?: string;
  label: string;
  destructive?: boolean;
  onPress: () => void;
}) {
  const color = destructive ? semantic.theme.red.bold : semantic.object.normal;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="h-12 flex-row items-center gap-2"
    >
      {({ pressed }) => (
        <>
          <Icon icon={icon} size="lg" color={iconColor ?? color} />
          <Text
            className={`font-sans text-label-lg font-normal ${destructive ? 'text-theme-red-bold' : 'text-object-normal'}`}
          >
            {label}
          </Text>
          <InteractionLayer pressed={pressed} color={semantic.fill.boldest} radius={8} />
        </>
      )}
    </Pressable>
  );
}
