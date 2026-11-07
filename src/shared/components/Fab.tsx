import { semantic } from '@/design-tokens';
import { PlusIcon } from 'phosphor-react-native/src/icons/Plus';
import { Pressable, type PressableProps } from 'react-native';

import { Icon, type IconComponent } from './Icon';
import { InteractionLayer } from './InteractionLayer';

// BDS FAB: 홈에서 교환글 작성에 쓰는 플로팅 버튼 (56x56)
type FabProps = Omit<PressableProps, 'children' | 'style'> & {
  accessibilityLabel: string;
  icon?: IconComponent;
  className?: string;
};

export function Fab({ icon = PlusIcon, className, ...pressableProps }: FabProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`size-14 items-center justify-center overflow-hidden rounded-3xl bg-accent-bold ${className ?? ''}`}
      {...pressableProps}
    >
      {({ pressed }) => (
        <>
          <Icon icon={icon} size="xl" color={semantic.object.inverse.boldest} />
          <InteractionLayer pressed={pressed} color={semantic.fill.boldest} radius={24} />
        </>
      )}
    </Pressable>
  );
}
