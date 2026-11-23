import { Button, Checkbox, Chip, TextField, TopNavigation } from '@/shared/components';
import { useRef, useState, type ComponentRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ExchangeProgress, { type ExchangeProgressValue } from './ExchangeProgress';
import { useValidationScroll } from '../utils/useValidationScroll';

type ExchangeWantedProps = {
  editing?: boolean;
  progress: ExchangeProgressValue;
  wanted: string;
  onWantedChange: (value: string) => void;
  anyItem: boolean;
  onAnyItemChange: (value: boolean) => void;
  quantity: string;
  onQuantityChange: (value: string) => void;
  onBack: () => void;
  onQuit: () => void;
  onNext: () => void;
};

export default function ExchangeWanted(props: ExchangeWantedProps) {
  const insets = useSafeAreaInsets();
  const [submitted, setSubmitted] = useState(false);
  const [wantedTouched, setWantedTouched] = useState(false);
  const wantedRef = useRef<ComponentRef<typeof TextInput>>(null);
  const { scrollRef, fieldLayout, focusError } = useValidationScroll<'wanted' | 'quantity'>();
  const wantedError =
    !props.anyItem && !props.wanted.trim() ? '받고 싶은 제품명을 입력해 주세요.' : undefined;
  const quantityError =
    !props.anyItem && !props.editing && !props.quantity ? '교환 개수를 선택해 주세요.' : undefined;
  const next = () => {
    setSubmitted(true);
    if (wantedError) focusError('wanted', wantedError, wantedRef.current);
    else if (quantityError) focusError('quantity', quantityError);
    else props.onNext();
  };
  const quantities = [
    { label: '1개씩 교환', value: '1:1만', width: 86 },
    { label: '여러 개 교환', value: '여러 개 교환', width: 95 },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
      style={{ paddingLeft: insets.left, paddingRight: insets.right }}
    >
      <TopNavigation
        type="screen"
        title={props.editing ? '교환글 수정' : '교환글 작성'}
        onBack={props.onBack}
        trailingLabel="그만두기"
        onTrailingPress={props.onQuit}
      />
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
      >
        <ExchangeProgress {...props.progress} />
        <Text
          style={{ includeFontPadding: false }}
          className="mt-[22px] font-sans text-[20px] leading-[26px] tracking-[-0.2px] text-[#030712]"
        >
          어떤 굿즈를 받고 싶나요?
        </Text>
        <View onLayout={fieldLayout('wanted')} className="mt-8 gap-3">
          <Text
            style={{ includeFontPadding: false }}
            className="font-sans text-[14px] font-normal leading-5 tracking-[-0.14px] text-[#1A1B27]"
          >
            제품명
          </Text>
          <TextField
            inputRef={wantedRef}
            placeholder={props.anyItem ? '아무거나 상관없어요' : '제품명을 입력해주세요.'}
            placeholderTextColor={props.anyItem ? '#D1D5DC' : '#000A3161'}
            accessibilityLabel="받고 싶은 제품명"
            disabled={props.anyItem}
            value={props.anyItem ? '' : props.wanted}
            error={submitted || wantedTouched ? wantedError : undefined}
            onChangeText={props.onWantedChange}
            onBlur={() => setWantedTouched(true)}
            maxLength={50}
          />
        </View>
        <Checkbox
          status={props.anyItem ? 'checked' : 'unchecked'}
          label="아무거나 상관없어요"
          size="md"
          className="mt-3 min-h-11 items-center"
          onPress={() => props.onAnyItemChange(!props.anyItem)}
        />
        {!props.anyItem && !props.editing && (
          <View onLayout={fieldLayout('quantity')} className="mt-8 gap-3">
            <Text
              style={{ includeFontPadding: false }}
              className="font-sans text-[14px] leading-5 text-[#030712]"
            >
              교환 개수
            </Text>
            <View
              accessibilityRole="radiogroup"
              accessibilityLabel="교환 개수"
              className="flex-row gap-2"
            >
              {quantities.map((option) => {
                const selected = props.quantity === option.value;
                return (
                  <Chip
                    key={option.value}
                    size="sm"
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    hierarchy={selected ? 'primary' : 'secondary'}
                    variant={selected ? 'solid' : 'outlined'}
                    onPress={() => props.onQuantityChange(option.value)}
                    className="!h-[38px] !px-0"
                    style={{
                      width: option.width,
                      backgroundColor: selected ? '#364153' : '#FFFFFF',
                      borderColor: submitted && quantityError ? '#EC0042' : '#D1D5DC',
                    }}
                  >
                    {option.label}
                  </Chip>
                );
              })}
            </View>
            {submitted && quantityError && (
              <Text className="font-sans text-label-md text-theme-red-bold">{quantityError}</Text>
            )}
          </View>
        )}
      </ScrollView>
      <View className="shrink-0 bg-white px-4 pt-3" style={{ paddingBottom: 8 + insets.bottom }}>
        <Button
          hierarchy="primary"
          onPress={next}
          className="!h-[52px] self-stretch !rounded-xl !bg-[#364153]"
        >
          계속하기
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
