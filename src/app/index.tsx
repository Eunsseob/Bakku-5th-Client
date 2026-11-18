import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { enterMainAfterAuth } from '@/features/auth/utils/enterMainAfterAuth';

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">Bakku</Text>
      <Pressable
        className="mt-6 rounded-lg bg-blue-500 px-4 py-3"
        onPress={() => router.push('/(auth)/onboarding')}
      >
        <Text className="text-white">온보딩 갈 예정</Text>
      </Pressable>
      {/* 개발 빌드에서만: 에뮬레이터는 카카오·네이버 로그인이 안 돼서 온보딩·로그인을 건너뛴다 */}
      {__DEV__ ? (
        <Pressable
          className="mt-3 rounded-lg border border-blue-500 px-4 py-3"
          onPress={() => enterMainAfterAuth()}
        >
          <Text className="text-blue-500">개발용 · 홈으로 바로 가기</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
