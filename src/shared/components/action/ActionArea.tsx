import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, type ButtonHierarchy } from './Button';

// BDS Action Area: 화면 하단에 고정되는 액션 버튼 영역 (메인 · 대체 · 보조 액션)
export type ActionAreaLayout = 'vertical' | 'horizontal';

type Action = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** 메인 버튼 색. 기본 primary(진한 버튼), 탈퇴처럼 강조하지 않을 때 secondary(회색) */
  hierarchy?: ButtonHierarchy;
};

type ActionAreaProps = {
  main: Action;
  /** 회색 버튼 */
  alternative?: Action;
  /** vertical: 텍스트 버튼, horizontal: 테두리 버튼 */
  sub?: Action;
  layout?: ActionAreaLayout;
  /** 하단 안전 영역(홈 인디케이터)만큼 여백을 더한다 */
  safeArea?: boolean;
  className?: string;
};

export function ActionArea({
  main,
  alternative,
  sub,
  layout = 'vertical',
  safeArea = true,
  className,
}: ActionAreaProps) {
  const insets = useSafeAreaInsets();
  const paddingBottom = 8 + (safeArea ? insets.bottom : 0);

  if (layout === 'horizontal') {
    return (
      <View
        className={`flex-row items-start gap-2 bg-surface-standard px-4 pt-3 ${className ?? ''}`}
        style={{ paddingBottom }}
      >
        {sub ? (
          <Button
            hierarchy="secondary"
            variant="outlined"
            disabled={sub.disabled}
            onPress={sub.onPress}
          >
            {sub.label}
          </Button>
        ) : null}
        {alternative ? (
          <Button
            hierarchy="secondary"
            disabled={alternative.disabled}
            onPress={alternative.onPress}
            className="flex-1"
          >
            {alternative.label}
          </Button>
        ) : null}
        <Button
          hierarchy={main.hierarchy}
          disabled={main.disabled}
          onPress={main.onPress}
          className="flex-1"
        >
          {main.label}
        </Button>
      </View>
    );
  }

  return (
    <View
      className={`items-center gap-2 bg-surface-standard px-4 pt-3 ${className ?? ''}`}
      style={{ paddingBottom }}
    >
      <Button
        hierarchy={main.hierarchy}
        disabled={main.disabled}
        onPress={main.onPress}
        className="self-stretch"
      >
        {main.label}
      </Button>
      {alternative ? (
        <Button
          hierarchy="secondary"
          disabled={alternative.disabled}
          onPress={alternative.onPress}
          className="self-stretch"
        >
          {alternative.label}
        </Button>
      ) : null}
      {sub ? (
        <Button
          hierarchy="secondary"
          variant="hollow"
          size="md"
          disabled={sub.disabled}
          onPress={sub.onPress}
          className="self-center"
        >
          {sub.label}
        </Button>
      ) : null}
    </View>
  );
}
