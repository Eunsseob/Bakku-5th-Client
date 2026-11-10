import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

// BDS Notification Badge: 아이콘과 함께 쓰는 알림 배지
export type NotificationBadgeSize = 'sm' | 'md' | 'lg';

type NotificationBadgeProps = {
  /** 숫자를 주면 숫자 배지, 없으면 점 배지 */
  count?: number;
  size?: NotificationBadgeSize;
  /** 이 값보다 크면 `${max}+` 로 표시 */
  max?: number;
  className?: string;
};

const DOT: Record<NotificationBadgeSize, string> = {
  sm: 'size-1',
  md: 'size-1.5',
  lg: 'size-2',
};

const NUMBER: Record<NotificationBadgeSize, { container: string; text: string }> = {
  sm: { container: 'min-w-4 px-1 py-px', text: 'text-label-2xs' },
  md: { container: 'min-w-5 px-1.5 py-px', text: 'text-label-sm' },
  lg: { container: 'min-w-6 px-1.5 py-0.5', text: 'text-label-md' },
};

export function NotificationBadge({
  count,
  size = 'sm',
  max = 99,
  className,
}: NotificationBadgeProps) {
  if (count === undefined) {
    return <View className={`rounded-full bg-accent-bold ${DOT[size]} ${className ?? ''}`} />;
  }

  const styles = NUMBER[size];
  return (
    <View
      className={`items-center justify-center rounded-full bg-accent-bold ${styles.container} ${className ?? ''}`}
    >
      <Text
        className={`text-center font-sans font-semibold text-object-inverse-boldest ${styles.text}`}
      >
        {count > max ? `${max}+` : count}
      </Text>
    </View>
  );
}

/**
 * 아이콘의 오른쪽 위 모서리에 배지를 붙인다.
 * Figma: 배지의 가로 중심은 아이콘 오른쪽 끝, 윗변은 아이콘 윗변에 맞춘다.
 * 부모는 아이콘 크기의 영역이어야 한다 (예: `<View className="size-6">`).
 */
export function IconBadgeAnchor({ children }: { children: ReactNode }) {
  return (
    <View
      className="absolute right-0 top-0 w-0 items-center overflow-visible"
      style={{ pointerEvents: 'none' }}
    >
      {children}
    </View>
  );
}
