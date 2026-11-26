import { ArrowUpIcon } from 'phosphor-react-native/src/icons/ArrowUp';
import { PlusIcon } from 'phosphor-react-native/src/icons/Plus';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { semantic } from '@/design-tokens';
import { Icon, type IconComponent, InteractionLayer } from '@/shared/components';

// BDS 메시지 작성 Chat Input (ChatInput/Default)
// 흰 바탕 안쪽 8 · 아래 safe area / 회색 칸(surface/deeper, r24, 안쪽 8) 안에
// [+ 버튼 36] [메시지 label/lg normal, 안쪽 8, 최대 148] [보내기 36], 버튼은 아래 정렬

/** 둥근 아이콘 버튼: 안쪽 8 + 아이콘 20, 누르면 인터랙션 레이어(바깥 3, r8) */
function RoundIconButton({
  icon,
  accessibilityLabel,
  container,
  content,
  overlay,
  disabled,
  onPress,
}: {
  icon: IconComponent;
  accessibilityLabel: string;
  container: string;
  content: string;
  overlay: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`items-center justify-center rounded-max p-2 ${container}`}
    >
      {({ pressed }) => (
        <>
          <Icon icon={icon} size="lg" color={content} />
          <InteractionLayer pressed={pressed} color={overlay} inset={3} radius={8} />
        </>
      )}
    </Pressable>
  );
}

type ChatInputProps = {
  onSend: (text: string) => void;
  onPlusPress: () => void;
};

export function ChatInput({ onSend, onPlusPress }: ChatInputProps) {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const canSend = text.trim().length > 0;

  const send = () => {
    if (!canSend) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <View className="bg-surface-standard px-2 pt-2" style={{ paddingBottom: insets.bottom + 8 }}>
      <View className="flex-row items-end gap-1.5 rounded-24 bg-surface-deeper p-2">
        <RoundIconButton
          icon={PlusIcon}
          accessibilityLabel="사진, 약속 잡기 등 더보기"
          container="bg-object-inverse-boldest"
          content={semantic.object.bolder}
          overlay={semantic.object.bolder}
          onPress={onPlusPress}
        />
        <TextInput
          value={text}
          onChangeText={setText}
          multiline
          placeholder="메시지를 입력해주세요"
          placeholderTextColor={semantic.object.subtle}
          accessibilityLabel="메시지 입력"
          className="max-h-[148px] flex-1 p-2 font-sans text-label-lg font-medium text-object-boldest"
          style={{ textAlignVertical: 'top', includeFontPadding: false }}
        />
        {/* Figma 에는 비활성 모양이 따로 없어 같은 모양으로 두고, 빈 글은 보내지 않는다 */}
        <RoundIconButton
          icon={ArrowUpIcon}
          accessibilityLabel="보내기"
          container="bg-object-neutral"
          content={semantic.object.inverse.boldest}
          overlay={semantic.surface.standard}
          disabled={!canSend}
          onPress={send}
        />
      </View>
    </View>
  );
}
