import { semantic } from '@/design-tokens';
import { Pressable, Text, View } from 'react-native';

import { Icon, type IconComponent, InteractionLayer } from '@/shared/components';

// G-3 바텀시트 메뉴 한 줄 (내 교환글 ⋮ · 교환 내역 ⋮)

/** 바텀시트 한 줄: 32 원(surface/deeper) 안 20 아이콘 + label/lg */
export function SheetAction({
  icon,
  label,
  destructive = false,
  onPress,
}: {
  /** 없으면 글자만 (누구와 교환했나요? 시트) */
  icon?: IconComponent;
  label: string;
  destructive?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center gap-3 py-[11px]"
    >
      {({ pressed }) => (
        <>
          {icon ? (
            <View className="size-8 items-center justify-center rounded-max bg-surface-deeper">
              <Icon
                icon={icon}
                size="lg"
                color={destructive ? semantic.theme.red.bold : semantic.object.bold}
              />
            </View>
          ) : null}
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
