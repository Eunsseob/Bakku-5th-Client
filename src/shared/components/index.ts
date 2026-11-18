// BDS 공통 컴포넌트. 폴더는 Figma 'BDS - 바꾸 디자인 시스템' 의 3. 컴포넌트 분류를 따른다.
// 쓰는 쪽은 항상 '@/shared/components' 에서 import 한다.
// MainTabBar · MainPlaceholder 는 default export 라 파일 경로로 직접 import 한다.

// 액션 Action: 액션 에리어 · 버튼(아이콘·레이블 버튼 포함) · 칩 · FAB
export { ActionArea, type ActionAreaLayout } from './action/ActionArea';
export {
  Button,
  type ButtonFeedback,
  type ButtonHierarchy,
  type ButtonSize,
  type ButtonVariant,
} from './action/Button';
export { Chip, type ChipHierarchy, type ChipSize, type ChipVariant } from './action/Chip';
export { Fab, type FabSize } from './action/Fab';
export { IconButton, type IconButtonHierarchy, type IconButtonSize } from './action/IconButton';
export {
  LabelButton,
  type LabelButtonFeedback,
  type LabelButtonHierarchy,
  type LabelButtonSize,
} from './action/LabelButton';

// 인디케이터 Indicator: 배지
export {
  Badge,
  type BadgeHierarchy,
  type BadgeSize,
  type BadgeTheme,
  type BadgeVariant,
} from './indicator/Badge';

// 데코레이션 Decoration: 인터렉션 레이어
export { InteractionLayer, PRESSED_OPACITY } from './decoration/InteractionLayer';

// 디스플레이 Display: 바텀 시트 · 아이콘 · 썸네일 · 모달
export { BottomSheet } from './display/BottomSheet';
export { ICON_SIZE, Icon, type IconComponent, type IconSize } from './display/Icon';
export { Modal, type ModalButtonLayout } from './display/Modal';
export {
  Thumbnail,
  type ThumbnailCornerStyle,
  type ThumbnailOrientation,
  type ThumbnailRatio,
  type ThumbnailVariant,
} from './display/Thumbnail';

// 인풋 Input: 라디오 · 체크박스 · 텍스트 필드 · 검색 필드 · 리스트 아이템 · 검색 결과 리스트
export {
  Checkbox,
  CheckboxMark,
  type CheckboxHierarchy,
  type CheckboxSize,
  type CheckboxStatus,
} from './input/Checkbox';
export {
  ListItem,
  type ListItemFeedback,
  type ListItemLeading,
  type ListItemTrailing,
} from './input/ListItem';
export { Radio, RadioMark, type RadioHierarchy, type RadioSize } from './input/Radio';
export { SearchField, type SearchFieldProps } from './input/SearchField';
export {
  formatDistance,
  SearchListResult,
  type SearchListResultLeading,
  type SearchListResultTrailing,
} from './input/SearchListResult';
export { TextField, type TextFieldTrailing } from './input/TextField';

// 레이아웃 Layout: 디바이더 · 텍스트 디바이더
export {
  Divider,
  type DividerLayout,
  type DividerThickness,
  type DividerVariant,
} from './layout/Divider';
export { TextDivider } from './layout/TextDivider';

// 네비게이션 Navigation: 알림 배지 · 상단/하단 네비게이션 · 메뉴
export { BottomNavigation, type BottomNavigationItem } from './navigation/BottomNavigation';
export { Menu, type MenuItem } from './navigation/Menu';
export {
  IconBadgeAnchor,
  NotificationBadge,
  type NotificationBadgeSize,
} from './navigation/NotificationBadge';
export {
  TopNavigation,
  type TopNavigationAction,
  type TopNavigationTab,
} from './navigation/TopNavigation';

// 메시지 Message: 엠티 스테이트 · 토스트
export { EmptyState } from './message/EmptyState';
export { Toast, type ToastLeading } from './message/Toast';

// 지도 Map: 핀
export { PLACE_PIN_ANCHOR, PlacePin } from './map/PlacePin';

// 태그 Tag
export { Tag, type TagHierarchy, type TagSize, type TagVariant } from './tag/Tag';
