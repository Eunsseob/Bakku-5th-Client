import { semantic } from '@/design-tokens';
import { CalendarBlankIcon } from 'phosphor-react-native/src/icons/CalendarBlank';
import { CaretDownIcon } from 'phosphor-react-native/src/icons/CaretDown';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';
import { ClockIcon } from 'phosphor-react-native/src/icons/Clock';
import { XIcon } from 'phosphor-react-native/src/icons/X';
import { useState } from 'react';
import { Text, TextInput, type TextInputProps, View } from 'react-native';

import { Icon, type IconComponent } from './Icon';
import { IconButton } from './IconButton';

// BDS Text Field: 레이블 + 입력창(field/area) + 헬퍼 메시지
export type TextFieldTrailing = 'delete' | 'dropDown' | 'move' | 'time' | 'date';

type TextFieldProps = Omit<TextInputProps, 'editable' | 'style'> & {
  label?: string;
  /** 레이블 옆 '(선택)' 표시 */
  optional?: boolean;
  helperText?: string;
  /** true 이거나 문자열이면 에러 상태. 문자열이면 헬퍼 대신 에러 메시지로 보여준다 */
  error?: boolean | string;
  disabled?: boolean;
  leadingIcon?: IconComponent;
  /** 오른쪽 아이콘. delete 는 누르면 값을 비운다 */
  trailing?: TextFieldTrailing;
  onTrailingPress?: () => void;
  className?: string;
};

const TRAILING: Record<TextFieldTrailing, { icon: IconComponent; label: string }> = {
  delete: { icon: XIcon, label: '입력 지우기' },
  dropDown: { icon: CaretDownIcon, label: '목록 열기' },
  move: { icon: CaretRightIcon, label: '이동' },
  time: { icon: ClockIcon, label: '시간 선택' },
  date: { icon: CalendarBlankIcon, label: '날짜 선택' },
};

export function TextField({
  label,
  optional = false,
  helperText,
  error,
  disabled = false,
  leadingIcon,
  trailing,
  onTrailingPress,
  multiline,
  className,
  onFocus,
  onBlur,
  onChangeText,
  ...inputProps
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const hasError = !!error && !disabled;
  const message = typeof error === 'string' && !disabled ? error : helperText;

  let control: string;
  if (disabled) control = 'border-stroke-alpha-subtler';
  else if (hasError) control = 'border-theme-red-bold bg-theme-red-subtlest';
  else if (focused) control = 'border-stroke-alpha-bold';
  else control = 'border-stroke-alpha-assistive';

  const handleTrailingPress = () => {
    if (trailing === 'delete') onChangeText?.('');
    onTrailingPress?.();
  };

  return (
    <View className={`gap-3 ${className ?? ''}`}>
      {label ? (
        <View className="flex-row items-center gap-0.5">
          <Text
            className={`font-sans text-label-md font-semibold ${disabled ? 'text-object-subtler' : 'text-object-boldest'}`}
          >
            {label}
          </Text>
          {optional ? (
            <Text
              className={`font-sans text-label-md font-normal ${disabled ? 'text-object-subtler' : 'text-object-assistive'}`}
            >
              (선택)
            </Text>
          ) : null}
        </View>
      ) : null}
      <View className="gap-2">
        <View
          className={`flex-row gap-2 rounded-lg border px-3.5 py-3 ${multiline ? 'min-h-[120px] items-start' : 'items-center'} ${control}`}
        >
          {leadingIcon && !multiline ? (
            <Icon
              icon={leadingIcon}
              size="lg"
              color={disabled ? semantic.object.subtler : semantic.object.normal}
            />
          ) : null}
          <TextInput
            editable={!disabled}
            multiline={multiline}
            textAlignVertical={multiline ? 'top' : 'center'}
            placeholderTextColor={disabled ? semantic.object.subtler : semantic.object.assistive}
            className={`flex-1 p-0 font-sans text-body-lg ${disabled ? 'text-object-subtler' : 'text-object-bolder'}`}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
            onChangeText={onChangeText}
            {...inputProps}
          />
          {trailing && !multiline ? (
            <IconButton
              icon={TRAILING[trailing].icon}
              accessibilityLabel={TRAILING[trailing].label}
              hierarchy="secondary"
              size="lg"
              disabled={disabled}
              onPress={handleTrailingPress}
            />
          ) : null}
        </View>
        {message ? (
          <Text
            className={`font-sans text-label-md font-normal ${disabled ? 'text-object-subtler' : hasError ? 'text-theme-red-bold' : 'text-object-alternative'}`}
          >
            {message}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
