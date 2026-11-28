import { Chip, TopNavigation } from '@/shared/components';
import { BellIcon } from 'phosphor-react-native/src/icons/Bell';
import { MagnifyingGlassIcon } from 'phosphor-react-native/src/icons/MagnifyingGlass';
import { ScrollView, View } from 'react-native';

const exchangeModes = ['지금 교환', '일반 교환'] as const;
export type ExchangeMode = (typeof exchangeModes)[number];

type Props = {
  location: string;
  category: string;
  categories: string[];
  mode: ExchangeMode | null;
  onRegionPress: () => void;
  onSearchPress: () => void;
  onNotificationsPress: () => void;
  onCategoryChange: (category: string) => void;
  onModeChange: (mode: ExchangeMode | null) => void;
  onResetFilters: () => void;
};

export default function HomeHeader(props: Props) {
  const chips = [
    {
      label: '전체',
      selected: props.mode === null && props.category === '전체',
      onPress: props.onResetFilters,
    },
    ...exchangeModes.map((mode) => ({
      label: mode,
      selected: props.mode === mode,
      onPress: () => props.onModeChange(props.mode === mode ? null : mode),
    })),
    ...props.categories.map((label) => ({
      label,
      selected: props.category === label,
      onPress: () => props.onCategoryChange(props.category === label ? '전체' : label),
    })),
  ];
  return (
    <View className="border-b border-[#E5E7EB] bg-white">
      <TopNavigation
        type="home"
        safeArea={false}
        title={props.location === '전체' ? '모든 지역' : props.location}
        onTitlePress={props.onRegionPress}
        actions={[
          {
            icon: MagnifyingGlassIcon,
            accessibilityLabel: '굿즈 검색',
            onPress: props.onSearchPress,
          },
          { icon: BellIcon, accessibilityLabel: '알림', onPress: props.onNotificationsPress },
        ]}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, gap: 8 }}
      >
        {chips.map(({ label, selected, onPress }) => (
          <Chip
            key={label}
            hierarchy={selected ? 'primary' : 'secondary'}
            accessibilityState={{ selected }}
            onPress={onPress}
          >
            {label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );
}
