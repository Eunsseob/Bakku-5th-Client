import { semantic } from '@/design-tokens';
import { Pressable, type PressableProps, View } from 'react-native';

import { ChoiceLabel } from './ChoiceLabel';

// BDS Radio
export type RadioHierarchy = 'primary' | 'accent';
export type RadioSize = 'lg' | 'md';

type RadioProps = Omit<PressableProps, 'children' | 'style'> & {
  checked: boolean;
  label?: string;
  helperText?: string;
  hierarchy?: RadioHierarchy;
  size?: RadioSize;
  className?: string;
};

export function Radio({
  checked,
  label,
  helperText,
  hierarchy = 'primary',
  size = 'lg',
  disabled,
  className,
  ...pressableProps
}: RadioProps) {
  const dimension = size === 'lg' ? 20 : 18;

  let ring: { borderWidth: number; borderColor: string; backgroundColor?: string };
  if (checked) {
    ring = {
      borderWidth: size === 'lg' ? 6 : 5,
      borderColor: disabled
        ? semantic.object.subtler
        : hierarchy === 'accent'
          ? semantic.accent.bold
          : semantic.object.boldest,
      backgroundColor: semantic.surface.standard,
    };
  } else {
    ring = {
      borderWidth: 1,
      borderColor: disabled ? semantic.stroke.alpha.subtler : semantic.stroke.alpha.subtle,
    };
  }

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked, disabled: !!disabled }}
      disabled={disabled}
      className={`flex-row items-start gap-2.5 self-start ${className ?? ''}`}
      {...pressableProps}
    >
      <View className="py-px">
        <View className="rounded-full" style={{ width: dimension, height: dimension, ...ring }} />
      </View>
      {label ? (
        <ChoiceLabel label={label} helperText={helperText} size={size} muted={!!disabled} />
      ) : null}
    </Pressable>
  );
}
