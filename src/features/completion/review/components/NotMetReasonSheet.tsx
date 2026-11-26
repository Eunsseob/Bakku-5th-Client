import { useEffect, useState } from 'react';
import { Keyboard, View } from 'react-native';

import { BottomSheet, Button, Radio, TextField } from '@/shared/components';

import type { NotMetReason } from '../api/confirmation';

// F-1-3 바텀시트-취소사유 · F-1-3-1 직접입력 (Figma BDS '💻 F. 교환 완료')
// BDS Bottom Sheet: 손잡이 · 제목 title/2 · X 버튼 → Radio(accent) 6개, 사이 12 → [취소사유 보내기] · [취소]
// 이유를 고르기 전에는 [취소사유 보내기]를 누를 수 없다. 직접입력은 0~100자.

const REASONS: { key: NotMetReason; label: string }[] = [
  { key: 'NO_SHOW', label: '상대가 연락없이 나오지 않았어요' },
  { key: 'SELF_ABSENT', label: '약속 장소에 가지 못했어요' },
  { key: 'ITEM_MISMATCH', label: '교환하기로 한 제품과 달랐어요' },
  { key: 'MONEY_DEMANDED', label: '상대방이 금품 거래를 요구했어요' },
  { key: 'MUTUAL_CANCEL', label: '서로 합의하고 취소했어요' },
  { key: 'OTHER', label: '직접입력' },
];

/** 직접입력 최대 글자 수 (서버 notMetDetail 0~100자) */
const DETAIL_MAX = 100;

type NotMetReasonSheetProps = {
  visible: boolean;
  onCancel: () => void;
  /** detail 은 직접입력(OTHER)일 때만 넘긴다 */
  onSubmit: (reason: NotMetReason, detail?: string) => void;
};

export function NotMetReasonSheet({ visible, onCancel, onSubmit }: NotMetReasonSheetProps) {
  const [reason, setReason] = useState<NotMetReason | null>(null);
  const [detail, setDetail] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // 직접입력 칸이 키보드에 가리지 않게 시트를 키보드만큼 올린다
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (event) =>
      setKeyboardHeight(event.endCoordinates.height),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  /** 닫을 때 고른 값을 비워서 다음에 열면 처음부터 고른다 */
  const reset = () => {
    setReason(null);
    setDetail('');
  };

  const cancel = () => {
    reset();
    onCancel();
  };

  const submit = () => {
    if (!reason) return;
    const text = detail.trim();
    reset();
    onSubmit(reason, reason === 'OTHER' && text ? text : undefined);
  };

  return (
    <BottomSheet
      visible={visible}
      title="교환하지 못한 이유를 알려주세요"
      closeButtonVisible
      onRequestClose={cancel}
    >
      <View className="gap-3 pb-3.5">
        {REASONS.map((item) => (
          <Radio
            key={item.key}
            checked={reason === item.key}
            label={item.label}
            hierarchy="accent"
            onPress={() => setReason(item.key)}
          />
        ))}
        {reason === 'OTHER' ? (
          <TextField
            multiline
            autoFocus
            value={detail}
            onChangeText={setDetail}
            maxLength={DETAIL_MAX}
            placeholder="교환하지 못한 이유를 입력해 주세요"
            accessibilityLabel="교환하지 못한 이유 직접입력"
          />
        ) : null}
      </View>
      <View className="gap-2 pb-2 pt-3" style={{ marginBottom: keyboardHeight }}>
        <Button
          hierarchy="primary"
          size="lg"
          disabled={!reason}
          onPress={submit}
          className="self-stretch"
        >
          취소사유 보내기
        </Button>
        <Button
          hierarchy="secondary"
          variant="hollow"
          size="md"
          onPress={cancel}
          className="self-center"
        >
          취소
        </Button>
      </View>
    </BottomSheet>
  );
}
