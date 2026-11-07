import { View } from 'react-native';

// BDS Interaction layer: 눌렀을 때 요소 위에 같은 색을 8% 불투명도로 덮는다.
export const PRESSED_OPACITY = 0.08;

type InteractionLayerProps = {
  pressed: boolean;
  color: string;
  /** 요소 바깥으로 넓힐 범위(px). 숫자 하나면 사방 동일 */
  inset?: number | { x: number; y: number };
  radius?: number;
};

export function InteractionLayer({ pressed, color, inset = 0, radius }: InteractionLayerProps) {
  const { x, y } = typeof inset === 'number' ? { x: inset, y: inset } : inset;

  return (
    <View
      style={{
        position: 'absolute',
        top: -y,
        bottom: -y,
        left: -x,
        right: -x,
        borderRadius: radius,
        backgroundColor: color,
        opacity: pressed ? PRESSED_OPACITY : 0,
        pointerEvents: 'none',
      }}
    />
  );
}
