import { semantic } from '@/design-tokens';
import { Text, View } from 'react-native';

import { Icon, type IconComponent } from './Icon';

// BDS Badge (+ Theme Badge): 상태·속성을 짧게 표시하는 라벨
export type BadgeHierarchy = 'accent' | 'primary' | 'secondary' | 'tertiary';
export type BadgeTheme = 'red' | 'orange' | 'green' | 'blue';
export type BadgeVariant = 'solid' | 'alpha' | 'outlined';
export type BadgeSize = 'lg' | 'md';

type BadgeProps = {
  children: string;
  hierarchy?: BadgeHierarchy;
  /** 상태색 배지. 주면 hierarchy 대신 적용된다 */
  theme?: BadgeTheme;
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** 36% 불투명도로 흐리게 */
  muted?: boolean;
  leadingIcon?: IconComponent;
  className?: string;
};

type Colors = { container: string; text: string; content: string };

const { accent, object, theme: themeColor } = semantic;

const WHITE = { text: 'text-object-inverse-boldest', content: object.inverse.boldest };

const HIERARCHY: Record<BadgeHierarchy, Record<BadgeVariant, Colors>> = {
  accent: {
    solid: { container: 'bg-accent-bold', ...WHITE },
    alpha: { container: 'bg-accent-subtler', text: 'text-accent-bolder', content: accent.bolder },
    outlined: {
      container: 'border border-accent-subtle',
      text: 'text-accent-bolder',
      content: accent.bolder,
    },
  },
  primary: {
    solid: { container: 'bg-fill-boldest', ...WHITE },
    alpha: { container: 'bg-fill-subtle', text: 'text-object-bold', content: object.bold },
    outlined: {
      container: 'border border-stroke-assistive',
      text: 'text-object-bold',
      content: object.bold,
    },
  },
  secondary: {
    solid: { container: 'bg-fill-neutral', ...WHITE },
    alpha: { container: 'bg-fill-subtler', text: 'text-object-neutral', content: object.neutral },
    outlined: {
      container: 'border border-stroke-subtle',
      text: 'text-object-neutral',
      content: object.neutral,
    },
  },
  tertiary: {
    solid: {
      container: 'bg-fill-subtler',
      text: 'text-object-alternative',
      content: object.alternative,
    },
    alpha: {
      container: 'bg-fill-subtlest',
      text: 'text-object-alternative',
      content: object.alternative,
    },
    outlined: {
      container: 'border border-stroke-subtler',
      text: 'text-object-alternative',
      content: object.alternative,
    },
  },
};

const THEME: Record<BadgeTheme, Record<BadgeVariant, Colors>> = {
  red: {
    solid: { container: 'bg-theme-red-bold', ...WHITE },
    alpha: {
      container: 'bg-theme-red-subtler',
      text: 'text-theme-red-bolder',
      content: themeColor.red.bolder,
    },
    outlined: {
      container: 'border border-theme-red-subtle',
      text: 'text-theme-red-bolder',
      content: themeColor.red.bolder,
    },
  },
  orange: {
    solid: { container: 'bg-theme-orange-bold', ...WHITE },
    alpha: {
      container: 'bg-theme-orange-subtler',
      text: 'text-theme-orange-bolder',
      content: themeColor.orange.bolder,
    },
    outlined: {
      container: 'border border-theme-orange-subtle',
      text: 'text-theme-orange-bolder',
      content: themeColor.orange.bolder,
    },
  },
  green: {
    solid: { container: 'bg-theme-green-bold', ...WHITE },
    alpha: {
      container: 'bg-theme-green-subtlest',
      text: 'text-theme-green-boldest',
      content: themeColor.green.boldest,
    },
    outlined: {
      container: 'border border-theme-green-subtle',
      text: 'text-theme-green-boldest',
      content: themeColor.green.boldest,
    },
  },
  blue: {
    solid: { container: 'bg-theme-blue-bold', ...WHITE },
    alpha: {
      container: 'bg-theme-blue-subtlest',
      text: 'text-theme-blue-boldest',
      content: themeColor.blue.boldest,
    },
    outlined: {
      container: 'border border-theme-blue-subtle',
      text: 'text-theme-blue-boldest',
      content: themeColor.blue.boldest,
    },
  },
};

const SIZES: Record<BadgeSize, { container: string; text: string }> = {
  lg: { container: 'gap-[3px] rounded-md px-1.5 py-0.5', text: 'text-label-sm' },
  md: { container: 'gap-0.5 rounded px-1 py-px', text: 'text-label-xs' },
};

export function Badge({
  children,
  hierarchy = 'accent',
  theme,
  variant = 'solid',
  size = 'lg',
  muted = false,
  leadingIcon,
  className,
}: BadgeProps) {
  const colors = theme ? THEME[theme][variant] : HIERARCHY[hierarchy][variant];
  const sizes = SIZES[size];

  return (
    <View
      className={`flex-row items-center justify-center self-start ${sizes.container} ${colors.container} ${muted ? 'opacity-[0.36]' : ''} ${className ?? ''}`}
    >
      {leadingIcon ? <Icon icon={leadingIcon} size="xs" color={colors.content} /> : null}
      <Text className={`font-sans font-medium ${sizes.text} ${colors.text}`}>{children}</Text>
    </View>
  );
}
