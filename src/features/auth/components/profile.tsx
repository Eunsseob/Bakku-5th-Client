import { Button, Chip } from '@/shared/components';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GENDER_OPTIONS } from '@/constants/auth';
import { useSignupStore } from '@/features/auth/store/useSignupStore';
import {
  formatBirthDate,
  validateBirthDate,
  validateNickname,
} from '@/features/auth/utils/profileValidation';

const font = { fontFamily: 'Pretendard', includeFontPadding: false };
type ProfileProps = { onBack?: () => void };

export default function Profile({ onBack }: ProfileProps) {
  const insets = useSafeAreaInsets();
  const { profile, setProfile } = useSignupStore();
  const [touched, setTouched] = useState({ nickname: false, birthDate: false });
  const nicknameError = validateNickname(profile.nickname);
  const birthDateError = validateBirthDate(profile.birthDate);
  const canContinue = !nicknameError && !birthDateError;

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
      <View className="justify-end pb-5" style={{ height: Math.max(64, 97 - insets.top) }}>
        <Text style={font} className="text-center text-[16px] leading-[22px] text-[#2E2E33]">
          프로필 설정
        </Text>
        <Text
          style={font}
          className="absolute bottom-[22px] right-[33px] text-[12px] leading-[17px] text-[#737380]"
        >
          1 / 2
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="이전 단계"
          onPress={() => {
            Keyboard.dismiss();
            if (onBack) onBack();
            else router.back();
          }}
          className="absolute bottom-[9px] left-[21px] h-11 w-11 items-center justify-center"
        >
          <Text style={font} className="text-[26px] text-[#2E2E33]">
            ‹
          </Text>
        </Pressable>
      </View>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 21, paddingTop: 30, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-[312px] self-center">
          <Text style={font} className="text-[20px] leading-[28px] text-[#2E2E33]">
            어떻게 불러드릴까요?
          </Text>
          <View className="mt-8">
            <Text style={font} className="text-[13px] leading-[18px] text-[#2E2E33]">
              닉네임
            </Text>
            <TextInput
              accessibilityLabel="닉네임"
              placeholder="닉네임 (2~10자)"
              placeholderTextColor="#737380"
              value={profile.nickname}
              maxLength={10}
              onChangeText={(nickname) => setProfile({ ...profile, nickname })}
              onBlur={() => setTouched((value) => ({ ...value, nickname: true }))}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              style={{ ...font, lineHeight: 20, paddingVertical: 0 }}
              className="mt-[6px] h-12 rounded-[8px] border-2 border-[#BFBFC7] px-3 text-[14px] text-[#2E2E33]"
            />
            <Text
              accessibilityLiveRegion="polite"
              style={font}
              className={`mt-[6px] text-[11px] leading-[15px] ${touched.nickname && nicknameError ? 'text-red-600' : 'text-[#737380]'}`}
            >
              {touched.nickname && nicknameError ? nicknameError : '다른 사용자에게 보여요'}
            </Text>
          </View>
          <View className="mt-[27px]">
            <Text style={font} className="text-[13px] leading-[18px] text-[#2E2E33]">
              생년월일
            </Text>
            <TextInput
              accessibilityLabel="생년월일"
              placeholder="YYYY . MM . DD"
              placeholderTextColor="#737380"
              value={profile.birthDate}
              maxLength={14}
              keyboardType="number-pad"
              onChangeText={(value) =>
                setProfile({ ...profile, birthDate: formatBirthDate(value) })
              }
              onBlur={() => setTouched((value) => ({ ...value, birthDate: true }))}
              returnKeyType="done"
              style={{ ...font, lineHeight: 20, paddingVertical: 0 }}
              className="mt-[6px] h-12 rounded-[8px] border-2 border-[#BFBFC7] px-3 text-[14px] text-[#2E2E33]"
            />
            <Text
              accessibilityLiveRegion="polite"
              style={font}
              className={`mt-[6px] text-[11px] leading-[15px] ${(touched.birthDate || profile.birthDate.replace(/\D/g, '').length === 8) && birthDateError ? 'text-red-600' : 'text-[#737380]'}`}
            >
              {(touched.birthDate || profile.birthDate.replace(/\D/g, '').length === 8) &&
              birthDateError
                ? birthDateError
                : '만 14세 이상만 가입할 수 있어요 · 공개되지 않아요'}
            </Text>
          </View>
          <View className="mt-[27px]">
            <Text style={font} className="text-[13px] leading-[18px] text-[#2E2E33]">
              성별
            </Text>
            <View className="mt-2 flex-row gap-2">
              {GENDER_OPTIONS.map((option) => {
                const selected = profile.gender === option.value;
                return (
                  <Chip
                    key={option.value ?? 'none'}
                    variant={selected ? 'filled' : 'outlined'}
                    size="md"
                    className="justify-center"
                    style={{
                      width: option.value === null ? 112 : 56,
                      height: 34,
                      paddingHorizontal: 0,
                    }}
                    selected={selected}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    onPress={() =>
                      setProfile({ ...profile, gender: selected ? undefined : option.value })
                    }
                    hitSlop={{ top: 5, bottom: 5 }}
                  >
                    {option.label}
                  </Chip>
                );
              })}
            </View>
            <Text style={font} className="mt-[10px] text-[11px] leading-[15px] text-[#737380]">
              공개되지 않아요
            </Text>
          </View>
        </View>
      </ScrollView>
      <View className="px-[21px] pt-3" style={{ paddingBottom: Math.max(16, 35 - insets.bottom) }}>
        <Button
          variant="primary"
          accessibilityRole="button"
          accessibilityState={{ disabled: !canContinue }}
          disabled={!canContinue}
          onPress={() => {
            if (!canContinue) return;
            Keyboard.dismiss();
            setProfile({ ...profile, nickname: profile.nickname.trim() });
            router.push('/(auth)/wishlist');
          }}
          className="w-full max-w-[312px] self-center"
        >
          다음
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
