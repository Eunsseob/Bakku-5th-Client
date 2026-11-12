import { Button } from '@/shared/components/Button';
import { Checkbox } from '@/shared/components/Checkbox';
import { Chip } from '@/shared/components/Chip';
import { TextField } from '@/shared/components/TextField';
import { TopNavigation } from '@/shared/components/TopNavigation';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ExchangeWantedProps = {
  wanted: string;
  onWantedChange: (value: string) => void;
  anyItem: boolean;
  onAnyItemChange: (value: boolean) => void;
  quantity: string;
  onQuantityChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
};

export default function ExchangeWanted(props: ExchangeWantedProps) {
  const insets = useSafeAreaInsets();
  const valid = props.anyItem || (!!props.wanted.trim() && !!props.quantity);
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
      <TopNavigation type="screen" title="교환글 작성" onBack={props.onBack} />
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
      >
        <View
          accessibilityRole="progressbar"
          accessibilityLabel="교환글 작성 단계"
          accessibilityValue={{ min: 1, max: 5, now: 4 }}
          className="mt-[22px] flex-row gap-1"
        >
          {Array.from({ length: 5 }, (_, index) => (
            <View
              key={index}
              className={`h-0.5 flex-1 rounded-full ${index < 4 ? 'bg-[#4A5565]' : 'bg-[#E5E7EB]'}`}
            />
          ))}
        </View>
        <Text
          style={{ includeFontPadding: false }}
          className="mt-[22px] font-sans text-[20px] leading-[26px] tracking-[-0.2px] text-[#030712]"
        >
          어떤 굿즈를 받고 싶나요?
        </Text>
        <View className="mt-8 gap-3">
          <Text
            style={{ includeFontPadding: false }}
            className="font-sans text-[14px] font-normal leading-5 text-[#030712]"
          >
            제품명
          </Text>
          <TextField
            placeholder={props.anyItem ? '아무거나 상관없어요' : '제품명을 입력해주세요.'}
            placeholderTextColor={props.anyItem ? '#D1D5DC' : '#99A1AF'}
            accessibilityLabel="받고 싶은 제품명"
            disabled={props.anyItem}
            value={props.anyItem ? '' : props.wanted}
            onChangeText={props.onWantedChange}
            maxLength={100}
          />
        </View>
        <Checkbox
          status={props.anyItem ? 'checked' : 'unchecked'}
          label="아무거나 상관없어요"
          size="md"
          className="mt-3 min-h-11 items-center"
          onPress={() => props.onAnyItemChange(!props.anyItem)}
        />
        {!props.anyItem && (
          <View className="mt-8 gap-3">
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
                      borderColor: '#D1D5DC',
                    }}
                  >
                    {option.label}
                  </Chip>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
      <View className="shrink-0 bg-white px-4 pt-3" style={{ paddingBottom: 8 + insets.bottom }}>
        <Button
          hierarchy="primary"
          disabled={!valid}
          onPress={props.onNext}
          className={`!h-[52px] self-stretch !rounded-xl ${valid ? '!bg-[#364153]' : ''}`}
        >
          계속하기
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
