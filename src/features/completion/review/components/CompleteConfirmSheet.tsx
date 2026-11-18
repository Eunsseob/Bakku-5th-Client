import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// F-1 '한쪽만 확정해도 교환 완료 처리돼요' 시트. Figma UI-Flow '교환 확정 - 메시지 선택시' 값 그대로
// 흐린 배경 #2e2e33 40%, 흰 시트 위 모서리 20, 좌우 16
// 제목 20 SemiBold → 16 → 설명 16 Regular → 37 → [취소 126][교환 확정] 52 r12, 사이 9

type CompleteConfirmSheetProps = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function CompleteConfirmSheet({ visible, onCancel, onConfirm }: CompleteConfirmSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="닫기"
          onPress={onCancel}
          className="absolute inset-0 bg-[#2e2e3366]"
        />
        <View
          accessibilityViewIsModal
          className="rounded-t-[20px] bg-white px-4 pt-[22px]"
          style={{ paddingBottom: Math.max(insets.bottom, 34) }}
        >
          <Text
            accessibilityRole="header"
            className="font-sans text-title-2 font-semibold text-black"
          >
            한쪽만 확정해도 교환 완료 처리돼요
          </Text>
          <Text className="mt-4 font-sans text-label-lg font-normal text-black">
            {'한 명만 교환 완료 처리해도 교환이 확정돼요.\n확정은 취소할 수 없으니 주의하세요.'}
          </Text>
          <View className="mt-[37px] flex-row gap-[9px]">
            <Pressable
              accessibilityRole="button"
              onPress={onCancel}
              className="h-[52px] w-[126px] items-center justify-center rounded-12 bg-[#d1d5dc]"
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
              <Text className="font-sans text-label-lg font-semibold text-[#99a1af]">취소</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onConfirm}
              className="h-[52px] flex-1 items-center justify-center rounded-12 bg-[#364153]"
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
              <Text className="font-sans text-label-lg font-semibold text-white">교환 확정</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
