import { Button } from '@/shared/components/Button';
import { Chip } from '@/shared/components/Chip';
import { Radio } from '@/shared/components/Radio';
import { TopNavigation } from '@/shared/components/TopNavigation';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ExchangeTimingProps = {
  step: 1 | 2;
  onsite: boolean;
  onSelect: (onsite: boolean) => void;
  onBack: () => void;
  onQuit: () => void;
  onNext: () => void;
  minutes: number;
  onDurationSelect: (minutes: number) => void;
};

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
  const options =
    step === 1
      ? [
          {
            key: 'now',
            title: '지금 교환',
            description: '지금 주변의 교환할 사람을 찾아요',
            selected: onsite,
            onPress: () => onSelect(true),
          },
          {
            key: 'general',
            title: '일반 교환',
            description: '장소 · 날짜를 정해 만나서 교환해요',
            selected: !onsite,
            onPress: () => onSelect(false),
          },
        ]
      : [15, 30, 60, 120, 180].map((value) => ({
          key: String(value),
          title: value < 60 ? `${value}분` : `${value / 60}시간`,
          description: '',
          selected: minutes === value,
          onPress: () => onDurationSelect(value),
        }));

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
      <ScrollView contentContainerClassName="px-4 pb-8" className="flex-1">
        <View
          accessibilityRole="progressbar"
          accessibilityLabel="교환글 작성 단계"
          accessibilityValue={{ min: 1, max: 5, now: step }}
          className="mt-6 flex-row gap-1"
        >
          {Array.from({ length: 5 }, (_, index) => (
            <View
              key={index}
              className={`h-0.5 flex-1 rounded-full ${index < step ? 'bg-[#4A5565]' : 'bg-[#E5E7EB]'}`}
            />
          ))}
        </View>
        <Text className="mb-[38px] mt-[30px] font-sans text-[20px] leading-[26px] tracking-[-0.2px] text-[#030712]">
          {step === 1 ? '언제 교환할까요?' : '언제까지 교환할 수 있나요?'}
        </Text>
        <View
          accessibilityRole="radiogroup"
          accessibilityLabel={step === 1 ? '교환 방식' : '교환 가능 시간'}
          className="gap-2"
        >
          {options.map((option) => {
            const selected = option.selected;
            return (
              <View
                key={option.key}
                className={`justify-center rounded-lg border ${step === 1 ? 'h-[76px]' : 'h-[54px]'} ${selected ? 'border-2 border-[#364153]' : 'border-[#D1D5DC]'}`}
              >
                <Radio
                  checked={selected}
                  accessibilityLabel={
                    option.description ? `${option.title}. ${option.description}` : option.title
                  }
                  onPress={option.onPress}
                  className="h-full w-full items-center justify-end self-stretch px-4"
                />
                <View pointerEvents="none" className="absolute left-4 right-12 gap-1">
                  <Text className="font-sans text-[16px] leading-[22px] tracking-[-0.16px] text-[#030712]">
                    {option.title}
                  </Text>
                  {!!option.description && (
                    <Text className="font-sans text-[13px] leading-5 text-[#4A5565]">
                      {option.description}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
        {step === 1 && onsite && (
          <View className="mt-8 gap-3">
            <Text className="font-sans text-[14px] leading-5 text-[#030712]">교환 가능 시간</Text>
            <View
              accessibilityRole="radiogroup"
              accessibilityLabel="교환 가능 시간"
              className="flex-row flex-wrap gap-2"
            >
              {[15, 30, 60, 120, 180].map((value) => {
                const selected = minutes === value;
                return (
                  <Chip
                    key={value}
                    size="sm"
                    className="!h-[38px] !w-[55px] shrink-0 !px-0"
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    hierarchy={selected ? 'primary' : 'secondary'}
                    variant={selected ? 'solid' : 'outlined'}
                    onPress={() => onDurationSelect(value)}
                    style={{
                      height: 38,
                      width: 55,
                      paddingHorizontal: 0,
                      backgroundColor: selected ? '#364153' : '#FFFFFF',
                      borderColor: '#D1D5DC',
                      borderWidth: selected ? 0 : 1,
                    }}
                  >
                    {value < 60 ? `${value}분` : `${value / 60}시간`}
                  </Chip>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
      <View className="bg-white px-4 pt-3" style={{ paddingBottom: 8 + insets.bottom }}>
        <Button
          hierarchy="primary"
          size="lg"
          onPress={onNext}
          className="!h-[52px] self-stretch !rounded-xl !bg-[#364153]"
        >
          다음
        </Button>
      </View>
    </View>
  );
}
