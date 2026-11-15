import MainTabBar, { type MainTab } from '@/shared/components/MainTabBar';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const unstable_settings = { initialRouteName: 'home' };

export default function MainLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      backBehavior="history"
      screenOptions={{ headerShown: false, animation: 'none' }}
      tabBar={({ state }) =>
        state.routes[state.index].name === '(post-create)' ? null : (
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
        )
      }
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="exchange-map" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="mypage" />
      // 작성 화면은 이동 가능하게 등록하고, 탭바만 숨김
      <Tabs.Screen name="(post-create)" />
    </Tabs>
  );
}
