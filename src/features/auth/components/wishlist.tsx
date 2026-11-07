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

import { useSignupStore } from '@/features/auth/store/useSignupStore';
import NotificationPermissionDialog from './NotificationPermissionDialog';

const font = { fontFamily: 'Pretendard', includeFontPadding: false };

export default function Wishlist() {
  const insets = useSafeAreaInsets();
  const { keywords, addKeyword, removeKeyword, setNotificationsEnabled } = useSignupStore();
  const [input, setInput] = useState('');
  const [permissionVisible, setPermissionVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const add = () => {
    const message = addKeyword(input);
    setError(message);
    if (!message) setInput('');
  };
  const finish = (enabled: boolean) => {
    setPermissionVisible(false);
    Keyboard.dismiss();
    setNotificationsEnabled(enabled);
    router.replace('/(auth)/welcome');
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
        <Text style={font} className="text-center text-[12px] leading-[17px] text-[#737380]">
          2 / 2
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="이전 단계"
          onPress={() => router.back()}
          className="absolute bottom-[9px] left-[21px] h-11 w-11 items-center justify-center"
        >
          <Text style={font} className="text-[26px] text-[#2E2E33]">
            ‹
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => finish(false)}
          className="absolute bottom-[9px] right-[17px] min-h-11 justify-center px-2"
        >
          <Text style={font} className="text-[13px] leading-[18px] text-[#737380]">
            나중에 하기
          </Text>
        </Pressable>
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
            갖고 싶은 굿즈가 있나요?
          </Text>
          <Text style={font} className="mt-2 text-[14px] leading-5 text-[#737380]">
            {'키워드를 등록하면 맞는 교환글이 올라올 때\n바로 알려드려요'}
          </Text>
          <View className="mt-[30px] flex-row items-center gap-2">
            <TextInput
              accessibilityLabel="관심 굿즈 키워드"
              value={input}
              onChangeText={(value) => {
                setInput(value);
                setError(null);
              }}
              placeholder="예) 하치와레 키링"
              placeholderTextColor="#737380"
              returnKeyType="done"
              onSubmitEditing={add}
              style={{ ...font, paddingVertical: 0, lineHeight: 20 }}
              className="h-12 min-w-0 flex-1 rounded-[8px] border-2 border-[#BFBFC7] bg-white px-3 text-[14px] text-[#2E2E33]"
            />
            <Button variant="secondary" onPress={add} className="!h-12 w-[68px] shrink-0">
              추가
            </Button>
          </View>
          {error && (
            <Text
              accessibilityLiveRegion="polite"
              style={font}
              className="mt-2 text-[11px] leading-[15px] text-red-600"
            >
              {error}
            </Text>
          )}
          <View className="mt-4 flex-row flex-wrap gap-2">
            {keywords.map((keyword) => (
              <Chip
                key={keyword}
                variant="filled"
                size="md"
                selected
                accessibilityRole="button"
                accessibilityLabel={`${keyword} 키워드 삭제`}
                onPress={() => {
                  removeKeyword(keyword);
                  setError(null);
                }}
                hitSlop={{ top: 5, bottom: 5 }}
              >
                {`${keyword} ×`}
              </Chip>
            ))}
          </View>
          <Text style={font} className="mt-3 text-[11px] leading-[15px] text-[#737380]">
            최대 10개 · 마이페이지에서 언제든 수정
          </Text>
        </View>
      </ScrollView>
      <View className="px-[21px] pt-3" style={{ paddingBottom: Math.max(16, 49 - insets.bottom) }}>
        <Button
          variant="primary"
          accessibilityRole="button"
          accessibilityState={{ disabled: keywords.length === 0 }}
          disabled={keywords.length === 0}
          onPress={() => {
            Keyboard.dismiss();
            setPermissionVisible(true);
          }}
          className="w-full max-w-[312px] self-center"
        >
          알림 켜고 시작하기
        </Button>
        <Pressable
          accessibilityRole="button"
          onPress={() => finish(false)}
          className="mt-2 min-h-11 items-center justify-center"
        >
          <Text style={font} className="text-[13px] leading-[18px] text-[#737380]">
            알림 없이 시작
          </Text>
        </Pressable>
      </View>
      <NotificationPermissionDialog
        visible={permissionVisible}
        onChoose={finish}
        onClose={() => setPermissionVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}
