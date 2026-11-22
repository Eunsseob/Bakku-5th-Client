import { Button, Radio, RadioMark, TopNavigation } from '@/shared/components';
import { XIcon } from 'phosphor-react-native/src/icons/X';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ExchangeProgress from './ExchangeProgress';
import { useValidationScroll } from '../utils/useValidationScroll';

type ExchangeTimingProps = {
  step: 1 | 2;
  onsite: boolean | null;
  onSelect: (onsite: boolean) => void;
  onBack: () => void;
  onQuit: () => void;
  onNext: () => void;
  minutes: number;
  onDurationSelect: (minutes: number) => void;
};

const exchangeModes = [
  { value: true, title: '지금 교환', description: '지금 주변의 교환할 사람을 찾아요' },
  { value: false, title: '일반 교환', description: '장소 · 날짜를 정해 만나서 교환해요' },
] as const;

export default function ExchangeTiming({
  step,
  onsite,
  onSelect,
  onBack,
  onQuit,
  onNext,
  minutes,
  onDurationSelect,
}: ExchangeTimingProps) {
  const insets = useSafeAreaInsets();
  const [modeSubmitted, setModeSubmitted] = useState(false);
  const [durationSubmitted, setDurationSubmitted] = useState(false);
  const { scrollRef, fieldLayout, focusError } = useValidationScroll<'mode' | 'duration'>();
  if (step === 1) {
    const modeError = '교환 방식을 선택해 주세요.';
    const showModeError = modeSubmitted && onsite === null;
    return (
      <View
        className="flex-1 bg-white"
        style={{
          paddingTop: Math.max(44, insets.top),
          paddingLeft: insets.left,
          paddingRight: insets.right,
        }}
      >
        <View className="h-14 justify-center px-1.5">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="교환글 작성 닫기"
            onPress={onQuit}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <XIcon size={24} color="#232531" weight="bold" />
          </Pressable>
        </View>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 32, paddingBottom: 24 }}
        >
          <Text
            accessibilityRole="header"
            className="font-sans text-[28px] leading-[36px] tracking-[-0.56px] text-[#2E303D]"
          >
            언제 교환할까요?
          </Text>
          <View
            onLayout={fieldLayout('mode')}
            accessibilityRole="radiogroup"
            accessibilityLabel="교환 방식"
            style={{ marginTop: 40, gap: 8 }}
          >
            {exchangeModes.map(({ value, title, description }) => {
              const selected = onsite === value;
              return (
                <Pressable
                  key={title}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={`${title}. ${description}`}
                  onPress={() => onSelect(value)}
                  style={{
                    minHeight: 76,
                    borderWidth: 2,
                    borderColor: showModeError ? '#EC0042' : selected ? '#000419AA' : '#000D4B25',
                    backgroundColor: showModeError ? '#EC00420D' : undefined,
                    borderRadius: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                  }}
                >
                  <View className="flex-1 gap-0.5">
                    <Text className="font-sans text-[16px] leading-[22px] tracking-[-0.16px] text-[#232531]">
                      {title}
                    </Text>
                    <Text className="font-sans text-[13px] leading-5 text-[#00051E8D]">
                      {description}
                    </Text>
                  </View>
                  <RadioMark checked={selected} />
                </Pressable>
              );
            })}
            {showModeError && (
              <Text className="font-sans text-label-md text-theme-red-bold">{modeError}</Text>
            )}
          </View>
        </ScrollView>
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: 10 + Math.max(34, insets.bottom),
          }}
        >
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setModeSubmitted(true);
              if (onsite === null) focusError('mode', modeError);
              else onNext();
            }}
            style={{
              minHeight: 52,
              borderRadius: 12,
              backgroundColor: '#000212D1',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            <Text className="text-center font-sans text-[18px] leading-6 tracking-[-0.18px] text-white">
              {onsite === false ? '일반 교환할 분 구하기' : '지금 교환할 분 구하기'}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const options = [15, 30, 60, 120, 180].map((value) => ({
    key: String(value),
    title: value < 60 ? `${value}분` : `${value / 60}시간`,
    selected: minutes === value,
    onPress: () => onDurationSelect(value),
  }));
  const hasSelection = options.some((option) => option.selected);
  const durationError = '교환 가능 시간을 선택해 주세요.';
  const showError = durationSubmitted && !hasSelection;

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingLeft: insets.left, paddingRight: insets.right }}
    >
      <TopNavigation
        type="screen"
        title="교환글 작성"
        onBack={onBack}
        trailingLabel="그만두기"
        onTrailingPress={onQuit}
      />
      <ScrollView ref={scrollRef} contentContainerClassName="px-4 pb-8" className="flex-1">
        <ExchangeProgress current={1} total={4} className="mt-6" />
        <Text className="mb-[38px] mt-[30px] font-sans text-[20px] leading-[26px] tracking-[-0.2px] text-[#030712]">
          언제까지 교환할 수 있나요?
        </Text>
        <View
          onLayout={fieldLayout('duration')}
          accessibilityRole="radiogroup"
          accessibilityLabel="교환 가능 시간"
          className="gap-2"
        >
          {options.map((option) => {
            const selected = option.selected;
            return (
              <View
                key={option.key}
                className={`h-[54px] justify-center rounded-lg border ${selected ? 'border-2 border-[#364153]' : showError ? 'border-theme-red-bold bg-theme-red-subtlest' : 'border-[#D1D5DC]'}`}
              >
                <Radio
                  checked={selected}
                  accessibilityLabel={option.title}
                  onPress={option.onPress}
                  className="h-full w-full items-center justify-end self-stretch px-4"
                />
                <View pointerEvents="none" className="absolute left-4 right-12 gap-1">
                  <Text className="font-sans text-[16px] leading-[22px] tracking-[-0.16px] text-[#030712]">
                    {option.title}
                  </Text>
                </View>
              </View>
            );
          })}
          {showError && (
            <Text className="font-sans text-label-md text-theme-red-bold">{durationError}</Text>
          )}
        </View>
      </ScrollView>
      <View className="bg-white px-4 pt-3" style={{ paddingBottom: 8 + insets.bottom }}>
        <Button
          hierarchy="primary"
          size="lg"
          onPress={() => {
            setDurationSubmitted(true);
            if (hasSelection) onNext();
            else focusError('duration', durationError);
          }}
          className="!h-[52px] self-stretch !rounded-xl !bg-[#364153]"
        >
          다음
        </Button>
      </View>
    </View>
  );
}
