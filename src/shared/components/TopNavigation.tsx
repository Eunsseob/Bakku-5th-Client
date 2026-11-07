import { semantic } from '@/design-tokens';
import { CaretDownIcon } from 'phosphor-react-native/src/icons/CaretDown';
import { CaretLeftIcon } from 'phosphor-react-native/src/icons/CaretLeft';
import { Pressable, Text, View } from 'react-native';

import { Icon, type IconComponent } from './Icon';
import { IconButton } from './IconButton';
import { LabelButton } from './LabelButton';
import { IconBadgeAnchor, NotificationBadge } from './NotificationBadge';

// BDS Top Navigation: 화면 상단에 고정되는 56px 바

export type TopNavigationAction = {
  icon: IconComponent;
  accessibilityLabel: string;
  onPress: () => void;
  /** 점 알림 배지 표시 */
  badge?: boolean;
};

type HomeProps = {
  type: 'home';
  title: string;
  /** 제목 옆 아래 화살표 + 제목을 눌렀을 때 동작 */
  onTitlePress?: () => void;
  actions?: TopNavigationAction[];
  className?: string;
};

type ScreenProps = {
  type: 'screen';
  title?: string;
  description?: string;
  onBack?: () => void;
  /** 오른쪽 텍스트 버튼 */
  trailingLabel?: string;
  onTrailingPress?: () => void;
  className?: string;
};

type TopNavigationProps = HomeProps | ScreenProps;

function ActionButton({ icon, accessibilityLabel, onPress, badge }: TopNavigationAction) {
  return (
    <View className="p-2.5">
      <View className="size-6">
        <IconButton icon={icon} accessibilityLabel={accessibilityLabel} onPress={onPress} />
        {badge ? (
          <IconBadgeAnchor>
            <NotificationBadge size="sm" />
          </IconBadgeAnchor>
        ) : null}
      </View>
    </View>
  );
}

export function TopNavigation(props: TopNavigationProps) {
  if (props.type === 'home') {
    const { title, onTitlePress, actions = [], className } = props;
    return (
      <View
        className={`h-14 flex-row items-center justify-between bg-surface-standard p-1.5 ${className ?? ''}`}
      >
        <Pressable
          accessibilityRole={onTitlePress ? 'button' : 'header'}
          disabled={!onTitlePress}
          onPress={onTitlePress}
          className="h-11 flex-1 flex-row items-center gap-1.5 py-2.5 pl-2.5"
        >
          <Text className="font-sans text-title-2 font-semibold text-object-bolder">{title}</Text>
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

  const { title, description, onBack, trailingLabel, onTrailingPress, className } = props;
  return (
    <View
      className={`h-14 flex-row items-center justify-between bg-surface-standard p-1.5 ${className ?? ''}`}
    >
      {title ? (
        <View
          className="absolute inset-x-[50px] inset-y-0 items-center justify-center"
          style={{ pointerEvents: 'none' }}
        >
          <Text
            numberOfLines={1}
            accessibilityRole="header"
            className="font-sans text-label-lg font-medium text-object-bolder"
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
