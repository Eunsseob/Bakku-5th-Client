import { semantic } from '@/design-tokens';
import { Pressable, type PressableProps } from 'react-native';

import { Icon, type IconComponent } from './Icon';
import { InteractionLayer } from './InteractionLayer';

// BDS Icon Button: 아이콘만 있는 버튼. 크기는 아이콘 크기와 같다.
export type IconButtonHierarchy = 'accent' | 'primary' | 'secondary' | 'tertiary';
export type IconButtonSize = '3xl' | '2xl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs' | '2xs';

type IconButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  icon: IconComponent;
  /** 스크린리더용 이름 (예: '뒤로 가기') */
  accessibilityLabel: string;
  hierarchy?: IconButtonHierarchy;
  size?: IconButtonSize;
  className?: string;
};

const { accent, object, fill } = semantic;

const COLORS: Record<IconButtonHierarchy, { content: string; overlay: string }> = {
  accent: { content: accent.bold, overlay: accent.bold },
  primary: { content: object.boldest, overlay: fill.boldest },
  secondary: { content: object.alternative, overlay: fill.boldest },
  tertiary: { content: object.assistive, overlay: fill.boldest },
};

const LAYER: Record<IconButtonSize, { inset: number; radius: number }> = {
  '3xl': { inset: 4, radius: 10 },
  '2xl': { inset: 4, radius: 10 },
  xl: { inset: 3, radius: 8 },
  lg: { inset: 3, radius: 8 },
  md: { inset: 2, radius: 6 },
  sm: { inset: 2, radius: 6 },
  xs: { inset: 1, radius: 4 },
  '2xs': { inset: 1, radius: 4 },
};

export function IconButton({
  icon,
  hierarchy = 'primary',
  size = 'xl',
  disabled,
  className,
  ...pressableProps
}: IconButtonProps) {
  const colors = COLORS[hierarchy];
  const layer = LAYER[size];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      hitSlop={8}
      className={`items-center justify-center self-start ${className ?? ''}`}
      {...pressableProps}
    >
      {({ pressed }) => (
        <>
          <Icon icon={icon} size={size} color={disabled ? object.subtler : colors.content} />
          {disabled ? null : (
            <InteractionLayer
              pressed={pressed}
              color={colors.overlay}
              inset={layer.inset}
              radius={layer.radius}
            />
          )}
        </>
      )}
    </Pressable>
  );
}
