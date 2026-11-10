import { semantic } from '@/design-tokens';
import { CaretDownIcon } from 'phosphor-react-native/src/icons/CaretDown';
import { CaretLeftIcon } from 'phosphor-react-native/src/icons/CaretLeft';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip } from './Chip';
import { Icon, type IconComponent } from './Icon';
import { IconButton } from './IconButton';
import { LabelButton } from './LabelButton';
import { IconBadgeAnchor, NotificationBadge } from './NotificationBadge';

// BDS Top Navigation: 화면 상단에 고정되는 바 (상태바 영역 + 56px 바 + 선택적 칩 탭)

export type TopNavigationAction = {
  icon: IconComponent;
  accessibilityLabel: string;
  onPress: () => void;
  /** 점 알림 배지 표시 */
  badge?: boolean;
};

export type TopNavigationTab = {
  key: string;
  label: string;
  /** 칩 오른쪽 아래 화살표 (필터처럼 눌러서 고르는 탭) */
  trailingIconVisible?: boolean;
};

type TabsProps = {
  items: TopNavigationTab[];
  selectedKey: string;
  onSelect: (key: string) => void;
};

type CommonProps = {
  /** 바 아래 가로 스크롤 칩 탭 */
  tabs?: TabsProps;
  /** 상단 상태바 높이만큼 여백을 둔다. 화면이 이미 safe area 를 처리하면 false */
  safeArea?: boolean;
  className?: string;
};

type HomeProps = CommonProps & {
  type: 'home';
  title: string;
  /** 제목 옆 아래 화살표 + 제목을 눌렀을 때 동작 */
  onTitlePress?: () => void;
  actions?: TopNavigationAction[];
};

type ScreenProps = CommonProps & {
  type: 'screen';
  title?: string;
  description?: string;
  onBack?: () => void;
  /** 오른쪽 텍스트 버튼 */
  trailingLabel?: string;
  onTrailingPress?: () => void;
};

type TopNavigationProps = HomeProps | ScreenProps;

function ActionButton({ icon, accessibilityLabel, onPress, badge }: TopNavigationAction) {
  return (
    <View className="p-2.5">
      <View className="size-6">
        <IconButton icon={icon} accessibilityLabel={accessibilityLabel} onPress={onPress} />
        {badge ? (
          <IconBadgeAnchor>
            <NotificationBadge size="md" />
          </IconBadgeAnchor>
        ) : null}
      </View>
    </View>
  );
}

function Tabs({ items, selectedKey, onSelect }: TabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="tablist"
      contentContainerClassName="gap-2 px-4 py-1"
    >
      {items.map((tab) => {
        const selected = tab.key === selectedKey;
        return (
          <Chip
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            hierarchy={selected ? 'primary' : 'secondary'}
            size="lg"
            trailingIconVisible={tab.trailingIconVisible}
            onPress={() => onSelect(tab.key)}
          >
            {tab.label}
          </Chip>
        );
      })}
    </ScrollView>
  );
}

function HomeBar({ title, onTitlePress, actions = [] }: HomeProps) {
  return (
    <View className="h-14 flex-row items-center justify-between p-1.5">
      <Pressable
        accessibilityRole={onTitlePress ? 'button' : 'header'}
        disabled={!onTitlePress}
        onPress={onTitlePress}
        className="h-11 flex-1 flex-row items-center gap-1.5 py-2.5 pl-2.5"
      >
        <Text numberOfLines={1} className="font-sans text-title-2 font-semibold text-object-bolder">
          {title}
        </Text>
        {onTitlePress ? (
          <Icon icon={CaretDownIcon} size="md" color={semantic.object.subtle} />
        ) : null}
      </Pressable>
      <View className="flex-row items-center">
        {actions.map((action) => (
          <ActionButton key={action.accessibilityLabel} {...action} />
        ))}
      </View>
    </View>
  );
}

function ScreenBar({ title, description, onBack, trailingLabel, onTrailingPress }: ScreenProps) {
  return (
    <View className="h-14 flex-row items-center justify-between p-1.5">
      {title ? (
        <View
          className="absolute inset-x-[50px] inset-y-0 items-center justify-center"
          style={{ pointerEvents: 'none' }}
        >
          <Text
            numberOfLines={1}
            accessibilityRole="header"
            className="font-sans text-label-lg font-semibold text-object-bolder"
          >
            {title}
          </Text>
          {description ? (
            <Text
              numberOfLines={1}
              className="font-sans text-body-2xs font-normal text-object-alternative"
            >
              {description}
            </Text>
          ) : null}
        </View>
      ) : null}
      {onBack ? (
        <View className="p-2.5">
          <IconButton icon={CaretLeftIcon} accessibilityLabel="뒤로 가기" onPress={onBack} />
        </View>
      ) : (
        <View />
      )}
      {trailingLabel ? (
        <View className="px-2.5 py-3">
          <LabelButton hierarchy="tertiary" size="md" onPress={onTrailingPress}>
            {trailingLabel}
          </LabelButton>
        </View>
      ) : null}
    </View>
  );
}

export function TopNavigation(props: TopNavigationProps) {
  const insets = useSafeAreaInsets();
  const { tabs, safeArea = true, className } = props;

  let bar: ReactNode;
  if (props.type === 'home') {
    bar = <HomeBar {...props} />;
  } else {
    bar = <ScreenBar {...props} />;
  }

  return (
    <View
      className={`bg-surface-standard ${className ?? ''}`}
      style={safeArea ? { paddingTop: insets.top } : undefined}
    >
      {bar}
      {tabs ? <Tabs {...tabs} /> : null}
    </View>
  );
}
