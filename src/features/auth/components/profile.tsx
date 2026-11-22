import { CaretLeftIcon } from 'phosphor-react-native/src/icons/CaretLeft';
import { Button, IconButton } from '@/shared/components';
import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
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
import {
  checkNicknameAvailability,
  nicknameCheckError,
  nicknameUnavailableMessage,
} from '@/features/auth/api/nicknameAvailability';
import { useSignupStore } from '@/features/auth/store/useSignupStore';
import {
  formatBirthDate,
  validateBirthDate,
  validateNickname,
} from '@/features/auth/utils/profileValidation';

const font = { fontFamily: 'Pretendard', includeFontPadding: false };
const inputStyle = { ...font, lineHeight: 26, paddingVertical: 0, borderWidth: 2 };

function inputColors(focused: boolean, invalid: boolean) {
  if (focused) return { borderColor: '#000419AA', backgroundColor: '#FFFFFF' };
  if (invalid) return { borderColor: '#EC0042', backgroundColor: '#FFF1EF' };
  return { borderColor: '#D1D5DC', backgroundColor: '#FFFFFF' };
}

type ProfileProps = { onBack?: () => void };
type NicknameCheck = { nickname: string } & (
  { status: 'available' } | { status: 'unavailable' | 'failed'; message: string }
);

export default function Profile({ onBack }: ProfileProps) {
  const insets = useSafeAreaInsets();
  const headerHeight = Math.max(34, 78 - insets.top);
  const { profile, setProfile } = useSignupStore();
  const [touched, setTouched] = useState({ nickname: false, birthDate: false });
  const [focused, setFocused] = useState<'nickname' | 'birthDate' | null>(null);
  const [nicknameCheck, setNicknameCheck] = useState<NicknameCheck | null>(null);
  const [nicknameRetry, setNicknameRetry] = useState(0);
  const nickname = profile.nickname.trim();
  const nicknameFormatError = validateNickname(nickname);
  const currentCheck = nicknameCheck?.nickname === nickname ? nicknameCheck : null;
  const nicknameError =
    nicknameFormatError ?? (currentCheck?.status === 'unavailable' ? currentCheck.message : null);
  const birthDateError = validateBirthDate(profile.birthDate);
  const canContinue = !nicknameError && !birthDateError && currentCheck?.status === 'available';
  const showNicknameError =
    focused !== 'nickname' &&
    !!nicknameError &&
    (touched.nickname || currentCheck?.status === 'unavailable');
  const showBirthDateError = focused !== 'birthDate' && touched.birthDate && !!birthDateError;

  useEffect(() => {
    if (nicknameFormatError) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const result = await checkNicknameAvailability(nickname, controller.signal);
        if (controller.signal.aborted) return;
        setNicknameCheck(
          result.available
            ? { nickname, status: 'available' }
            : {
                nickname,
                status: 'unavailable',
                message: nicknameUnavailableMessage(result.reason),
              },
        );
      } catch (error) {
        if (!controller.signal.aborted) {
          setNicknameCheck({ nickname, status: 'failed', message: nicknameCheckError(error) });
        }
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [nickname, nicknameFormatError, nicknameRetry]);

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
      <View className="items-center justify-center" style={{ height: headerHeight }}>
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
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: Math.max(0, 132 - insets.top - headerHeight),
          paddingBottom: 24,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full">
          <Text
            style={font}
            className="text-[28px] leading-[36px] tracking-[-0.56px] text-[#2E303D]"
          >
            어떻게 불러드릴까요?
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
              onChangeText={(value) => {
                if (value.trim() !== nickname) setNicknameCheck(null);
                setProfile({ ...profile, nickname: value });
              }}
              onFocus={() => setFocused('nickname')}
              onBlur={() => {
                setFocused((field) => (field === 'nickname' ? null : field));
                setTouched((value) => ({ ...value, nickname: true }));
              }}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              style={[inputStyle, inputColors(focused === 'nickname', showNicknameError)]}
              className="mt-3 h-[50px] rounded-lg px-3.5 text-[16px] text-[#364153]"
            />
            {showNicknameError && (
              <Text
                accessibilityLiveRegion="polite"
                style={font}
                className="mt-[6px] text-[11px] leading-[15px] text-[#EC0042]"
              >
                {nicknameError}
              </Text>
            )}
            {currentCheck?.status === 'failed' && (
              <Text
                accessibilityRole="button"
                accessibilityLiveRegion="polite"
                onPress={() => {
                  setNicknameCheck(null);
                  setNicknameRetry((attempt) => attempt + 1);
                }}
                style={font}
                className="mt-[6px] text-[12px] leading-5 text-[#EC0042]"
              >
                {currentCheck.message} 다시 확인
              </Text>
            )}
            {!nicknameFormatError && !currentCheck && (
              <Text style={font} className="mt-[6px] text-[12px] leading-5 text-[#737380]">
                닉네임 확인 중…
              </Text>
            )}
            {currentCheck?.status === 'available' && (
              <Text
                accessibilityLiveRegion="polite"
                style={font}
                className="mt-[6px] text-[12px] leading-5 text-[#08763C]"
              >
                사용할 수 있는 닉네임이에요
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
              onFocus={() => setFocused('birthDate')}
              onBlur={() => {
                setFocused((field) => (field === 'birthDate' ? null : field));
                setTouched((value) => ({ ...value, birthDate: true }));
              }}
              returnKeyType="done"
              style={[inputStyle, inputColors(focused === 'birthDate', showBirthDateError)]}
              className="mt-3 h-[50px] rounded-lg px-3.5 text-[16px] text-[#364153]"
            />
            {showBirthDateError && (
              <Text
                accessibilityLiveRegion="polite"
                style={font}
                className="mt-[6px] text-[11px] leading-[15px] text-[#EC0042]"
              >
                {birthDateError}
              </Text>
            )}
          </View>
          <View className="mt-8">
            <Text style={font} className="text-[14px] leading-5 tracking-[-0.14px] text-[#1A1B27]">
              성별 <Text style={{ color: '#000A3161' }}>(선택)</Text>
            </Text>
            <View className="mt-3 flex-row flex-wrap gap-2" accessibilityRole="radiogroup">
              {GENDER_OPTIONS.map((option) => {
                const selected = profile.gender === option.value;
                return (
                  <Pressable
                    key={option.value ?? 'none'}
                    style={{
                      minWidth: 53,
                      minHeight: 36,
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      borderWidth: 1,
                      borderRadius: 8,
                      borderColor: selected ? '#364153' : '#000D4B25',
                      backgroundColor: selected ? '#364153' : '#FFFFFF',
                    }}
                    accessibilityRole="radio"
                    accessibilityLabel={option.label}
                    accessibilityState={{ checked: selected }}
                    onPress={() =>
                      setProfile({ ...profile, gender: selected ? undefined : option.value })
                    }
                    hitSlop={{ top: 5, bottom: 5 }}
                  >
                    <Text
                      style={{ ...font, color: selected ? '#FFFFFF' : '#464855' }}
                      className="text-center text-[14px] leading-5 tracking-[-0.14px]"
                    >
                      {option.label}
                    </Text>
                  </Pressable>
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
