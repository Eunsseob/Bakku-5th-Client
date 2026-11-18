import { semantic } from '@/design-tokens';
import type { Icon as PhosphorIcon, IconWeight } from 'phosphor-react-native';

// BDS Icon 크기 (iconSize=5xl ~ 2xs)
export const ICON_SIZE = {
  '5xl': 48,
  '4xl': 40,
  '3xl': 32,
  '2xl': 28,
  xl: 24,
  lg: 20,
  md: 16,
  sm: 14,
  xs: 12,
  '2xs': 10,
} as const;

export type IconSize = keyof typeof ICON_SIZE;
export type IconComponent = PhosphorIcon;

type IconProps = {
  /** Phosphor 아이콘. 예) import { HeartIcon } from 'phosphor-react-native/src/icons/Heart'; */
  icon: IconComponent;
  size?: IconSize;
  color?: string;
  weight?: IconWeight;
};

export function Icon({
  icon: Glyph,
  size = 'xl',
  color = semantic.object.boldest,
  weight = 'bold',
}: IconProps) {
  return <Glyph size={ICON_SIZE[size]} color={color} weight={weight} />;
}
