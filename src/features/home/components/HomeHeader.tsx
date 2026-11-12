import { Chip } from '@/shared/components/Chip';
import { TextField } from '@/shared/components/TextField';
import { TopNavigation } from '@/shared/components/TopNavigation';
import { BellIcon } from 'phosphor-react-native/src/icons/Bell';
import { MagnifyingGlassIcon } from 'phosphor-react-native/src/icons/MagnifyingGlass';
import { useRef, type ComponentRef } from 'react';
import { ScrollView, View } from 'react-native';

export type MenuAnchor = { x: number; y: number; width: number; height: number };

type Props = {
  location: string;
  category: string;
  mode: string;
  query: string;
  searchVisible: boolean;
  onRegionPress: (anchor: MenuAnchor) => void;
  onSearchPress: () => void;
  onNotificationsPress: () => void;
  onQueryChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onModePress: (anchor: MenuAnchor) => void;
  modeExpanded: boolean;
};

export default function HomeHeader(props: Props) {
  const regionAnchor = useRef<ComponentRef<typeof View>>(null);
  const modeAnchor = useRef<ComponentRef<typeof View>>(null);
  return (
    <View className="border-b border-[#E5E7EB] bg-white">
      <View ref={regionAnchor} collapsable={false}>
        <TopNavigation
          type="home"
          safeArea={false}
          title={props.location === '전체' ? '모든 지역' : props.location}
          onTitlePress={() =>
            regionAnchor.current?.measureInWindow((x, y, width, height) =>
              props.onRegionPress({ x: x + 16, y, width, height }),
            )
          }
          actions={[
            {
              icon: MagnifyingGlassIcon,
              accessibilityLabel: '굿즈 검색',
              onPress: props.onSearchPress,
            },
            { icon: BellIcon, accessibilityLabel: '알림', onPress: props.onNotificationsPress },
          ]}
        />
      </View>
      {props.searchVisible && (
        <View className="px-4 pb-3">
          <TextField
            accessibilityLabel="교환할 굿즈 검색"
            placeholder="굿즈를 검색해 보세요"
            value={props.query}
            onChangeText={props.onQueryChange}
            returnKeyType="search"
          />
        </View>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, gap: 8 }}
      >
        <View ref={modeAnchor} collapsable={false}>
          <Chip
            size="lg"
            hierarchy="primary"
            trailingIconVisible
            accessibilityState={{ expanded: props.modeExpanded }}
            onPress={() =>
              modeAnchor.current?.measureInWindow((x, y, width, height) =>
                props.onModePress({ x, y, width, height }),
              )
            }
            className="!h-10 !bg-[#364153] !px-3.5"
          >
            {props.mode}
          </Chip>
        </View>
        {['캐릭터', '아이돌', '스포츠', '기타'].map((label) => {
          const selected = props.category === label;
          return (
            <Chip
              key={label}
              size="lg"
              hierarchy={selected ? 'primary' : 'secondary'}
              accessibilityState={{ selected }}
              onPress={() => props.onCategoryChange(selected ? '전체' : label)}
              className={`!h-10 !px-0 ${selected ? '!bg-[#364153]' : '!bg-[#F3F4F6]'}`}
              style={{ width: label === '기타' ? 57 : 69 }}
            >
              {label}
            </Chip>
          );
        })}
      </ScrollView>
    </View>
  );
}
