import { router } from 'expo-router';
import { Pressable, Text, View } from "react-native";

export default function Onboarding() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">Onboarding</Text>
      <Pressable
        className="mt-6 rounded-lg bg-blue-500 px-4 py-3"
        onPress={() => router.push('/login')}
      >
        <Text className="text-white">로그인하기</Text>
      </Pressable>
    </View>
  );
}