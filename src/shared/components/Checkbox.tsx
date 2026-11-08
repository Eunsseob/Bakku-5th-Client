import { semantic } from '@/design-tokens';
import { CheckIcon } from 'phosphor-react-native/src/icons/Check';
import { MinusIcon } from 'phosphor-react-native/src/icons/Minus';
import { Pressable, type PressableProps, View } from 'react-native';

import { ChoiceLabel } from './ChoiceLabel';
import { Icon } from './Icon';

// BDS CheckBox
export type CheckboxStatus = 'unchecked' | 'checked' | 'indeterminate';
export type CheckboxHierarchy = 'primary' | 'accent';
export type CheckboxSize = 'lg' | 'md';

type CheckboxProps = Omit<PressableProps, 'children' | 'style'> & {
  status: CheckboxStatus;
  label?: string;
  helperText?: string;
  hierarchy?: CheckboxHierarchy;
  size?: CheckboxSize;
  className?: string;
};

export function Checkbox({
  status,
  label,
  helperText,
  hierarchy = 'primary',
  size = 'lg',
  disabled,
  className,
  ...pressableProps
}: CheckboxProps) {
  const marked = status !== 'unchecked';

  let box: string;
  if (marked) {
    box = disabled
      ? 'bg-fill-subtlest'
      : hierarchy === 'accent'
        ? 'bg-accent-bold'
        : 'bg-fill-boldest';
  } else {
    box = disabled ? 'border border-stroke-alpha-subtler' : 'border border-stroke-alpha-subtle';
  }

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{
        checked: status === 'indeterminate' ? 'mixed' : status === 'checked',
        disabled: !!disabled,
      }}
      disabled={disabled}
      className={`flex-row items-start gap-2.5 self-start ${className ?? ''}`}
      {...pressableProps}
    >
      <View className="py-px">
        <View
          className={`items-center justify-center rounded ${size === 'lg' ? 'size-5' : 'size-[18px]'} ${box}`}
        >
          {marked ? (
            <Icon
              icon={status === 'checked' ? CheckIcon : MinusIcon}
              size={size === 'lg' ? 'md' : 'sm'}
              weight="bold"
              color={disabled ? semantic.object.subtler : semantic.object.inverse.boldest}
            />
          ) : null}
        </View>
      </View>
      {label ? (
        <ChoiceLabel label={label} helperText={helperText} size={size} muted={!!disabled} />
      ) : null}
    </Pressable>
  );
}
