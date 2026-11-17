import { Button } from '@/shared/components/Button';
import { Icon } from '@/shared/components/Icon';
import { CheckIcon } from 'phosphor-react-native/src/icons/Check';
import { Stack } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSignupStore } from '@/features/auth/store/useSignupStore';
import { enterMainAfterAuth } from '@/features/auth/utils/enterMainAfterAuth';

const font = { fontFamily: 'Pretendard', includeFontPadding: false };

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const { profile, keywords, notificationsEnabled } = useSignupStore();

  return (
    <View
      className="flex-1 bg-white"
      style={{
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <ScrollView
        className="flex-1"
        style={{ minHeight: 0 }}
        contentContainerStyle={{
          alignItems: 'center',
          paddingTop: Math.max(24, 174 - insets.top),
          paddingBottom: 24,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          className="h-[114px] w-[114px] items-center justify-center rounded-[40px] bg-[#F3F4F6]"
        >
          <Icon icon={CheckIcon} size="5xl" color="#364153" />
        </View>
        <Text
          accessibilityRole="header"
          style={font}
          className="mt-8 w-full text-center text-[24px] leading-8 tracking-[-0.48px] text-[#364153]"
        >
          가입이 완료되었어요
        </Text>
        <Text
          style={font}
          className="mt-2 w-full text-center text-[16px] leading-[26px] text-[#6A7282]"
        >
          {`${profile.nickname.trim() || '회원'}님, 환영해요!\n이제 원하는 굿즈를 교환하러 가볼까요?`}
        </Text>
        <View className="mt-8 min-h-[70px] w-full justify-center rounded-xl bg-[#F3F4F6] px-4 py-3">
          <Text
            style={font}
            className="text-[16px] leading-[22px] tracking-[-0.16px] text-[#364153]"
          >
            키워드 {keywords.length}개 등록됨
          </Text>
          <Text style={font} className="mt-1 text-[14px] leading-[22px] text-[#6A7282]">
            {notificationsEnabled
              ? '새 교환글이 올라오면 알려드릴게요'
              : '키워드와 알림은 나중에 변경할 수 있어요'}
          </Text>
        </View>
      </ScrollView>
      <View
        className="shrink-0 gap-2 px-4 pt-2"
        style={{ paddingBottom: Math.max(34, insets.bottom + 8) }}
      >
        <Button
          hierarchy="primary"
          accessibilityRole="button"
          onPress={() => enterMainAfterAuth()}
          className="w-full self-center !rounded-xl !bg-[#364153]"
        >
          교환글 보러 가기
        </Button>
        <Button
          hierarchy="secondary"
          variant="outlined"
          accessibilityRole="button"
          onPress={() => enterMainAfterAuth('write')}
          className="w-full self-center !rounded-xl !border-[#D1D5DC]"
        >
          내 교환글 올리기
        </Button>
      </View>
    </View>
  );
}
