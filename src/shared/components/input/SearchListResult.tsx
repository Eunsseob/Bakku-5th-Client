import { semantic } from '@/design-tokens';
import { ArrowUpLeftIcon } from 'phosphor-react-native/src/icons/ArrowUpLeft';
import { ArrowUpRightIcon } from 'phosphor-react-native/src/icons/ArrowUpRight';
import { MagnifyingGlassIcon } from 'phosphor-react-native/src/icons/MagnifyingGlass';
import { MapPinIcon } from 'phosphor-react-native/src/icons/MapPin';
import { Pressable, type PressableProps, Text, View } from 'react-native';

import { Icon, type IconComponent } from '../display/Icon';
import { InteractionLayer } from '../decoration/InteractionLayer';
import { TextDivider } from '../layout/TextDivider';

// BDS 검색 결과 리스트 (Figma: Search List Result)
// 한 줄 78px: [핀/돋보기 아이콘] 장소명 / 주소 / 거리 · 장소 유형 ... [화살표]

/** pin: 장소 결과, search: 최근·추천 검색어 */
export type SearchListResultLeading = 'pin' | 'search' | { icon: IconComponent };
/** arrowUpLeft: 검색어를 입력창에 채우기, arrowUpRight: 바로 이동 */
export type SearchListResultTrailing = 'arrowUpLeft' | 'arrowUpRight' | { icon: IconComponent };

type SearchListResultProps = Omit<PressableProps, 'children' | 'style'> & {
  title: string;
  /** 주소 같은 설명. 없으면 줄을 감춘다 */
  description?: string;
  /** 현재 위치에서 거리 (m). 1000 이상이면 km 로 보여준다 */
  distanceMeters?: number;
  /** 장소 유형 (예: 카페) */
  placeType?: string;
  leading?: SearchListResultLeading;
  trailing?: SearchListResultTrailing;
  /** 오른쪽 화살표만 따로 눌렀을 때 (예: 검색어를 입력창에 채우기) */
  onTrailingPress?: () => void;
  className?: string;
};

const LEADING_ICON = { pin: MapPinIcon, search: MagnifyingGlassIcon };
const TRAILING_ICON = { arrowUpLeft: ArrowUpLeftIcon, arrowUpRight: ArrowUpRightIcon };

/** 850 → '850m', 1234 → '1.2km' */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  const km = meters / 1000;
  return `${km < 10 ? km.toFixed(1).replace(/\.0$/, '') : Math.round(km)}km`;
}

function MetaText({ children }: { children: string }) {
  return (
    <Text numberOfLines={1} className="font-sans text-label-sm font-normal text-object-assistive">
      {children}
    </Text>
  );
}

export function SearchListResult({
  title,
  description,
  distanceMeters,
  placeType,
  leading = 'pin',
  trailing,
  onTrailingPress,
  className,
  ...pressableProps
}: SearchListResultProps) {
  const color = semantic.object.assistive;
  const leadingIcon = typeof leading === 'string' ? LEADING_ICON[leading] : leading.icon;
  const trailingIcon =
    trailing === undefined
      ? null
      : typeof trailing === 'string'
        ? TRAILING_ICON[trailing]
        : trailing.icon;

  const meta = [
    distanceMeters === undefined ? null : formatDistance(distanceMeters),
    placeType || null,
  ].filter((text): text is string => !!text);

  return (
    <Pressable
      accessibilityRole="button"
      className={`flex-row items-center gap-3 px-4 py-2 ${className ?? ''}`}
      {...pressableProps}
    >
      {({ pressed }) => (
        <>
          <View className="flex-1 flex-row items-center gap-3.5">
            <Icon icon={leadingIcon} size="lg" color={color} />
            <View className="flex-1 gap-0.5">
              <Text
                numberOfLines={1}
                className="font-sans text-label-lg font-normal text-object-bolder"
              >
                {title}
              </Text>
              {description || meta.length ? (
                <View className="gap-0.5">
                  {description ? <MetaText>{description}</MetaText> : null}
                  {meta.length ? (
                    <View className="flex-row items-center gap-1">
                      {meta.map((text, index) => (
                        <View key={text} className="shrink flex-row items-center gap-1">
                          {index > 0 ? <TextDivider /> : null}
                          <MetaText>{text}</MetaText>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              ) : null}
            </View>
          </View>
          {trailingIcon ? (
            onTrailingPress ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={trailing === 'arrowUpLeft' ? '검색어 채우기' : '이동'}
                hitSlop={12}
                onPress={onTrailingPress}
              >
                <Icon icon={trailingIcon} size="lg" color={color} />
              </Pressable>
            ) : (
              <Icon icon={trailingIcon} size="lg" color={color} />
            )
          ) : null}
          <InteractionLayer pressed={pressed} color={semantic.fill.boldest} />
        </>
      )}
    </Pressable>
  );
}
