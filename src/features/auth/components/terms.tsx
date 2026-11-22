import { Button, IconButton } from '@/shared/components';
import { useQuery } from '@tanstack/react-query';
import { CaretLeftIcon } from 'phosphor-react-native/src/icons/CaretLeft';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';
import { router, Stack, useFocusEffect } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { useCallback, useState } from 'react';
import { Alert, BackHandler, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getTerms } from '@/features/auth/api/terms';
import { useSignupStore } from '@/features/auth/store/useSignupStore';
import Profile from './profile';

const font = { fontFamily: 'Pretendard', includeFontPadding: false };

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <View
      className="h-5 w-5 items-center justify-center rounded border"
      style={{
        backgroundColor: checked ? '#9C43FF' : '#FFFFFF',
        borderColor: checked ? '#9C43FF' : '#D1D5DC',
      }}
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
  const { agreedTermIds, toggleTerm, setAgreedTermIds, setAgreements } = useSignupStore();
  const termsQuery = useQuery({
    queryKey: ['terms'],
    queryFn: ({ signal }) => getTerms(signal),
  });
  const terms = (termsQuery.data ?? [])
    .filter((term) => term.signupConsent === 'REQUIRED' || term.signupConsent === 'OPTIONAL')
    .map((term) => ({
      ...term,
      id: `${term.termsType}:${term.version}`,
      required: term.signupConsent === 'REQUIRED',
    }));
  const allChecked = terms.length > 0 && terms.every((term) => agreedTermIds.includes(term.id));
  const canContinue =
    terms.length > 0 &&
    !termsQuery.isFetching &&
    !termsQuery.isError &&
    terms.every((term) => !term.required || agreedTermIds.includes(term.id));

  const openTerm = async (url: string | null) => {
    try {
      if (!url || !/^https?:\/\//i.test(url) || /[{}]/.test(url))
        throw new Error('Invalid terms URL');
      await openBrowserAsync(url);
    } catch {
      Alert.alert('약관 본문을 열 수 없어요', '잠시 후 다시 시도해 주세요.');
    }
  };

  const continueToProfile = () => {
    if (!canContinue) return;
    setAgreements(
      terms.map(({ termsType, version, id }) => ({
        termsType,
        version,
        agreed: agreedTermIds.includes(id),
      })),
    );
    setStep('profile');
  };

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
      <View
        className="items-center justify-center"
        style={{ height: Math.max(34, 78 - insets.top) }}
      >
        <Text
          style={font}
          className="text-center text-[16px] leading-[22px] tracking-[-0.16px] text-[#030712]"
        >
          이용 약관
        </Text>
        <IconButton
          icon={CaretLeftIcon}
          accessibilityLabel="뒤로가기"
          onPress={() => router.back()}
          className="absolute left-4 h-11 w-6 self-center"
        />
      </View>
      <ScrollView
        className="flex-1"
        style={{ minHeight: 0 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 16,
          paddingTop: 40,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={font}
          className="w-full text-[24px] leading-8 tracking-[-0.48px] text-[#364153]"
        >
          {'서비스 이용을 위해\n약관에 동의해 주세요.'}
        </Text>
        <View className="min-h-8 flex-1" />
        {termsQuery.isPending ? (
          <Text style={font} accessibilityLiveRegion="polite">
            약관을 불러오는 중이에요.
          </Text>
        ) : termsQuery.isError || terms.length === 0 ? (
          <View className="gap-2">
            <Text style={font}>약관 목록을 불러오지 못했어요.</Text>
            <Button onPress={() => void termsQuery.refetch()}>다시 시도</Button>
          </View>
        ) : (
          <View className="w-full">
            <Pressable
              accessibilityRole="checkbox"
              accessibilityLabel="전체 동의"
              accessibilityState={{ checked: allChecked }}
              onPress={() => setAgreedTermIds(allChecked ? [] : terms.map((term) => term.id))}
              className="h-[52px] flex-row items-center gap-3 rounded-xl bg-[#F3F4F6] px-3"
            >
              <Checkbox checked={allChecked} />
              <Text style={font} className="flex-1 text-[16px] leading-[26px] text-[#364153]">
                약관 전체동의
              </Text>
            </Pressable>
            <View className="mt-3 px-3">
              {terms.map((term) => (
                <View key={term.id}>
                  <View className="flex-row items-center">
                    <Pressable
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: agreedTermIds.includes(term.id) }}
                      onPress={() => toggleTerm(term.id)}
                      className="min-h-11 flex-1 flex-row items-center gap-3 py-2"
                    >
                      <Checkbox checked={agreedTermIds.includes(term.id)} />
                      <Text
                        style={font}
                        className="flex-1 text-[16px] leading-[26px] text-[#364153]"
                      >
                        <Text style={{ color: term.required ? '#9C43FF' : '#99A1AF' }}>
                          ({term.required ? '필수' : '선택'})
                        </Text>
                        {` ${term.title.replace(/\s*\((필수|선택)\)\s*$/, '')}`}
                      </Text>
                    </Pressable>
                    {term.url && (
                      <IconButton
                        icon={CaretRightIcon}
                        size="lg"
                        hierarchy="tertiary"
                        accessibilityLabel={`${term.title} 내용 보기`}
                        onPress={() => void openTerm(term.url)}
                        className="h-11 w-5 items-center justify-center self-center"
                      />
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
      <View className="shrink-0 px-4 pb-2">
        <Button
          hierarchy="primary"
          accessibilityRole="button"
          accessibilityState={{ disabled: !canContinue }}
          disabled={!canContinue}
          onPress={continueToProfile}
          className={`w-full self-center !rounded-xl ${canContinue ? '!bg-[#364153]' : '!bg-[#D1D5DC]'}`}
        >
          계속하기
        </Button>
      </View>
    </View>
  );
}
