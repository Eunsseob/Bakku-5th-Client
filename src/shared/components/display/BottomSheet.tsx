import { XIcon } from 'phosphor-react-native/src/icons/X';
import type { ReactNode } from 'react';
import { Pressable, Modal as RNModal, Text, View, type ModalProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../action/Button';
import { IconButton } from '../action/IconButton';

// BDS Bottom Sheet: 화면 아래에서 올라오는 시트 (헤더 · 내용 · 아래 버튼)
type BottomSheetAction = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

type BottomSheetProps = {
  visible: boolean;
  /** 뒤로가기 · 배경 · 닫기 버튼으로 닫을 때 */
  onRequestClose: () => void;
  /** iOS에서 닫기 애니메이션이 끝나면 호출 */
  onDismiss?: ModalProps['onDismiss'];
  animationType?: ModalProps['animationType'];
  minimumBottomInset?: number;
  className?: string;
  title?: string;
  description?: string;
  /** 위쪽 손잡이 */
  handleVisible?: boolean;
  /** 헤더 오른쪽 X 버튼 */
  closeButtonVisible?: boolean;
  /** 꽉 찬 보라 버튼 */
  primary?: BottomSheetAction;
  /** 메인 버튼 아래 글자 버튼 */
  secondary?: BottomSheetAction;
  children?: ReactNode;
};

export function BottomSheet({
  visible,
  onRequestClose,
  onDismiss,
  animationType = 'fade',
  minimumBottomInset = 0,
  className = 'rounded-t-24 bg-surface-standard',
  title,
  description,
  handleVisible = true,
  closeButtonVisible = false,
  primary,
  secondary,
  children,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const hasHeader = !!(title || description || closeButtonVisible);

  return (
    <RNModal
      visible={visible}
      transparent
      animationType={animationType}
      statusBarTranslucent
      onRequestClose={onRequestClose}
      onDismiss={onDismiss}
    >
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="닫기"
          onPress={onRequestClose}
          className="absolute inset-0 bg-curtain-dim"
        />
        <View
          accessibilityViewIsModal
          className={className}
          style={{ paddingBottom: Math.max(insets.bottom, minimumBottomInset) }}
        >
          {handleVisible ? (
            <View className="h-3 items-center justify-end">
              <View className="h-1 w-12 rounded-max bg-object-subtlest" />
            </View>
          ) : null}
          {hasHeader ? (
            <View className="flex-row gap-3 px-4 py-3.5">
              <View className="flex-1 gap-1">
                {title ? (
                  <Text
                    accessibilityRole="header"
                    className="font-sans text-title-2 font-semibold text-object-bold"
                  >
                    {title}
                  </Text>
                ) : null}
                {description ? (
                  <Text className="font-sans text-body-md font-normal text-object-alternative">
                    {description}
                  </Text>
                ) : null}
              </View>
              {closeButtonVisible ? (
                <IconButton
                  icon={XIcon}
                  accessibilityLabel="닫기"
                  hierarchy="tertiary"
                  size="xl"
                  onPress={onRequestClose}
                />
              ) : null}
            </View>
          ) : null}
          {children ? <View className="px-4">{children}</View> : null}
          {primary || secondary ? (
            <View className="gap-2 px-4 pb-2 pt-3">
              {primary ? (
                <Button
                  hierarchy="accent"
                  size="lg"
                  disabled={primary.disabled}
                  onPress={primary.onPress}
                  className="self-stretch"
                >
                  {primary.label}
                </Button>
              ) : null}
              {secondary ? (
                <Button
                  hierarchy="secondary"
                  variant="hollow"
                  size="md"
                  disabled={secondary.disabled}
                  onPress={secondary.onPress}
                  className="self-center"
                >
                  {secondary.label}
                </Button>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
    </RNModal>
  );
}
