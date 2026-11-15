import { IconButton } from '@/shared/components';
import { router, Stack } from 'expo-router';
import { CaretLeftIcon } from 'phosphor-react-native/src/icons/CaretLeft';
import { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View
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
        <IconButton
          icon={CaretLeftIcon}
          size="xl"
          accessibilityLabel="이전 단계"
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
          onPress={() => finish(false)}
          className="mt-2 min-h-11 items-center justify-center"
        >
          <Text style={font} className="text-[13px] leading-[18px] text-[#737380]">
            권한 요청 들어갈 예정
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
