import { Stack } from 'expo-router';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeRoute() {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-1 items-center justify-center bg-white"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <Text className="text-[20px] text-[#2E2E33]" style={{ fontFamily: 'Pretendard' }}>
        메인화면
      </Text>
    </View>
  );
}
