import { ChatCircleIcon } from 'phosphor-react-native/src/icons/ChatCircle';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

type LoginLayoutProps = {
  onKakao: () => void;
  onNaver: () => void;
  /** Apple 로그인을 쓸 수 없는 기기(Android 등)에서는 넘기지 않아 버튼을 숨긴다 */
  onApple?: () => void;
};

// 피그마 BDS 로그인 버튼(3281:65531)의 Apple 로고
function AppleLogo() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M7.46296 18.2898C8.53024 18.2898 8.99834 17.5502 10.3278 17.5502C11.6572 17.5502 11.9755 18.2617 13.1551 18.2617C14.3347 18.2617 15.0931 17.157 15.8327 16.0709C16.6565 14.8258 16.9936 13.6087 17.0217 13.5525C16.9468 13.5338 14.7186 12.5882 14.7186 9.95747C14.7186 7.67311 16.4787 6.64327 16.5723 6.56837C15.4114 4.84574 13.6419 4.80829 13.1645 4.80829C11.8631 4.80829 10.7959 5.6228 10.1218 5.6228C9.40091 5.6228 8.44597 4.8551 7.31316 4.8551C5.15988 4.8551 2.97851 6.69008 2.97851 10.1447C2.97851 12.2886 3.79301 14.5636 4.78539 16.0335C5.63734 17.2787 6.38631 18.2991 7.46296 18.2991V18.2898ZM10.2061 4.60232C10.9831 4.60232 11.9661 4.05932 12.5466 3.33844C13.0709 2.68309 13.4547 1.7656 13.4547 0.848108C13.4547 0.7264 13.4453 0.59533 13.4173 0.501709C12.5466 0.539158 11.5074 1.10089 10.8801 1.85922C10.3839 2.43967 9.93455 3.33844 9.93455 4.26529C9.93455 4.39636 9.95327 4.53679 9.972 4.5836C10.0282 4.59296 10.1124 4.60232 10.2061 4.60232Z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

export default function LoginLayout({ onKakao, onNaver, onApple }: LoginLayoutProps) {
  const insets = useSafeAreaInsets();
  const providers = [
    {
      label: '카카오톡으로 시작하기',
      onPress: onKakao,
      backgroundColor: '#FEE500',
      color: '#191919',
      labelStyle: undefined,
      icon: <ChatCircleIcon size={20} weight="fill" color="#191919" />,
    },
    {
      label: '네이버로 시작하기',
      onPress: onNaver,
      backgroundColor: '#03A94D',
      color: '#FFFFFF',
      labelStyle: styles.naverLabel,
      icon: <Text style={styles.naverIcon}>N</Text>,
    },
    ...(onApple
      ? [
          {
            label: 'apple로 시작하기',
            onPress: onApple,
            backgroundColor: '#000000',
            color: '#FFFFFF',
            labelStyle: undefined,
            icon: <AppleLogo />,
          },
        ]
      : []),
  ];
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
      <View style={styles.buttonArea}>
        <View style={styles.buttons}>
          {providers.map(({ label, onPress, backgroundColor, color, labelStyle, icon }) => (
            <View key={label} style={{ backgroundColor }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={label}
                onPress={onPress}
                style={styles.button}
              >
                <View
                  accessible={false}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                  style={styles.icon}
                >
                  {icon}
                </View>
                <Text style={[styles.label, { color }, labelStyle]}>{label}</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </View>
      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          className="w-full text-center text-[12px] leading-[19px] tracking-[0.12px] text-[#6A7282]"
          style={{ fontFamily: 'Pretendard', includeFontPadding: false }}
        >
          가입하면 이용약관 · 개인정보 처리방침에 동의하게 돼요
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonArea: {
    minHeight: 148,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footer: { minHeight: 130, paddingTop: 12, paddingHorizontal: 16 },
  buttons: { width: '100%', maxWidth: 335, gap: 8 },
  button: {
    width: '100%',
    minHeight: 44,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  icon: {
    width: 20,
    height: 20,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  naverIcon: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', includeFontPadding: false },
  naverLabel: { width: 114, transform: [{ translateY: -1.4 }] },
  label: {
    flexShrink: 1,
    fontFamily: 'Pretendard',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.16,
    textAlign: 'center',
    includeFontPadding: false,
  },
});
