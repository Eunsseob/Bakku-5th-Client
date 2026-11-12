import { searchPlaces, type PlaceResult } from '../api/placeSearch';
import { Icon } from '@/shared/components/Icon';
import { IconButton } from '@/shared/components/IconButton';
import { Divider } from '@/shared/components/Divider';
import { CaretLeftIcon } from 'phosphor-react-native/src/icons/CaretLeft';
import { MapPinIcon } from 'phosphor-react-native/src/icons/MapPin';
import { XIcon } from 'phosphor-react-native/src/icons/X';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MapPoint } from './MapCanvas';

type Place = PlaceResult;
type Props = {
  initialQuery: string;
  origin: MapPoint;
  onBack: () => void;
  onSelect: (place: Place) => void;
};

function distance(origin: MapPoint, destination: MapPoint) {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const deltaLat = radians(destination.latitude - origin.latitude);
  const deltaLon = radians(destination.longitude - origin.longitude);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(radians(origin.latitude)) *
      Math.cos(radians(destination.latitude)) *
      Math.sin(deltaLon / 2) ** 2;
  return (6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

export default function LocationSearch({ initialQuery, origin, onBack, onSelect }: Props) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState(initialQuery);
  const [remoteResults, setRemoteResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const request = useRef(0);
  const normalized = query.trim().replace(/\s/g, '').toLowerCase();
  const results = remoteResults;
  const [searchVersion, setSearchVersion] = useState(0);
  const search = () => {
    Keyboard.dismiss();
    setSearchVersion((value) => value + 1);
  };
  useEffect(() => {
    const text = query.trim();
    if (!text) return;
    const controller = new AbortController();
    const id = ++request.current;
    const timer = setTimeout(() => {
      setLoading(true);
      setMessage('');
      void searchPlaces(text, controller.signal)
        .then((places) => {
          if (id !== request.current || controller.signal.aborted) return;
          setRemoteResults(places);
          if (!places.length)
            setMessage(
              '\uAC80\uC0C9 \uACB0\uACFC\uAC00 \uC5C6\uC5B4\uC694. \uC9C0\uC5ED\uBA85\uC744 \uD568\uAED8 \uC785\uB825\uD574 \uBCF4\uC138\uC694.',
            );
        })
        .catch((error: unknown) => {
          if (id !== request.current || controller.signal.aborted) return;
          setRemoteResults([]);
          setMessage(
            error instanceof Error
              ? error.message
              : '\uAC80\uC0C9\uD558\uC9C0 \uBABB\uD588\uC5B4\uC694. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
          );
        })
        .finally(() => {
          if (id === request.current && !controller.signal.aborted) setLoading(false);
        });
    }, 400);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, searchVersion]);

  return (
    <View
      className="flex-1 bg-white"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <View className="flex-row items-center gap-1 pb-3 pl-1 pr-4 pt-2">
        <View className="h-11 w-11 items-center justify-center">
          <IconButton
            icon={CaretLeftIcon}
            accessibilityLabel="지도 화면으로 돌아가기"
            onPress={onBack}
          />
        </View>
        <View className="h-10 flex-1 flex-row items-center gap-2 rounded-lg bg-[#F3F4F6] px-3">
          <TextInput
            autoFocus
            accessibilityLabel="장소 검색"
            placeholder="장소, 지하철, 주소 검색"
            placeholderTextColor="#99A1AF"
            className="flex-1 p-0 font-sans text-[16px] leading-[26px] text-[#364153]"
            value={query}
            returnKeyType="search"
            onSubmitEditing={() => {
              void search();
            }}
            onChangeText={(text) => {
              request.current++;
              setQuery(text);
              setRemoteResults([]);
              setMessage('');
              setLoading(false);
            }}
          />
          {!!query && (
            <IconButton
              icon={XIcon}
              size="sm"
              accessibilityLabel="검색어 지우기"
              onPress={() => {
                request.current++;
                setQuery('');
                setRemoteResults([]);
                setMessage('');
                setLoading(false);
              }}
            />
          )}
        </View>
      </View>
      {loading && <ActivityIndicator className="py-4" color="#364153" />}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 24 }}
        ItemSeparatorComponent={() => <Divider />}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${item.name}, ${item.address}`}
            onPress={() => {
              Keyboard.dismiss();
              onSelect(item);
            }}
            className="min-h-[89px] flex-row items-center gap-4 py-4"
          >
            <View className="w-6 items-center justify-center">
              <Icon icon={MapPinIcon} size="xl" weight="regular" color="#99A1AF" />
            </View>
            <View className="flex-1 gap-0.5">
              <Text
                style={{ includeFontPadding: false }}
                numberOfLines={2}
                className="font-sans text-[15px] font-normal leading-6 text-[#364153]"
              >
                {item.name}
              </Text>
              <Text
                style={{ includeFontPadding: false }}
                numberOfLines={2}
                className="font-sans text-[13px] leading-5 text-[#99A1AF]"
              >
                {item.address}
              </Text>
              <Text className="font-sans text-[13px] leading-5 text-[#99A1AF]">
                {distance(origin, item)}km · {item.category}
              </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text className="px-4 py-8 text-center font-sans text-[14px] text-[#99A1AF]">
            {message ||
              (normalized
                ? '검색 버튼을 눌러 주소를 찾아보세요.'
                : '장소명이나 주소를 입력해 주세요.')}
          </Text>
        }
      />
    </View>
  );
}
