import MainTabBar, { type MainTab } from '@/shared/components/MainTabBar';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MainLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{ headerShown: false, animation: 'none' }}
      tabBar={({ state }) => (
        <View
          style={{
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
            backgroundColor: 'white',
          }}
        >
          <MainTabBar active={state.routes[state.index].name as MainTab} />
        </View>
      )}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="exchange-map" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="mypage" />
    </Tabs>
  );
}
