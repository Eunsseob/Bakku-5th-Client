import { semantic } from '@/design-tokens';
import { CaretDownIcon } from 'phosphor-react-native/src/icons/CaretDown';
import { Pressable, type PressableProps, Text } from 'react-native';

import { Icon, type IconSize } from './Icon';

// BDS Chip: 적용한 필터·정렬 조건을 보여주는 칩
export type ChipHierarchy = 'accent' | 'primary' | 'secondary';
export type ChipVariant = 'solid' | 'outlined';
export type ChipSize = 'lg' | 'md' | 'sm';

type ChipProps = Omit<PressableProps, 'children'> & {
  children: string;
  hierarchy?: ChipHierarchy;
  /** outlined 는 primary·secondary 에서만 정의되어 있다 */
  variant?: ChipVariant;
  size?: ChipSize;
  /** 텍스트 뒤 아래 방향 화살표 */
  trailingIconVisible?: boolean;
  className?: string;
};

const { accent, object } = semantic;

type Colors = { container: string; text: string; icon: string };

const SOLID: Record<ChipHierarchy, Colors> = {
  accent: {
    container: 'bg-accent-bold',
    text: 'font-medium text-object-inverse-boldest',
    icon: accent.alternative,
  },
  primary: {
    container: 'bg-fill-boldest',
    text: 'font-medium text-object-inverse-boldest',
    icon: object.inverse.assistive,
  },
  secondary: {
    container: 'bg-fill-subtlest',
    text: 'font-normal text-object-normal',
    icon: object.subtle,
  },
};

const OUTLINED: Record<Exclude<ChipHierarchy, 'accent'>, Colors> = {
  primary: {
    container: 'border border-stroke-alpha-subtle',
    text: 'font-normal text-object-normal',
    icon: object.subtle,
  },
  secondary: {
    container: 'border border-stroke-alpha-subtler',
    text: 'font-normal text-object-normal',
    icon: object.subtle,
  },
};

const SIZES: Record<ChipSize, { container: string; icon: IconSize }> = {
  lg: { container: 'h-10 px-4', icon: 'sm' },
  md: { container: 'h-9 px-3.5', icon: 'sm' },
  sm: { container: 'h-8 px-3', icon: 'xs' },
};

export function Chip({
  children,
  hierarchy = 'secondary',
  variant = 'solid',
  size = 'lg',
  trailingIconVisible = false,
  className,
  ...pressableProps
}: ChipProps) {
  const colors =
    variant === 'outlined' && hierarchy !== 'accent' ? OUTLINED[hierarchy] : SOLID[hierarchy];
  const sizes = SIZES[size];

  return (
    <Pressable
      accessibilityRole="button"
      className={`flex-row items-center justify-center gap-1 self-start rounded-full ${sizes.container} ${colors.container} ${className ?? ''}`}
      {...pressableProps}
    >
      <Text className={`font-sans text-label-md ${colors.text}`}>{children}</Text>
      {trailingIconVisible ? (
        <Icon icon={CaretDownIcon} size={sizes.icon} color={colors.icon} />
      ) : null}
    </Pressable>
  );
}
