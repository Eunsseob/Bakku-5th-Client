import type { ReactNode } from 'react';
import { Pressable, type PressableProps, Text, View } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'accent';
export type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  children: string;
  variant?: ButtonVariant;
  /** 디자인상 sm·lg는 primary에서만 정의되어 있다. */
  size?: ButtonSize;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
  className?: string;
};

const SIZE_STYLES: Record<ButtonSize, { container: string; text: string; icon: string }> = {
  sm: { container: 'h-9 rounded-md px-2', text: 'text-label-md', icon: 'size-3.5' },
  md: { container: 'h-[52px] rounded-[10px] px-4', text: 'text-label-lg', icon: 'size-4' },
  lg: { container: 'h-[52px] rounded-[10px] px-5', text: 'text-title-2', icon: 'size-5' },
};

const VARIANT_STYLES: Record<ButtonVariant, { container: string; text: string }> = {
  primary: { container: 'bg-gray-900', text: 'text-gray-50' },
  secondary: { container: 'border border-gray-400 bg-white', text: 'text-gray-500' },
  accent: { container: 'bg-bp-400', text: 'text-gray-50' },
};

const DISABLED_STYLES: Record<ButtonVariant, { container: string; text: string }> = {
  primary: { container: 'bg-gray-200', text: 'text-gray-400' },
  secondary: { container: 'border border-gray-300 bg-white', text: 'text-gray-400' },
  accent: { container: 'bg-gray-200', text: 'text-gray-400' },
};

// Accent: 가운데가 진하고 가장자리로 갈수록 옅어지는 핑크 글로우. 지원하지 않는 환경에선 bg-bp-400 단색.
const ACCENT_GLOW = 'radial-gradient(ellipse at center, #FF5FA2 0%, #FF88B9 100%)';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled,
  prefixIcon,
  suffixIcon,
  className,
  ...pressableProps
}: ButtonProps) {
  const sizeStyles = SIZE_STYLES[size];
  const colorStyles = disabled ? DISABLED_STYLES[variant] : VARIANT_STYLES[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      className={`flex-row items-center justify-center gap-1 self-start overflow-hidden active:opacity-80 ${sizeStyles.container} ${colorStyles.container} ${className ?? ''}`}
      style={variant === 'accent' && !disabled ? { backgroundImage: ACCENT_GLOW } : undefined}
      {...pressableProps}
    >
      {prefixIcon ? (
        <View className={`items-center justify-center ${sizeStyles.icon}`}>{prefixIcon}</View>
      ) : null}
      <Text className={`font-sans font-semibold ${sizeStyles.text} ${colorStyles.text}`}>
        {children}
      </Text>
      {suffixIcon ? (
        <View className={`items-center justify-center ${sizeStyles.icon}`}>{suffixIcon}</View>
      ) : null}
    </Pressable>
  );
}
