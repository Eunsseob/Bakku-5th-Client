import { BottomSheet } from '@/shared/components';

import { Pressable, Text, View } from 'react-native';

// F-1-2 바텀시트. Figma BDS '📝 화면 작업 > ✅F. 교환 완료 > F-1-2. 바텀시트' 값 그대로
// 공통 BDS Bottom Sheet: 손잡이 · 제목 title/2 · 설명 · X 버튼 · [교환 확정] 보라 lg · [취소] 글자 버튼

type CompleteConfirmSheetProps = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function CompleteConfirmSheet({ visible, onCancel, onConfirm }: CompleteConfirmSheetProps) {
  return (
    <BottomSheet
      visible={visible}
      onRequestClose={onCancel}
      minimumBottomInset={34}
      handleVisible={false}
      className="rounded-t-[20px] bg-white pt-[22px]"
    >
      <Text accessibilityRole="header" className="font-sans text-title-2 font-semibold text-black">
        한쪽만 확정해도 교환 완료 처리돼요
      </Text>
      <Text className="mt-4 font-sans text-label-lg font-normal text-black">
        {'한 명만 교환 완료 처리해도 교환이 확정돼요.\n확정은 취소할 수 없으니 주의하세요.'}
      </Text>
      <View className="mt-[37px] flex-row gap-[9px]">
        <Pressable
          accessibilityRole="button"
          onPress={onCancel}
          className="h-[52px] w-[126px] items-center justify-center rounded-12 bg-gray-150"
          style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
        >
          <Text className="font-sans text-label-lg font-semibold text-gray-300">취소</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onConfirm}
          className="h-[52px] flex-1 items-center justify-center rounded-12 bg-gray-700"
          style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
        >
          <Text className="font-sans text-label-lg font-semibold text-white">교환 확정</Text>
        </Pressable>
      </View>
    </BottomSheet>
      title="한 쪽만 확정해도 교환완료 처리돼요"
      description={
        '한 명만 교환 완료 처리해도 교환이 확정됩니다.\n확정은 취소할 수 없으니 주의해주세요.'
      }
      closeButtonVisible
      primary={{ label: '교환 확정', onPress: onConfirm }}
      secondary={{ label: '취소', onPress: onCancel }}
    />
  );
}
