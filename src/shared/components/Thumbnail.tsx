import { semantic } from '@/design-tokens';
import { Image, type ImageSource } from 'expo-image';
import { ImageSquareIcon } from 'phosphor-react-native/src/icons/ImageSquare';
import { View } from 'react-native';

// BDS Thumbnail: 이미지 썸네일. 이미지가 없으면 대체 이미지(fallbackImage)를 보여준다.
export type ThumbnailRatio = '1:1' | '4:5' | '3:4' | '2:3' | '9:16';
export type ThumbnailOrientation = 'portrait' | 'landscape';
/** angular: 각진 모서리, curved: 16px 둥근 모서리, rounded: 원형(1:1 에서만) */
export type ThumbnailCornerStyle = 'angular' | 'curved' | 'rounded';
export type ThumbnailVariant = 'outlined' | 'hollow';

type ThumbnailProps = {
  source?: ImageSource | string | null;
  ratio?: ThumbnailRatio;
  orientation?: ThumbnailOrientation;
  cornerStyle?: ThumbnailCornerStyle;
  variant?: ThumbnailVariant;
  /** 짧은 변 길이(px). 기본 120 */
  size?: number;
  accessibilityLabel?: string;
  className?: string;
};

const RATIO: Record<ThumbnailRatio, number> = {
  '1:1': 1,
  '4:5': 5 / 4,
  '3:4': 4 / 3,
  '2:3': 3 / 2,
  '9:16': 16 / 9,
};

const CORNER: Record<ThumbnailCornerStyle, string> = {
  angular: '',
  curved: 'rounded-2xl',
  rounded: 'rounded-full',
};

export function Thumbnail({
  source,
  ratio = '1:1',
  orientation = 'portrait',
  cornerStyle = 'angular',
  variant = 'outlined',
  size = 120,
  accessibilityLabel,
  className,
}: ThumbnailProps) {
  const long = Math.round(size * RATIO[ratio]);
  const width = orientation === 'portrait' ? size : long;
  const height = orientation === 'portrait' ? long : size;
  // 대체 이미지 아이콘은 긴 변의 40% (Figma fallbackImage: 80px 프레임에 32px 아이콘)
  const iconSize = Math.round(Math.max(width, height) * 0.4);

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      className={`overflow-hidden ${CORNER[cornerStyle]} ${variant === 'outlined' ? 'border border-stroke-alpha-subtler' : ''} ${className ?? ''}`}
      style={{ width, height }}
    >
      {source ? (
        <Image source={source} contentFit="cover" style={{ flex: 1 }} />
      ) : (
        <View className="flex-1 items-center justify-center bg-surface-deeper">
          <ImageSquareIcon size={iconSize} color={semantic.stroke.assistive} />
        </View>
      )}
    </View>
  );
}
