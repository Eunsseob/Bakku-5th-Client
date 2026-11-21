import { ChatCircleIcon } from 'phosphor-react-native/src/icons/ChatCircle';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type LoginLayoutProps = {
  onKakao: () => void;
  onNaver: () => void;
};

export default function LoginLayout({ onKakao, onNaver }: LoginLayoutProps) {
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
