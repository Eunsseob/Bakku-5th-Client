import { semantic } from '@/design-tokens';
import { Pressable, type PressableProps, Text, View } from 'react-native';

import { Icon, type IconComponent, type IconSize } from './Icon';
import { InteractionLayer } from './InteractionLayer';

// BDS Block Button
export type ButtonHierarchy = 'accent' | 'primary' | 'secondary';
export type ButtonVariant = 'solid' | 'outlined' | 'hollow';
export type ButtonSize = 'lg' | 'md' | 'sm' | 'xs';
/** accent + solid 에서만 쓰는 상태 색 */
export type ButtonFeedback = 'normal' | 'positive' | 'destructive';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  children: string;
  hierarchy?: ButtonHierarchy;
  variant?: ButtonVariant;
  size?: ButtonSize;
  feedback?: ButtonFeedback;
  leadingIcon?: IconComponent;
  trailingIcon?: IconComponent;
  className?: string;
};

type Colors = { container: string; text: string; content: string; overlay: string };

const { accent, object, fill } = semantic;

const COLORS: Record<ButtonVariant, Record<ButtonHierarchy, Colors>> = {
  solid: {
    accent: {
      container: 'bg-accent-bold',
      text: 'text-object-inverse-boldest',
      content: object.inverse.boldest,
      overlay: fill.boldest,
    },
    primary: {
      container: 'bg-fill-boldest',
      text: 'text-object-inverse-boldest',
      content: object.inverse.boldest,
      overlay: object.inverse.boldest,
    },
    secondary: {
      container: 'bg-fill-subtlest',
      text: 'text-object-neutral',
      content: object.neutral,
      overlay: fill.boldest,
    },
  },
  outlined: {
    accent: {
      container: 'border border-accent-normal',
      text: 'text-accent-bold',
      content: accent.bold,
      overlay: accent.bold,
    },
    primary: {
      container: 'border border-stroke-assistive',
      text: 'text-object-boldest',
      content: object.boldest,
      overlay: object.boldest,
    },
    secondary: {
      container: 'border border-stroke-subtle',
      text: 'text-object-neutral',
      content: object.neutral,
      overlay: object.neutral,
    },
  },
  hollow: {
    accent: { container: '', text: 'text-accent-bold', content: accent.bold, overlay: accent.bold },
    primary: {
      container: '',
      text: 'text-object-boldest',
      content: object.boldest,
      overlay: object.boldest,
    },
    secondary: {
      container: '',
      text: 'text-object-neutral',
      content: object.neutral,
      overlay: object.neutral,
    },
  },
};

const FEEDBACK_CONTAINER: Record<Exclude<ButtonFeedback, 'normal'>, string> = {
  positive: 'bg-theme-green-bold',
  destructive: 'bg-theme-red-bold',
};

const DISABLED_CONTAINER: Record<ButtonVariant, string> = {
  solid: 'bg-fill-subtlest',
  outlined: 'border border-stroke-subtler',
  hollow: '',
};

const SIZES: Record<
  ButtonSize,
  { container: string; label: string; text: string; icon: IconSize; radius: number }
> = {
  lg: {
    container: 'h-[52px] rounded-2xl px-7',
    label: 'gap-1.5',
    text: 'text-title-1',
    icon: 'lg',
    radius: 16,
  },
  md: {
    container: 'h-10 rounded-xl px-5',
    label: 'gap-1',
    text: 'text-label-md',
    icon: 'sm',
    radius: 12,
  },
  sm: {
    container: 'h-9 rounded-xl px-4',
    label: 'gap-1',
    text: 'text-label-md',
    icon: 'sm',
    radius: 12,
  },
  xs: {
    container: 'h-8 rounded-full px-3',
    label: 'gap-1 py-px',
    text: 'text-label-sm',
    icon: 'xs',
    radius: 9999,
  },
};

export function Button({
  children,
  hierarchy = 'accent',
  variant = 'solid',
  size = 'lg',
  feedback = 'normal',
  disabled,
  leadingIcon,
  trailingIcon,
  className,
  ...pressableProps
}: ButtonProps) {
  const colors = COLORS[variant][hierarchy];
  const sizes = SIZES[size];
  const feedbackContainer =
    variant === 'solid' && hierarchy === 'accent' && feedback !== 'normal'
      ? FEEDBACK_CONTAINER[feedback]
      : null;

  const container = disabled
    ? DISABLED_CONTAINER[variant]
    : (feedbackContainer ?? colors.container);
  const text = disabled ? 'text-object-subtler' : colors.text;
  const content = disabled ? object.subtler : colors.content;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      className={`flex-row items-center justify-center self-start overflow-hidden ${sizes.container} ${container} ${className ?? ''}`}
      {...pressableProps}
    >
      {({ pressed }) => (
        <>
          <View className={`flex-row items-center justify-center ${sizes.label}`}>
            {leadingIcon ? <Icon icon={leadingIcon} size={sizes.icon} color={content} /> : null}
            <Text className={`font-sans font-semibold ${sizes.text} ${text}`}>{children}</Text>
            {trailingIcon ? <Icon icon={trailingIcon} size={sizes.icon} color={content} /> : null}
          </View>
          {disabled ? null : (
            <InteractionLayer
              pressed={pressed}
              color={colors.overlay}
              inset={variant === 'outlined' ? 1 : 0}
              radius={sizes.radius}
            />
          )}
        </>
      )}
    </Pressable>
  );
}
