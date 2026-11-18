import { CheckIcon } from 'phosphor-react-native/src/icons/Check';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { semantic } from '@/design-tokens';
import { Icon, type IconComponent } from '@/shared/components';

import { WIRE } from './wire';

export type SheetMenuOption = {
  key: string;
  label: string;
  icon?: IconComponent;
  disabled?: boolean;
};

type SheetMenuProps = {
  visible: boolean;
  options: SheetMenuOption[];
  onSelect: (key: string) => void;
  onClose: () => void;
  title?: string;
  /** 선택된 항목 오른쪽에 체크 표시 */
  selectedKey?: string;
};

// 아래에서 올라오는 선택 메뉴 (채팅방 + 버튼, 날짜·시간 고르기 등)
export function SheetMenu({
  visible,
  options,
  onSelect,
  onClose,
  title,
  selectedKey,
}: SheetMenuProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="닫기"
          onPress={onClose}
          className="absolute inset-0 bg-black/15"
        />
        {/* 채팅·약속-3: 좌우 8 띄운 흰 시트 r16, 손잡이 48×4, 줄 높이 44 · 16 Regular */}
        <View
          className="mx-2 max-h-[70%] rounded-16 bg-white"
          style={{ marginBottom: insets.bottom + 8 }}
        >
          <View className="h-[18px] items-center justify-center">
            <View className="h-1 w-12 rounded-max bg-gray-75" />
          </View>
          {title ? (
            <Text className="px-4 pb-1 pt-2 font-sans text-label-lg font-semibold text-gray-900">
              {title}
            </Text>
          ) : null}
          <ScrollView bounces={false} contentContainerClassName="pb-2">
            {options.map((option) => {
              const selected = option.key === selectedKey;
              const color = option.disabled ? WIRE.assistive : WIRE.normal;
              return (
                <Pressable
                  key={option.key}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !!option.disabled, selected }}
                  disabled={option.disabled}
                  onPress={() => onSelect(option.key)}
                  className="h-11 flex-row items-center gap-3 px-4"
                  style={({ pressed }) => ({
                    backgroundColor: pressed ? semantic.fill.subtlest : undefined,
                  })}
                >
                  {option.icon ? <Icon icon={option.icon} size="lg" color={color} /> : null}
                  <Text
                    className={`flex-1 font-sans text-label-lg ${option.disabled ? 'text-gray-300' : selected ? 'font-semibold text-gray-900' : 'font-normal text-gray-700'}`}
                  >
                    {option.label}
                  </Text>
                  {selected ? <Icon icon={CheckIcon} size="lg" color={WIRE.strong} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
