import { semantic } from '@/design-tokens';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';
import { XIcon } from 'phosphor-react-native/src/icons/X';
import { Pressable, type PressableProps, Text, View } from 'react-native';

import { CheckboxMark, type CheckboxStatus } from './Checkbox';
import { Icon, type IconComponent } from '../display/Icon';
import { InteractionLayer } from '../decoration/InteractionLayer';
import { RadioMark } from './Radio';

// BDS List Item: 48px 한 줄. [왼쪽(아이콘/라디오/체크박스) + 레이블] ... [오른쪽 아이콘]
// 여러 줄은 부모가 세로로 쌓는다 (Figma 의 cellSlot).

export type ListItemLeading =
  | { type: 'icon'; icon: IconComponent }
  | { type: 'radio'; checked: boolean }
  | { type: 'checkbox'; status: CheckboxStatus };

/** chevronRight: 다음 화면으로, close: 지우기, 아니면 원하는 아이콘 */
export type ListItemTrailing = 'chevronRight' | 'close' | { icon: IconComponent };

export type ListItemFeedback = 'normal' | 'destructive';

type ListItemProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  leading?: ListItemLeading;
  trailing?: ListItemTrailing;
  /** destructive: 삭제처럼 되돌릴 수 없는 동작 (빨간 글자) */
  feedback?: ListItemFeedback;
  className?: string;
};

function trailingIcon(trailing: ListItemTrailing): IconComponent {
  if (trailing === 'chevronRight') return CaretRightIcon;
  if (trailing === 'close') return XIcon;
  return trailing.icon;
}

export function ListItem({
  label,
  leading,
  trailing,
  feedback = 'normal',
  disabled,
  className,
  ...pressableProps
}: ListItemProps) {
  const { object, theme } = semantic;
  const muted = !!disabled;
  const destructive = feedback === 'destructive' && !muted;

  let labelColor = 'text-object-bolder';
  if (muted) labelColor = 'text-object-subtler';
  else if (destructive) labelColor = 'text-theme-red-bold';

  let leadingIconColor: string = object.alternative;
  if (muted) leadingIconColor = object.subtler;
  else if (destructive) leadingIconColor = theme.red.bold;

  let accessibilityRole: PressableProps['accessibilityRole'] = 'button';
  let accessibilityState: PressableProps['accessibilityState'] = { disabled: muted };
  if (leading?.type === 'radio') {
    accessibilityRole = 'radio';
    accessibilityState = { ...accessibilityState, checked: leading.checked };
  } else if (leading?.type === 'checkbox') {
    accessibilityRole = 'checkbox';
    accessibilityState = {
      ...accessibilityState,
      checked: leading.status === 'indeterminate' ? 'mixed' : leading.status === 'checked',
    };
  }

  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      disabled={disabled}
      className={`h-12 flex-row items-center justify-between gap-3 ${className ?? ''}`}
      {...pressableProps}
    >
      {({ pressed }) => (
        <>
          <View className="shrink flex-row items-center gap-2">
            {leading?.type === 'icon' ? (
              <Icon icon={leading.icon} size="lg" color={leadingIconColor} />
            ) : null}
            {leading?.type === 'radio' ? (
              <RadioMark checked={leading.checked} disabled={muted} />
            ) : null}
            {leading?.type === 'checkbox' ? (
              <CheckboxMark status={leading.status} disabled={muted} />
            ) : null}
            <Text
              numberOfLines={1}
              className={`shrink font-sans text-label-lg font-normal ${labelColor}`}
            >
              {label}
            </Text>
          </View>
          {trailing ? (
            <Icon
              icon={trailingIcon(trailing)}
              size="lg"
              color={muted ? object.subtler : object.assistive}
            />
          ) : null}
          <InteractionLayer pressed={pressed} color={semantic.fill.boldest} radius={8} />
        </>
      )}
    </Pressable>
  );
}
