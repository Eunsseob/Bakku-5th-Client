import { Stack } from 'expo-router';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import MainTabBar, { type MainTab } from './MainTabBar';

export default function MainPlaceholder({ active, title }: { active: MainTab; title: string }) {
  const insets = useSafeAreaInsets();
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
      <View className="flex-1 items-center justify-center">
        <Text style={{ fontFamily: 'Pretendard' }} className="text-[20px] text-[#2E2E33]">
          {title}
        </Text>
        <Text style={{ fontFamily: 'Pretendard' }} className="mt-3 text-[14px] text-[#737380]">
          준비 중이에요
        </Text>
      </View>
      <MainTabBar active={active} />
    </View>
  );
}
