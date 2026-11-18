import { semantic } from '@/design-tokens';
import { MagnifyingGlassIcon } from 'phosphor-react-native/src/icons/MagnifyingGlass';
import { XCircleIcon } from 'phosphor-react-native/src/icons/XCircle';
import { Pressable, TextInput, type TextInputProps, View } from 'react-native';

import { Icon } from '../display/Icon';
import { InteractionLayer } from '../decoration/InteractionLayer';

// BDS Search Field: 회색 바탕(40px, r8) 검색 입력창. 값이 있으면 오른쪽에 지우기 버튼
export type SearchFieldProps = Omit<TextInputProps, 'editable' | 'style'> & {
  disabled?: boolean;
  /** 왼쪽 돋보기 아이콘 */
  leadingIconVisible?: boolean;
  /** 지우기 버튼을 눌렀을 때. 기본으로 onChangeText('') 도 불린다 */
  onClear?: () => void;
  className?: string;
};

export function SearchField({
  value,
  disabled = false,
  leadingIconVisible = true,
  onChangeText,
  onClear,
  className,
  ...inputProps
}: SearchFieldProps) {
  const { object } = semantic;
  const hasValue = !!value;

  return (
    <View
      className={`h-10 flex-row items-center gap-2 rounded-8 bg-fill-subtlest px-3.5 ${className ?? ''}`}
    >
      {leadingIconVisible ? (
        <Icon
          icon={MagnifyingGlassIcon}
          size="lg"
          color={disabled ? object.subtler : object.assistive}
        />
      ) : null}
      <TextInput
        value={value}
        editable={!disabled}
        accessibilityState={{ disabled }}
        returnKeyType="search"
        textAlignVertical="center"
        placeholderTextColor={disabled ? object.subtler : object.assistive}
        className={`flex-1 p-0 font-sans text-body-lg font-normal ${disabled ? 'text-object-subtler' : 'text-object-bolder'}`}
        onChangeText={onChangeText}
        {...inputProps}
      />
      {hasValue && !disabled ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="검색어 지우기"
          hitSlop={10}
          onPress={() => {
            onChangeText?.('');
            onClear?.();
          }}
        >
          {({ pressed }) => (
            <>
              <Icon icon={XCircleIcon} size="lg" weight="fill" color={object.alternative} />
              <InteractionLayer
                pressed={pressed}
                color={semantic.fill.boldest}
                inset={3}
                radius={8}
              />
            </>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}
