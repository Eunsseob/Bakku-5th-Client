import { Button } from '@/shared/components';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type LoginLayoutProps = {
  onKakao: () => void;
  onNaver: () => void;
};

export default function LoginLayout({ onKakao, onNaver }: LoginLayoutProps) {
  const insets = useSafeAreaInsets();
  const providers = [
    { label: '카카오로 시작하기', onPress: onKakao, variant: 'solid' },
    { label: '네이버로 시작하기', onPress: onNaver, variant: 'outlined' },
  ] as const;
  return (
    <View
      className="flex-1 bg-white"
      style={{
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <ScrollView
        className="flex-1"
        style={{ minHeight: 0 }}
        contentContainerStyle={{
          alignItems: 'center',
          paddingTop: Math.max(24, 178 - insets.top),
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          nativeID="logo"
          accessibilityLabel="앱 로고 자리"
          className="h-[114px] w-[114px] overflow-hidden rounded-[24px] bg-[#E5E7EB]"
        />
        <Text
          className="mt-6 w-full text-center text-[32px] leading-[42px] tracking-[-0.64px] text-[#364153]"
          style={{ fontFamily: 'Pretendard', includeFontPadding: false }}
        >
          바꾸
        </Text>
        <Text
          className="w-full text-center text-[16px] leading-[26px] text-[#6A7282]"
          style={{ fontFamily: 'Pretendard', includeFontPadding: false }}
        >
          뽑은 굿즈, 바로 교환해요
        </Text>
      </ScrollView>
      <View
        className="shrink-0 items-center bg-white px-4"
        style={{ paddingBottom: Math.max(34, insets.bottom + 8) }}
      >
        <View className="w-full gap-2">
          {providers.map(({ label, onPress, variant }) => (
            <Button
              hierarchy="secondary"
              variant={variant}
              key={label}
              accessibilityRole="button"
              onPress={onPress}
              className={`w-full !rounded-xl ${variant === 'solid' ? '!bg-[#E5E7EB]' : '!border-[#D1D5DC] !bg-white'}`}
            >
              {label}
            </Button>
          ))}
        </View>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          className="mt-8 w-full text-center text-[12px] leading-[19px] tracking-[0.12px] text-[#6A7282]"
          style={{ fontFamily: 'Pretendard', includeFontPadding: false }}
        >
          가입하면 이용약관 · 개인정보 처리방침에 동의하게 돼요
        </Text>
      </View>
    </View>
  );
}
