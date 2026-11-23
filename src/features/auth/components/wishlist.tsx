import { IconButton } from '@/shared/components';
import { router, Stack } from 'expo-router';
import { CaretLeftIcon } from 'phosphor-react-native/src/icons/CaretLeft';
import { useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthStore } from '@/shared/api/useAuthStore';
import { completeSignup } from '../api/signup';
import { useSignupStore } from '@/features/auth/store/useSignupStore';

const font = { fontFamily: 'Pretendard', includeFontPadding: false };

export default function Wishlist() {
  const insets = useSafeAreaInsets();
  const submitting = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const finish = async () => {
    if (submitting.current) return;
    const signup = useSignupStore.getState();
    const { signupSession, agreements, profile } = signup;
    if (!signupSession) {
      Alert.alert('가입 정보를 찾을 수 없어요', '소셜 로그인을 다시 진행해 주세요.');
      return;
    }
    if (agreements.length === 0) {
      Alert.alert('약관 동의가 필요해요', '이전 단계로 돌아가 약관에 동의해 주세요.');
      return;
    }

    submitting.current = true;
    setIsSubmitting(true);
    Keyboard.dismiss();
    try {
      const result = await completeSignup({
        ...signupSession,
        agreements,
        nickname: profile.nickname.trim(),
        birthDate: profile.birthDate.split(/\s*\.\s*/).join('-'),
        gender: profile.gender === 'female' ? 'FEMALE' : profile.gender === 'male' ? 'MALE' : null,
      });
      useAuthStore.getState().setTokens(result);
      signup.setSignupSession(null);
      router.replace('/(auth)/welcome');
    } catch (error) {
      Alert.alert('가입 완료 실패', error instanceof Error ? error.message : '다시 시도해 주세요.');
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View className="justify-end pb-[22px]" style={{ height: Math.max(64, 97 - insets.top) }}>
        <IconButton
          icon={CaretLeftIcon}
          size="xl"
          accessibilityLabel="이전 단계"
          disabled={isSubmitting}
          onPress={() => router.back()}
          className="absolute bottom-[9px] left-[21px] h-11 w-11 items-center justify-center"
        />
      </View>
      <View className="h-px bg-[#E0E0E6]" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 29, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          accessibilityLabel="위시리스트 · 알림 설정"
          className="w-full max-w-[312px] self-center"
        >
          <Text style={font} className="text-[20px] leading-[28px] text-[#2E2E33]">
            권한요청 페이지 들어갈 예정
          </Text>
        </View>
      </ScrollView>
      <View className="px-[21px] pt-3" style={{ paddingBottom: Math.max(16, 49 - insets.bottom) }}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ busy: isSubmitting, disabled: isSubmitting }}
          disabled={isSubmitting}
          onPress={finish}
          className="mt-2 min-h-11 items-center justify-center"
        >
          <Text style={font} className="text-[13px] leading-[18px] text-[#737380]">
            {isSubmitting ? '가입 완료 중…' : '권한 확인'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
