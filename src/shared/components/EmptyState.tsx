import { semantic } from '@/design-tokens';
import { Text, View } from 'react-native';

import { Button } from './Button';
import { Icon, type IconComponent } from './Icon';

// BDS Empty State: 보여줄 내용이 없을 때 안내하는 영역
type EmptyStateProps = {
  title: string;
  /** 최대 세 줄 */
  description?: string;
  icon?: IconComponent;
  action?: {
    label: string;
    onPress: () => void;
    leadingIcon?: IconComponent;
    trailingIcon?: IconComponent;
  };
  className?: string;
};

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <View className={`items-center gap-4 px-4 py-8 ${className ?? ''}`}>
      {icon ? <Icon icon={icon} size="5xl" color={semantic.object.subtlest} /> : null}
      <View className="items-center self-stretch">
        <Text className="text-center font-sans text-body-md font-medium text-object-bold">
          {title}
        </Text>
        {description ? (
          <Text
            numberOfLines={3}
            className="text-center font-sans text-body-sm font-normal text-object-alternative"
          >
            {description}
          </Text>
        ) : null}
      </View>
      {action ? (
        <Button
          hierarchy="secondary"
          size="sm"
          leadingIcon={action.leadingIcon}
          trailingIcon={action.trailingIcon}
          onPress={action.onPress}
          className="self-center"
        >
          {action.label}
        </Button>
      ) : null}
    </View>
  );
}
