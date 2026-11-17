import { semantic } from '@/design-tokens';
import { Pressable, type PressableProps, Text, View } from 'react-native';

import { Icon, type IconComponent, type IconSize } from './Icon';
import { InteractionLayer } from './InteractionLayer';

// BDS Label Button: 배경 없이 글자(와 아이콘)만 있는 버튼
export type LabelButtonHierarchy = 'accent' | 'primary' | 'secondary' | 'tertiary';
export type LabelButtonSize = 'lg' | 'md' | 'sm' | 'xs';
export type LabelButtonFeedback = 'normal' | 'positive' | 'destructive';

type LabelButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  children: string;
  hierarchy?: LabelButtonHierarchy;
  size?: LabelButtonSize;
  /** accent 에서만 쓰는 상태 색 */
  feedback?: LabelButtonFeedback;
  leadingIcon?: IconComponent;
  trailingIcon?: IconComponent;
  className?: string;
};

const { accent, object, fill, theme } = semantic;

const COLORS: Record<LabelButtonHierarchy, { text: string; content: string; overlay: string }> = {
  accent: { text: 'text-accent-bold', content: accent.bold, overlay: accent.bold },
  primary: { text: 'text-object-boldest', content: object.boldest, overlay: fill.boldest },
  secondary: {
    text: 'text-object-alternative',
    content: object.alternative,
    overlay: fill.boldest,
  },
  tertiary: { text: 'text-object-assistive', content: object.assistive, overlay: fill.boldest },
};

const FEEDBACK: Record<
  Exclude<LabelButtonFeedback, 'normal'>,
  { text: string; content: string }
> = {
  positive: { text: 'text-theme-green-bolder', content: theme.green.bolder },
  destructive: { text: 'text-theme-red-bolder', content: theme.red.bolder },
};

const SIZES: Record<
  LabelButtonSize,
  { text: string; icon: IconSize; inset: { x: number; y: number }; radius: number }
> = {
  lg: { text: 'text-label-lg', icon: 'md', inset: { x: 8, y: 4 }, radius: 10 },
  md: { text: 'text-label-md', icon: 'sm', inset: { x: 6, y: 3 }, radius: 8 },
  sm: { text: 'text-label-sm', icon: 'xs', inset: { x: 4, y: 2 }, radius: 6 },
  xs: { text: 'text-label-xs', icon: '2xs', inset: { x: 3, y: 1 }, radius: 6 },
};

export function LabelButton({
  children,
  hierarchy = 'accent',
  size = 'lg',
  feedback = 'normal',
  disabled,
  leadingIcon,
  trailingIcon,
  className,
  ...pressableProps
}: LabelButtonProps) {
  const sizes = SIZES[size];
  const colors =
    hierarchy === 'accent' && feedback !== 'normal'
      ? { ...COLORS.accent, ...FEEDBACK[feedback] }
      : COLORS[hierarchy];
  const text = disabled ? 'text-object-subtler' : colors.text;
  const content = disabled ? object.subtler : colors.content;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      hitSlop={{
        top: sizes.inset.y,
        bottom: sizes.inset.y,
        left: sizes.inset.x,
        right: sizes.inset.x,
      }}
      className={`flex-row items-center justify-center self-start ${className ?? ''}`}
      {...pressableProps}
    >
      {({ pressed }) => (
        <>
          <View className="flex-row items-center gap-1">
            {leadingIcon ? <Icon icon={leadingIcon} size={sizes.icon} color={content} /> : null}
            <Text className={`font-sans font-medium ${sizes.text} ${text}`}>{children}</Text>
            {trailingIcon ? <Icon icon={trailingIcon} size={sizes.icon} color={content} /> : null}
          </View>
          {disabled ? null : (
            <InteractionLayer
              pressed={pressed}
              color={colors.overlay}
              inset={sizes.inset}
              radius={sizes.radius}
            />
          )}
        </>
      )}
    </Pressable>
  );
}
