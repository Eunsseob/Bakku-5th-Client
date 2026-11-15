import { CaretLeftIcon } from 'phosphor-react-native/src/icons/CaretLeft';
import { Button, Chip, IconButton } from '@/shared/components';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
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
      <View
        className="items-center justify-center"
        style={{ height: Math.max(34, 78 - insets.top) }}
      >
        <Text
          style={font}
          className="text-center text-[16px] leading-[22px] tracking-[-0.16px] text-[#030712]"
        >
          프로필 설정
        </Text>
        <IconButton
          icon={CaretLeftIcon}
          size="xl"
          accessibilityLabel="이전 단계"
          onPress={() => {
            Keyboard.dismiss();
            if (onBack) onBack();
            else router.back();
          }}
          className="absolute left-4 h-11 w-6 items-center justify-center self-center"
        />
      </View>
      <ScrollView
        className="flex-1"
        style={{ minHeight: 0 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 40, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full">
          <Text style={font} className="text-[24px] leading-8 tracking-[-0.48px] text-[#364153]">
            {'바꾸에서 사용할\n프로필을 등록해주세요'}
          </Text>
          <View className="mt-4">
            <Text style={font} className="text-[14px] leading-5 tracking-[-0.14px] text-[#030712]">
              닉네임
            </Text>
            <TextInput
              accessibilityLabel="닉네임"
              placeholder="사용하실 닉네임을 입력하세요"
              placeholderTextColor="#99A1AF"
              value={profile.nickname}
              maxLength={10}
              onChangeText={(nickname) => setProfile({ ...profile, nickname })}
              onBlur={() => setTouched((value) => ({ ...value, nickname: true }))}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              style={{ ...font, lineHeight: 26, paddingVertical: 0 }}
              className="mt-3 h-[52px] rounded-lg border border-[#D1D5DC] px-3.5 text-[16px] text-[#364153]"
            />
            {touched.nickname && nicknameError && (
              <Text
                accessibilityLiveRegion="polite"
                style={font}
                className={`mt-[6px] text-[11px] leading-[15px] ${touched.nickname && nicknameError ? 'text-red-600' : 'text-[#737380]'}`}
              >
                {nicknameError}
              </Text>
            )}
          </View>
          <View className="mt-8">
            <Text style={font} className="text-[14px] leading-5 tracking-[-0.14px] text-[#030712]">
              생년월일
            </Text>
            <TextInput
              accessibilityLabel="생년월일"
              placeholder="YYYY. MM. DD"
              placeholderTextColor="#99A1AF"
              value={profile.birthDate}
              maxLength={14}
              keyboardType="number-pad"
              onChangeText={(value) =>
                setProfile({ ...profile, birthDate: formatBirthDate(value) })
              }
              onBlur={() => setTouched((value) => ({ ...value, birthDate: true }))}
              returnKeyType="done"
              style={{ ...font, lineHeight: 26, paddingVertical: 0 }}
              className="mt-3 h-[52px] rounded-lg border border-[#D1D5DC] px-3.5 text-[16px] text-[#364153]"
            />
            {(touched.birthDate || profile.birthDate.replace(/\D/g, '').length === 8) &&
              birthDateError && (
                <Text
                  accessibilityLiveRegion="polite"
                  style={font}
                  className={`mt-[6px] text-[11px] leading-[15px] ${(touched.birthDate || profile.birthDate.replace(/\D/g, '').length === 8) && birthDateError ? 'text-red-600' : 'text-[#737380]'}`}
                >
                  {birthDateError}
                </Text>
              )}
          </View>
          <View className="mt-8">
            <Text style={font} className="text-[14px] leading-5 tracking-[-0.14px] text-[#030712]">
              성별
            </Text>
            <View className="mt-3 flex-row gap-2">
              {GENDER_OPTIONS.map((option) => {
                const selected = profile.gender === option.value;
                return (
                  <Chip
                    key={option.value ?? 'none'}
                    hierarchy={selected ? 'primary' : 'secondary'}
                    variant={selected ? 'solid' : 'outlined'}
                    size="md"
                    className="justify-center"
                    style={{
                      width: option.value === null ? undefined : 53,
                      height: 38,
                      paddingHorizontal: option.value === null ? 14 : 0,
                      borderColor: selected ? '#364153' : '#D1D5DC',
                      backgroundColor: selected ? '#364153' : '#FFFFFF',
                    }}
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
          </View>
        </View>
      </ScrollView>
      <View className="shrink-0 px-4 pb-2">
        <Button
          hierarchy="primary"
          accessibilityRole="button"
          accessibilityState={{ disabled: !canContinue }}
          disabled={!canContinue}
          onPress={() => {
            if (!canContinue) return;
            Keyboard.dismiss();
            setProfile({ ...profile, nickname: profile.nickname.trim() });
            router.push('/(auth)/wishlist');
          }}
          className={`w-full self-center !rounded-xl ${canContinue ? '!bg-[#364153]' : '!bg-[#D1D5DC]'}`}
        >
          다음
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
