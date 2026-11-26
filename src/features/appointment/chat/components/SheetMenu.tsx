import { CheckIcon } from 'phosphor-react-native/src/icons/Check';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { semantic } from '@/design-tokens';
import {
  BottomSheet,
  Button,
  Icon,
  type IconComponent,
  InteractionLayer,
} from '@/shared/components';

export type SheetMenuOption = {
  key: string;
  label: string;
  icon?: IconComponent;
  disabled?: boolean;
  /** 채팅방 나가기처럼 되돌릴 수 없는 동작 (빨간 글자 · 아이콘) */
  destructive?: boolean;
};

type SheetMenuProps = {
  visible: boolean;
  options: SheetMenuOption[];
  onSelect: (key: string) => void;
  onClose: () => void;
  title?: string;
  /** 선택된 항목 오른쪽에 체크 표시 (날짜 · 시간 고르기) */
  selectedKey?: string;
};

// BDS Bottom Sheet + Menu (E-3 + 메뉴, E-2-4 채팅방 옵션, 날짜 · 시간 고르기)
// 손잡이 · 좌우 16 · 줄 위아래 10 · 아이콘 20(25 칸) + 8 + label/lg · 아래 [닫기] 회색 큰 버튼
export function SheetMenu({
  visible,
  options,
  onSelect,
  onClose,
  title,
  selectedKey,
}: SheetMenuProps) {
  return (
    <BottomSheet visible={visible} title={title} onRequestClose={onClose}>
      <ScrollView bounces={false} className="max-h-[360px]">
        {options.map((option) => {
          const selected = option.key === selectedKey;
          let color: string = semantic.object.boldest;
          let label = 'text-object-bolder';
          if (option.disabled) {
            color = semantic.object.subtler;
            label = 'text-object-subtler';
          } else if (option.destructive) {
            color = semantic.theme.red.bold;
            label = 'text-theme-red-bold';
          }
          return (
            <Pressable
              key={option.key}
              accessibilityRole="menuitem"
              accessibilityState={{ disabled: !!option.disabled, selected }}
              disabled={option.disabled}
              onPress={() => onSelect(option.key)}
              className="flex-row items-center gap-2 py-2.5"
            >
              {({ pressed }) => (
                <>
                  {option.icon ? (
                    <View className="size-[25px] items-center justify-center">
                      <Icon icon={option.icon} size="lg" color={color} />
                    </View>
                  ) : null}
                  <Text
                    className={`flex-1 font-sans text-label-lg ${selected ? 'font-semibold' : 'font-normal'} ${label}`}
                  >
                    {option.label}
                  </Text>
                  {selected ? (
                    <Icon icon={CheckIcon} size="lg" color={semantic.object.boldest} />
                  ) : null}
                  <InteractionLayer pressed={pressed} color={semantic.fill.boldest} />
                </>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
      <View className="pb-2 pt-3">
        <Button hierarchy="secondary" size="lg" onPress={onClose} className="self-stretch">
          닫기
        </Button>
      </View>
    </BottomSheet>
  );
}
