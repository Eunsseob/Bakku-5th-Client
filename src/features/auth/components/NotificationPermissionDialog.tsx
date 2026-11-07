import { Modal, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  onChoose: (allowed: boolean) => void;
  onClose: () => void;
};

const font = { fontFamily: 'Pretendard', includeFontPadding: false };

// 화면 확인용 팝업이며 실제 OS 알림 권한을 변경하지 않습니다.
export default function NotificationPermissionDialog({ visible, onChoose, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <View
          accessibilityViewIsModal
          accessibilityLabel="알림 허용 안내"
          className="w-[280px] max-w-full overflow-hidden rounded-[16px] bg-white"
        >
          <View className="min-h-[138px] px-4 pb-6 pt-[26px]">
            <Text style={font} className="text-center text-[15px] leading-[21px] text-[#2E2E33]">
              {'알림창 열릴 예정입니다.'}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
