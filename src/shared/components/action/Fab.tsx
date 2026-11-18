import { semantic, shadow } from '@/design-tokens';
import { PlusIcon } from 'phosphor-react-native/src/icons/Plus';
import { Pressable, type PressableProps } from 'react-native';

import { Icon, type IconComponent } from '../display/Icon';
import { InteractionLayer } from '../decoration/InteractionLayer';

// BDS FAB: 떠 있는 둥근 버튼
//   lg (56): 보라 바탕 + 흰 아이콘. 홈에서 교환글 작성
//   md (44): 흰 바탕 + 진한 아이콘. 지도 위 보조 버튼 (예: 현재 위치)
export type FabSize = 'lg' | 'md';

type FabProps = Omit<PressableProps, 'children' | 'style'> & {
  accessibilityLabel: string;
  icon?: IconComponent;
  size?: FabSize;
  className?: string;
};

const SIZE: Record<FabSize, { container: string; icon: 'xl' | 'lg'; color: string }> = {
  lg: { container: 'size-14 bg-accent-bold', icon: 'xl', color: semantic.object.inverse.boldest },
  md: { container: 'size-11 bg-surface-standard', icon: 'lg', color: semantic.object.bolder },
};

export function Fab({ icon = PlusIcon, size = 'lg', className, ...pressableProps }: FabProps) {
  const spec = SIZE[size];
  return (
    <Pressable
      accessibilityRole="button"
      className={`items-center justify-center rounded-24 ${spec.container} ${className ?? ''}`}
      style={shadow[1]}
      {...pressableProps}
    >
      {({ pressed }) => (
        <>
          <Icon icon={icon} size={spec.icon} color={spec.color} />
          <InteractionLayer pressed={pressed} color={semantic.fill.boldest} radius={24} />
        </>
      )}
    </Pressable>
  );
}
