import { Button } from '@/shared/components/Button';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type LoginLayoutProps = {
  onKakao: () => void;
  onGoogle: () => void;
  // onApple: () => void;
};

// 11. 12 애플 삭제
export default function LoginLayout({ onKakao, onGoogle }: LoginLayoutProps) {
  const insets = useSafeAreaInsets();
  const providers = [
    { label: '카카오로 시작하기', onPress: onKakao },
    { label: 'Google로 시작하기', onPress: onGoogle },
    // { label: 'Apple로 시작하기', onPress: onApple },
  ];
  return (
    <View
      className="flex-1 bg-white"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          alignItems: 'center',
          paddingTop: Math.max(24, 177 - insets.top),
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View nativeID="logo" className="h-20 w-20 overflow-hidden rounded-[20px] bg-[#E0E0E6]" />
        <Text
          className="mt-5 w-full text-center text-[20px] leading-[28px] text-[#2E2E33]"
          style={{ fontFamily: 'Pretendard', includeFontPadding: false }}
        >
          가챠교환 (가칭)
        </Text>
        <Text
          className="mt-2 w-full text-center text-[14px] leading-5 text-[#737380]"
          style={{ fontFamily: 'Pretendard', includeFontPadding: false }}
        >
          뽑은 굿즈, 바로 교환해요
        </Text>
      </ScrollView>
      <View
        className="shrink-0 items-center px-[21px] pt-4"
        style={{ paddingBottom: Math.max(16, 40 - insets.bottom) }}
      >
        <View className="w-full max-w-[312px] gap-3">
          {providers.map(({ label, onPress }) => (
            <Button
              hierarchy="secondary"
              variant="outlined"
              key={label}
              accessibilityRole="button"
              onPress={onPress}
              className="w-full"
            >
              {label}
            </Button>
          ))}
        </View>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          className="mt-[22px] w-full max-w-[312px] text-center text-[11px] leading-[15px] text-[#737380]"
          style={{ fontFamily: 'Pretendard', includeFontPadding: false }}
        >
          가입하면 이용약관 · 개인정보 처리방침에 동의하게 돼요
        </Text>
      </View>
    </View>
  );
}
