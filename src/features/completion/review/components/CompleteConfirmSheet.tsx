import { BottomSheet } from '@/shared/components';

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
