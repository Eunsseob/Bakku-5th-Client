import { semantic } from '@/design-tokens';
import { View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

// BDS Divider
export type DividerThickness = 'normal' | 'bold' | 'bolder' | 'boldest';
export type DividerLayout = 'horizontal' | 'vertical';
export type DividerVariant = 'solid' | 'dashed';

type DividerProps = {
  thickness?: DividerThickness;
  layout?: DividerLayout;
  variant?: DividerVariant;
  className?: string;
};

const WIDTH: Record<DividerThickness, number> = { normal: 1, bold: 2, bolder: 4, boldest: 6 };
const COLOR = semantic.stroke.alpha.subtler;

export function Divider({
  thickness = 'normal',
  layout = 'horizontal',
  variant = 'solid',
  className,
}: DividerProps) {
  const width = WIDTH[thickness];
  const horizontal = layout === 'horizontal';
  const box = horizontal
    ? { height: width, alignSelf: 'stretch' as const }
    : { width, alignSelf: 'stretch' as const };

  if (variant === 'solid') {
    return <View className={className} style={{ ...box, backgroundColor: COLOR }} />;
  }

  // 대시 6px · 간격 6px
  const mid = width / 2;
  return (
    <View className={className} style={box}>
      <Svg width="100%" height="100%">
        <Line
          x1={horizontal ? 0 : mid}
          y1={horizontal ? mid : 0}
          x2={horizontal ? '100%' : mid}
          y2={horizontal ? mid : '100%'}
          stroke={COLOR}
          strokeWidth={width}
          strokeDasharray="6 6"
        />
      </Svg>
    </View>
  );
}
