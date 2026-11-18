import { router } from 'expo-router';
import { MapPinIcon } from 'phosphor-react-native/src/icons/MapPin';

import { BottomNavigation, type BottomNavigationItem } from './BottomNavigation';
import {
  HomeFilledIcon,
  HomeOutlinedIcon,
  MessageFilledIcon,
  MessageOutlinedIcon,
  UserFilledIcon,
  UserOutlinedIcon,
} from './TabIcons';

// 메인 탭 바: BDS Bottom Navigation 에 앱의 탭을 넣은 것
// 아이콘은 Figma UI-Flow '(현)UI 전개 시안' 기준: 선택된 탭은 채운 모양, 나머지는 테두리 모양
const TABS = [
  { key: 'home', label: '홈', icon: HomeOutlinedIcon, selectedIcon: HomeFilledIcon },
  // Figma 화면에는 없는 개발용 탭
  { key: 'exchange-map', label: '교환 지도', icon: MapPinIcon },
  { key: 'chat', label: '채팅', icon: MessageOutlinedIcon, selectedIcon: MessageFilledIcon },
  { key: 'mypage', label: '마이', icon: UserOutlinedIcon, selectedIcon: UserFilledIcon },
] as const satisfies readonly BottomNavigationItem[];

export type MainTab = (typeof TABS)[number]['key'];

type MainTabBarProps = {
  active: MainTab;
  /** 탭 이동. 없으면 같은 그룹의 탭 화면으로 바꿔 끼운다 */
  onSelect?: (tab: MainTab) => void;
  /** 하단 홈 인디케이터 여백 */
  safeArea?: boolean;
};

export default function MainTabBar({ active, onSelect, safeArea = true }: MainTabBarProps) {
  return (
    <BottomNavigation
      items={[...TABS]}
      selectedKey={active}
      safeArea={safeArea}
      onSelect={(tab) => {
        // 지금 탭을 다시 누르면 아무것도 하지 않는다
        if (tab === active) return;
        if (onSelect) onSelect(tab);
        else router.replace(`/(main)/${tab}`);
      }}
    />
  );
}
