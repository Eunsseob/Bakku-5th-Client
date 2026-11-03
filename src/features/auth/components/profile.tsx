import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Profile() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">Profile</Text>
    
    <Pressable
        className="mt-6 rounded-lg bg-blue-500 px-4 py-3"
        onPress={() => router.push('/wishlist')}
    >
        <Text className="text-white">위시리스트</Text>
    </Pressable>
    </View>
  );
}