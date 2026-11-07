import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

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
    </View>
  );
}
