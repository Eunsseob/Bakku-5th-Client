import type { ReactNode } from 'react';
import { Pressable, type PressableProps, Text, View } from 'react-native';

export type ChipVariant = 'filled' | 'outlined';
export type ChipSize = 'xl' | 'lg' | 'md';

type ChipProps = Omit<PressableProps, 'children'> & {
  children: string;
  selected?: boolean;
  variant?: ChipVariant;
  size?: ChipSize;
  /** 텍스트 뒤 아래 방향 화살표 표시 */
  suffixVisible?: boolean;
  /** 텍스트 앞 아이콘. 디자인 규칙상 suffixVisible이 true일 때만 표시된다. */
  prefixIcon?: ReactNode;
  className?: string;
};

const SIZE_STYLES: Record<ChipSize, { container: string; text: string; icon: string }> = {
  xl: { container: 'h-10 px-4', text: 'text-label-md', icon: 'size-4' },
  lg: { container: 'h-[38px] px-3.5', text: 'text-label-md', icon: 'size-4' },
  md: { container: 'h-8 px-3', text: 'text-label-sm', icon: 'size-3.5' },
};

function getColorStyles(variant: ChipVariant, selected: boolean) {
  if (variant === 'filled') {
    return selected
      ? { container: 'bg-gray-700', text: 'text-white', icon: 'border-white' }
      : { container: 'bg-gray-100', text: 'text-gray-700', icon: 'border-gray-400' };
  }
  return selected
    ? {
        container: 'border border-gray-700 bg-gray-100',
        text: 'text-gray-700',
        icon: 'border-gray-500',
      }
    : {
        container: 'border border-gray-300 bg-white',
        text: 'text-gray-700',
        icon: 'border-gray-400',
      };
}

function Chevron({
  boxClassName,
  colorClassName,
}: {
  boxClassName: string;
  colorClassName: string;
}) {
  return (
    <View className={`items-center justify-center ${boxClassName}`}>
      <View
        className={`-mt-1 size-[7px] rotate-45 border-b-[1.5px] border-r-[1.5px] ${colorClassName}`}
      />
    </View>
  );
}

export function Chip({
  children,
  selected = false,
  variant = 'filled',
  size = 'xl',
  suffixVisible = false,
  prefixIcon,
  className,
  ...pressableProps
}: ChipProps) {
  const sizeStyles = SIZE_STYLES[size];
  const colorStyles = getColorStyles(variant, selected);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`flex-row items-center gap-1 self-start rounded-full ${sizeStyles.container} ${colorStyles.container} ${className ?? ''}`}
      {...pressableProps}
    >
      {suffixVisible && prefixIcon ? (
        <View className={`items-center justify-center ${sizeStyles.icon}`}>{prefixIcon}</View>
      ) : null}
      <Text className={`font-sans font-medium ${sizeStyles.text} ${colorStyles.text}`}>
        {children}
      </Text>
      {suffixVisible ? (
        <Chevron boxClassName={sizeStyles.icon} colorClassName={colorStyles.icon} />
      ) : null}
    </Pressable>
  );
}
