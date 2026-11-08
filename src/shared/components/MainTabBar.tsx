import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

const tabs = [
  { id: 'home', label: '홈', href: '../home' },
  { id: 'exchange-map', label: '교환 지도', href: '../exchange-map' },
  { id: 'chat', label: '채팅', href: '../chat' },
  { id: 'mypage', label: '마이', href: '../mypage' },
] as const;

export type MainTab = (typeof tabs)[number]['id'];

export default function MainTabBar({ active }: { active: MainTab }) {
  return (
    <View className="h-16 shrink-0 flex-row border-t-2 border-[#E0E0E6] bg-white">
      {tabs.map((tab) => (
        // 11.06 현재 선택된 탭이면 이동을 막는 처리 코드 수정
        // <Link key={tab.id} href={tab.href} replace asChild>
        <Link
          key={tab.id}
          href={tab.href}
          replace
          asChild
          onPress={(event) => {
            if (active === tab.id) {
              event.preventDefault();
            }
          }}
        >
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: active === tab.id }}
            className="flex-1 items-center pt-[6px]"
          >
            <View
              className={`h-5 w-5 rounded-[5px] ${active === tab.id ? 'bg-[#2E2E33]' : 'bg-[#E0E0E6]'}`}
            />
            <Text
              style={{ fontFamily: 'Pretendard', includeFontPadding: false }}
              className={`mt-1 text-[11px] leading-[15px] ${active === tab.id ? 'text-[#2E2E33]' : 'text-[#737380]'}`}
            >
              {tab.label}
            </Text>
          </Pressable>
        </Link>
      ))}
    </View>
  );
}
