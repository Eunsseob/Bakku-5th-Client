import { ArrowUpIcon } from 'phosphor-react-native/src/icons/ArrowUp';
import { PlusIcon } from 'phosphor-react-native/src/icons/Plus';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/shared/components';

import { WIRE } from './wire';

type ChatInputProps = {
  onSend: (text: string) => void;
  onPlusPress: () => void;
};

// 채팅방 하단 입력창. Figma UI-Flow '채팅·약속-2(입력중 / 2줄 이상)' 값 그대로
// 회색 칸(안쪽 6) 안에 [+ 32] 8 [메시지 body/lg, 행간 26] [보내기 32]
// 한 줄: 알약 모양, 32 줄 가운데에 글자(위아래 3) / 두 줄 이상: 모서리 20, 버튼은 아래 정렬, 사이 6

/** body/lg 행간. 글자 높이가 한 줄 반을 넘으면 두 줄 이상으로 본다 */
const LINE_HEIGHT = 26;

export function ChatInput({ onSend, onPlusPress }: ChatInputProps) {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const [multiline, setMultiline] = useState(false);
  const canSend = text.trim().length > 0;

  const send = () => {
    if (!canSend) return;
    onSend(text.trim());
    setText('');
    setMultiline(false);
  };

  return (
    <View className="bg-white px-2 pt-2" style={{ paddingBottom: insets.bottom + 8 }}>
      <View
        className={`flex-row items-end bg-gray-50 p-1.5 ${multiline ? 'rounded-[20px]' : 'rounded-max'}`}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="사진, 약속 잡기 등 더보기"
          onPress={onPlusPress}
          className={`size-8 items-center justify-center rounded-full bg-white ${multiline ? 'mr-1.5' : 'mr-2'}`}
        >
          <Icon icon={PlusIcon} size="lg" color={WIRE.strong} />
        </Pressable>
        <TextInput
          value={text}
          onChangeText={setText}
          multiline
          placeholder="메세지를 입력하세요."
          placeholderTextColor={WIRE.alternative}
          accessibilityLabel="메시지 입력"
          onContentSizeChange={(event) =>
            setMultiline(event.nativeEvent.contentSize.height > LINE_HEIGHT * 1.5)
          }
          // 4줄(26 × 4)까지 늘어나고 그 뒤로는 안에서 스크롤
          className={`max-h-[104px] min-h-8 flex-1 p-0 font-sans text-body-lg font-normal text-gray-700 ${multiline ? 'mr-1.5' : 'py-[3px]'}`}
          style={{ textAlignVertical: multiline ? 'top' : 'center', includeFontPadding: false }}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="보내기"
          accessibilityState={{ disabled: !canSend }}
          disabled={!canSend}
          onPress={send}
          className={`size-8 items-center justify-center rounded-full ${canSend ? 'bg-gray-600' : 'bg-white'}`}
        >
          <Icon icon={ArrowUpIcon} size="lg" color={canSend ? WIRE.white : WIRE.assistive} />
        </Pressable>
      </View>
    </View>
  );
}
