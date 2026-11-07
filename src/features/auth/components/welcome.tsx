import { Button } from '@/shared/components/Button';
import { router, Stack } from 'expo-router';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSignupStore } from '@/features/auth/store/useSignupStore';

const font = { fontFamily: 'Pretendard', includeFontPadding: false };

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const { profile, keywords, notificationsEnabled } = useSignupStore();

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
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          alignItems: 'center',
          paddingTop: Math.max(24, 198 - insets.top),
          paddingBottom: 24,
          paddingHorizontal: 18,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          className="h-[88px] w-[88px] items-center justify-center rounded-full bg-[#E0E0E6]"
        >
          <Text style={font} className="text-center text-[32px] leading-[38px] text-[#2E2E33]">
            ✓
          </Text>
        </View>
        <Text
          accessibilityRole="header"
          style={font}
          className="mt-[30px] w-full text-center text-[22px] leading-[26px] text-[#2E2E33]"
        >
          가입이 완료되었어요
        </Text>
        <Text
          style={font}
          className="mt-[14px] w-full max-w-[280px] text-center text-[14px] leading-[17px] text-[#737380]"
        >
          {`${profile.nickname.trim() || '회원'}님, 환영해요!\n이제 원하는 굿즈를 교환하러 가볼까요?`}
        </Text>
        <View className="mt-11 min-h-16 w-full max-w-[280px] justify-center rounded-[12px] bg-[#F5F5F7] px-4 py-3">
          <Text style={font} className="text-[13px] leading-4 text-[#2E2E33]">
            🔔 키워드 {keywords.length}개 등록됨
          </Text>
          <Text style={font} className="mt-[6px] text-[12px] leading-[14px] text-[#737380]">
            {notificationsEnabled
              ? '새 교환글이 올라오면 알려드릴게요'
              : '키워드와 알림은 나중에 변경할 수 있어요'}
          </Text>
        </View>
      </ScrollView>
      <View
        className="gap-[10px] px-[18px] pt-3"
        style={{ paddingBottom: Math.max(16, 34 - insets.bottom) }}
      >
        <Button
          variant="primary"
          accessibilityRole="button"
          onPress={() => router.replace('../home')}
          className="w-full max-w-[320px] self-center"
        >
          교환글 보러 가기
        </Button>
        <Button
          variant="secondary"
          accessibilityRole="button"
          onPress={() => Alert.alert('내 교환글 올리기', '교환글 작성 화면은 준비 중이에요.')}
          className="w-full max-w-[320px] self-center"
        >
          내 교환글 올리기
        </Button>
      </View>
    </View>
  );
}
