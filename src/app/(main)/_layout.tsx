import MainTabBar, { type MainTab } from '@/shared/components/navigation/MainTabBar';
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
      tabBar={({ state, navigateToTab }) =>
        state.routes[state.index].name === '(post-create)' ? null : (
          // 아래 여백(홈 인디케이터)은 BottomNavigation 이 넣는다
          <View
            className="bg-surface-standard"
            style={{ paddingLeft: insets.left, paddingRight: insets.right }}
          >
            <MainTabBar
              active={state.routes[state.index].name as MainTab}
              onSelect={(tab) => {
                const route = state.routes.find((candidate) => candidate.name === tab);
                if (route) navigateToTab(route.key);
              }}
            />
          </View>
        )
      }
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="exchange-map" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="mypage" />
      {/*// 작성 화면은 이동 가능하게 등록하고, 탭바만 숨김*/}
      <Tabs.Screen name="(post-create)" />
    </Tabs>
  );
}
