import { Pressable, Modal as RNModal, Text, View } from 'react-native';

import { Button } from './Button';

// BDS Modal: 화면 위에 띄우는 확인용 대화상자
export type ModalButtonLayout = 'horizontal' | 'vertical';

type ModalAction = {
  label: string;
  onPress: () => void;
};

type ModalProps = {
  visible: boolean;
  title?: string;
  description?: string;
  /** 진한 버튼 */
  primary: ModalAction;
  /** 회색 버튼 */
  secondary?: ModalAction;
  buttonLayout?: ModalButtonLayout;
  /** 뒤로가기·배경 터치로 닫을 때 호출. 없으면 배경을 눌러도 닫히지 않는다 */
  onRequestClose?: () => void;
};

export function Modal({
  visible,
  title,
  description,
  primary,
  secondary,
  buttonLayout = 'horizontal',
  onRequestClose,
}: ModalProps) {
  const vertical = buttonLayout === 'vertical';

  const primaryButton = (
    <Button
      hierarchy="primary"
      size="md"
      onPress={primary.onPress}
      className={vertical ? 'self-stretch' : 'flex-1'}
    >
      {primary.label}
    </Button>
  );
  const secondaryButton = secondary ? (
    <Button
      hierarchy="secondary"
      size="md"
      onPress={secondary.onPress}
      className={vertical ? 'self-stretch' : 'flex-1'}
    >
      {secondary.label}
    </Button>
  ) : null;

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onRequestClose}
    >
      <View className="flex-1 items-center justify-center px-8">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="닫기"
          disabled={!onRequestClose}
          onPress={onRequestClose}
          className="absolute inset-0 bg-curtain-dim"
        />
        <View
          accessibilityViewIsModal
          className="w-full min-w-[240px] max-w-[400px] gap-4 rounded-2xl bg-surface-standard p-5"
        >
          {title || description ? (
            <View className="gap-2 self-stretch">
              {title ? (
                <Text
                  accessibilityRole="header"
                  className="font-sans text-title-2 font-semibold text-object-boldest"
                >
                  {title}
                </Text>
              ) : null}
              {description ? (
                <Text className="font-sans text-label-lg font-normal text-object-normal">
                  {description}
                </Text>
              ) : null}
            </View>
          ) : null}
          <View className={`gap-2 self-stretch ${vertical ? '' : 'flex-row items-center'}`}>
            {vertical ? (
              <>
                {primaryButton}
                {secondaryButton}
              </>
            ) : (
              <>
                {secondaryButton}
                {primaryButton}
              </>
            )}
          </View>
        </View>
      </View>
    </RNModal>
  );
}
