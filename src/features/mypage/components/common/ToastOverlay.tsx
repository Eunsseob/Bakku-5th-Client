import { View } from 'react-native';

import { Toast, type ToastLeading } from '@/shared/components';

type ToastOverlayProps = {
  message: string | null;
  leading?: ToastLeading;
};

/** 화면 아래쪽에 잠깐 띄우는 공통 Toast. Figma: 좌우 8 · 하단 탭바 위 24 */
export function ToastOverlay({ message, leading }: ToastOverlayProps) {
  if (!message) return null;
  return (
    <View pointerEvents="none" className="absolute inset-x-2 bottom-6">
      <Toast title={message} leading={leading} />
    </View>
  );
}
