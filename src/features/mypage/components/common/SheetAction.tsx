import { semantic } from '@/design-tokens';
import { Pressable, Text } from 'react-native';

import { Icon, type IconComponent, InteractionLayer } from '@/shared/components';

// G-2-3 내 교환글 ⋮ 바텀시트 한 줄 (2729:31372)

/** 바텀시트 한 줄: 높이 44 · 20 아이콘 + 간격 12 + label/lg regular. 삭제는 빨강 */
export function SheetAction({
  icon,
  label,
  destructive = false,
  onPress,
}: {
  icon: IconComponent;
  label: string;
  destructive?: boolean;
  onPress: () => void;
}) {
  const color = destructive ? semantic.theme.red.bold : semantic.object.normal;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center gap-3 py-[11px]"
    >
      {({ pressed }) => (
        <>
          <Icon icon={icon} size="lg" color={color} />
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
