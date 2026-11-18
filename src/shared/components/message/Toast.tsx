import { semantic } from '@/design-tokens';
import { CheckIcon } from 'phosphor-react-native/src/icons/Check';
import { WarningCircleIcon } from 'phosphor-react-native/src/icons/WarningCircle';
import { Text, View } from 'react-native';

import { Icon, type IconComponent } from '../display/Icon';

// BDS Toast: 잠깐 떴다 사라지는 알림. 띄우는 위치와 시간은 쓰는 쪽이 정한다.
export type ToastLeading = 'positive' | 'destructive' | { icon: IconComponent };

type ToastProps = {
  title: string;
  description?: string;
  /** 왼쪽 아이콘. 없으면 글자만 */
  leading?: ToastLeading;
  className?: string;
};

const { object, theme } = semantic;

const LEADING: Record<Exclude<ToastLeading, { icon: IconComponent }>, [IconComponent, string]> = {
  positive: [CheckIcon, theme.green.neutral],
  destructive: [WarningCircleIcon, theme.red.neutral],
};

export function Toast({ title, description, leading, className }: ToastProps) {
  const [glyph, color] =
    leading === undefined
      ? [null, '']
      : typeof leading === 'string'
        ? LEADING[leading]
        : [leading.icon, object.inverse.bold];

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      className={`flex-row gap-2.5 rounded-8 bg-object-bold px-4 py-3 ${className ?? ''}`}
    >
      {glyph ? (
        <View className="py-0.5">
          <Icon icon={glyph} size="md" color={color} />
        </View>
      ) : null}
      <View className="flex-1 gap-0.5">
        <Text className="font-sans text-label-md font-medium text-object-inverse-boldest">
          {title}
        </Text>
        {description ? (
          <Text className="font-sans text-body-xs font-normal text-object-inverse-neutral">
            {description}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
