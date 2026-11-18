import { CheckIcon } from 'phosphor-react-native/src/icons/Check';
import type { ReactNode } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { primitive } from '@/design-tokens';
import { Icon } from '@/shared/components';

/*
 * 1차(11/27 스토어 심사) 와이어프레임 전용 스타일.
 * 와이어프레임은 BDS 대신 자체 회색 팔레트를 써서, 가장 가까운 BDS 회색 토큰으로 옮겼다.
 *   #030712 → gray-900   #1e2939 → gray-850   #364153 → gray-700   #4a5565 → gray-600
 *   #6a7282 → gray-500   #99a1af → gray-300   #d1d5dc → gray-150   #e5e7eb → gray-75
 *   #f3f4f6 → gray-50
 * 하이파이(BDS) 디자인이 나오면 이 파일의 컴포넌트를 BDS 공통 컴포넌트로 바꾸면 된다.
 */

// primitive.gray 는 JS 에서 단계를 펼쳐 만들어 숫자 키 타입이 빠져 있다
const GRAY = primitive.gray as unknown as Record<number, string>;

/** 아이콘 등 className 을 못 쓰는 곳에서 쓰는 같은 색 (design-tokens.js primitive 값) */
export const WIRE = {
  strong: GRAY[900],
  normal: GRAY[700],
  neutral: GRAY[600],
  alternative: GRAY[500],
  assistive: GRAY[300],
  line: GRAY[150],
  white: primitive.base[0],
};

/** 태그: 회색 바탕 + 테두리 (예약중은 진한 바탕) */
export function WireTag({
  children,
  tone = 'neutral',
}: {
  children: string;
  tone?: 'neutral' | 'dark';
}) {
  const dark = tone === 'dark';
  return (
    <View
      className={`rounded-4 px-1.5 py-0.5 ${dark ? 'bg-gray-600' : 'border border-gray-75 bg-gray-50'}`}
    >
      <Text
        className={`font-sans text-label-xs font-medium tracking-normal ${dark ? 'text-white' : 'text-gray-600'}`}
      >
        {children}
      </Text>
    </View>
  );
}

/** 안 읽은 메시지 수 (99 초과면 +99) */
export function WireCount({ count }: { count: number }) {
  return (
    <View className="min-w-[18px] items-center justify-center rounded-8 bg-gray-600 px-1.5 py-px">
      <Text className="font-sans text-label-xs font-semibold text-white">
        {count > 99 ? '+99' : count}
      </Text>
    </View>
  );
}

type WireButtonTone = 'strong' | 'dark' | 'light' | 'muted';
type WireButtonSize = 'sm' | 'md' | 'lg';

const BUTTON_TONE: Record<WireButtonTone, { container: string; text: string }> = {
  strong: { container: 'bg-gray-700', text: 'text-white' },
  dark: { container: 'bg-gray-600', text: 'text-white' },
  light: { container: 'border border-gray-75 bg-gray-50', text: 'text-gray-500' },
  /** 확인 창의 [취소]: 테두리 없는 회색 */
  muted: { container: 'bg-gray-50', text: 'text-gray-500' },
};

const BUTTON_SIZE: Record<WireButtonSize, { container: string; text: string }> = {
  /** 카드 안 버튼: 36px, 14 Medium */
  sm: { container: 'h-9 rounded-8', text: 'text-label-md font-medium' },
  /** 확인 창 버튼: 40px, 14 SemiBold */
  md: { container: 'h-10 rounded-8', text: 'text-label-md font-semibold' },
  /** 화면 아래 큰 버튼: 52px, 16 SemiBold */
  lg: { container: 'h-[52px] rounded-12', text: 'text-label-lg font-semibold' },
};

export function WireButton({
  label,
  onPress,
  tone = 'dark',
  size = 'sm',
  disabled = false,
  className,
}: {
  label: string;
  onPress?: () => void;
  tone?: WireButtonTone;
  size?: WireButtonSize;
  disabled?: boolean;
  className?: string;
}) {
  // 비활성은 와이어프레임의 '수락 대기중'처럼 연한 회색
  const colors = disabled ? BUTTON_TONE.light : BUTTON_TONE[tone];
  const sizes = BUTTON_SIZE[size];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`items-center justify-center ${sizes.container} ${colors.container} ${className ?? ''}`}
      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
    >
      <Text className={`font-sans ${sizes.text} ${disabled ? 'text-gray-300' : colors.text}`}>
        {label}
      </Text>
    </Pressable>
  );
}

/** 화면 아래 고정 버튼 (좌우 16, 위 8, 아래 safe area) */
export function WireBottomButton(props: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View className="bg-white px-4 pt-2" style={{ paddingBottom: insets.bottom + 8 }}>
      <WireButton {...props} tone="strong" size="lg" className="self-stretch" />
    </View>
  );
}

export function WireRadio({ checked }: { checked: boolean }) {
  return checked ? (
    <View className="size-5 items-center justify-center rounded-full bg-gray-600">
      <View className="size-2 rounded-full bg-white" />
    </View>
  ) : (
    <View className="size-5 rounded-full border border-gray-150" />
  );
}

export function WireCheckbox({ checked }: { checked: boolean }) {
  return checked ? (
    <View className="size-5 items-center justify-center rounded-4 bg-gray-600">
      <Icon icon={CheckIcon} size="sm" color={WIRE.white} />
    </View>
  ) : (
    <View className="size-5 rounded-4 border border-gray-150" />
  );
}

/** 확인 창: 흐린 배경(16%) + 가운데 카드, [회색] [진한] 버튼 */
export function WireDialog({
  visible,
  title,
  description,
  cancelLabel = '취소',
  confirmLabel,
  onCancel,
  onConfirm,
  children,
}: {
  visible: boolean;
  title: string;
  description?: string;
  cancelLabel?: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  children?: ReactNode;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View className="flex-1 items-center justify-center px-10">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="닫기"
          onPress={onCancel}
          className="absolute inset-0 bg-black/15"
        />
        <View
          accessibilityViewIsModal
          className="w-full max-w-[320px] gap-4 rounded-16 bg-white p-5"
        >
          <View className="gap-2">
            <Text
              accessibilityRole="header"
              className="font-sans text-title-2 font-semibold text-gray-900"
            >
              {title}
            </Text>
            {description ? (
              <Text className="font-sans text-body-lg font-normal text-gray-600">
                {description}
              </Text>
            ) : null}
            {children}
          </View>
          <View className="flex-row gap-1">
            <WireButton
              label={cancelLabel}
              tone="muted"
              size="md"
              onPress={onCancel}
              className="flex-1"
            />
            <WireButton
              label={confirmLabel}
              tone="dark"
              size="md"
              onPress={onConfirm}
              className="flex-1"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
