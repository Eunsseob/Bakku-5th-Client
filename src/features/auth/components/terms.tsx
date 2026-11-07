import { Button } from '@/shared/components/Button';
import { router, Stack, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, BackHandler, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SIGNUP_TERMS } from '@/constants/auth';
import { useSignupStore } from '@/features/auth/store/useSignupStore';
import Profile from './profile';

const font = { fontFamily: 'Pretendard', includeFontPadding: false };

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <View
      className={`h-[22px] w-[22px] items-center justify-center rounded-[6px] border-2 ${checked ? 'border-[#2E2E33] bg-[#2E2E33]' : 'border-[#BFBFC7] bg-white'}`}
    >
      {checked && (
        <Text style={font} className="text-[14px] leading-[18px] text-white">
          ✓
        </Text>
      )}
    </View>
  );
}

export default function Terms() {
  const [step, setStep] = useState<'terms' | 'profile'>('terms');
  useFocusEffect(
    useCallback(() => {
      if (step !== 'profile') return;
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        setStep('terms');
        return true;
      });
      return () => subscription.remove();
    }, [step]),
  );
  const insets = useSafeAreaInsets();
  const { agreedTermIds, toggleTerm, setAgreedTermIds } = useSignupStore();
  const allChecked = SIGNUP_TERMS.every((term) => agreedTermIds.includes(term.id));
  const canContinue = SIGNUP_TERMS.every(
    (term) => !term.required || agreedTermIds.includes(term.id),
  );

  if (step === 'profile') return <Profile onBack={() => setStep('terms')} />;

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
      <Stack.Screen options={{ headerShown: false }} />
      <View className="justify-end pb-5" style={{ height: Math.max(64, 97 - insets.top) }}>
        <Text style={font} className="text-center text-[16px] leading-[22px] text-[#2E2E33]">
          약관 동의
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로가기"
          onPress={() => router.back()}
          className="absolute bottom-[9px] left-[21px] h-11 w-11 items-center justify-center"
        >
          <Text style={font} className="text-[26px] text-[#2E2E33]">
            ‹
          </Text>
        </Pressable>
      </View>
      <View className="h-px bg-[#E0E0E6]" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 21, paddingTop: 29, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-[312px] self-center">
          <Text style={font} className="text-[20px] leading-[28px] text-[#2E2E33]">
            {'서비스 이용을 위해\n약관에 동의해 주세요'}
          </Text>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityLabel="전체 동의"
            accessibilityState={{ checked: allChecked }}
            onPress={() => setAgreedTermIds(allChecked ? [] : SIGNUP_TERMS.map((term) => term.id))}
            className="mt-10 h-14 flex-row items-center gap-3 rounded-[10px] bg-[#F5F5F7] px-4"
          >
            <Checkbox checked={allChecked} />
            <Text style={font} className="flex-1 text-[14px] leading-5 text-[#2E2E33]">
              전체 동의
            </Text>
          </Pressable>
          <View className="mt-[18px] px-4">
            {SIGNUP_TERMS.map((term) => (
              <View key={term.id}>
                <View className="flex-row items-center">
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: agreedTermIds.includes(term.id) }}
                    onPress={() => toggleTerm(term.id)}
                    className="min-h-11 flex-1 flex-row items-center gap-3 py-2"
                  >
                    <Checkbox checked={agreedTermIds.includes(term.id)} />
                    <Text style={font} className="flex-1 text-[14px] leading-5 text-[#2E2E33]">
                      ({term.required ? '필수' : '선택'}) {term.title}
                    </Text>
                  </Pressable>
                  {(term.id === 'service' || term.id === 'privacy') && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${term.title} 내용 보기`}
                      onPress={() =>
                        Alert.alert(
                          term.title,
                          '화면 확인용 더미 약관입니다. 실제 약관 내용은 준비 중입니다.',
                        )
                      }
                      className="min-h-11 min-w-11 items-end justify-center pl-2"
                    >
                      <Text style={font} className="text-[12px] leading-[17px] text-[#737380]">
                        보기 ›
                      </Text>
                    </Pressable>
                  )}
                </View>
                {term.id === 'privacy' && (
                  <View className="ml-[34px]">
                    <Text style={font} className="text-[11px] leading-[15px] text-[#737380]">
                      닉네임 · 생년월일 · 성별 / 목적 · 보관 기간
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <View className="px-[21px] pt-3" style={{ paddingBottom: Math.max(16, 35 - insets.bottom) }}>
        <Button
          variant="primary"
          accessibilityRole="button"
          accessibilityState={{ disabled: !canContinue }}
          disabled={!canContinue}
          onPress={() => setStep('profile')}
          className="w-full max-w-[312px] self-center"
        >
          동의하고 계속하기
        </Button>
      </View>
    </View>
  );
}
