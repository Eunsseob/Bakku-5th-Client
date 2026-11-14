import { Icon } from '@/shared/components/Icon';
import { searchPlaces, type PlaceResult } from '../api/placeSearch';
import { CaretLeftIcon } from 'phosphor-react-native/src/icons/CaretLeft';
import { MapPinIcon } from 'phosphor-react-native/src/icons/MapPin';
import { XCircleIcon } from 'phosphor-react-native/src/icons/XCircle';
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

function MatchedPlaceName({ name, query }: { name: string; query: string }) {
  const term = query.trim();
  const parts = [];
  let start = 0;
  while (term && start < name.length) {
    const index = name.toLowerCase().indexOf(term.toLowerCase(), start);
    if (index < 0) break;
    parts.push(name.slice(start, index));
    parts.push(
      <Text key={index} className="font-sans" style={{ fontWeight: '700', color: '#364153' }}>
        {name.slice(index, index + term.length)}
      </Text>,
    );
    start = index + term.length;
  }
  parts.push(name.slice(start));
  return (
    <Text
      numberOfLines={1}
      className="font-sans"
      style={{
        fontSize: 15,
        lineHeight: 24,
        fontWeight: '400',
        color: '#99A1AF',
        includeFontPadding: false,
      }}
    >
      {parts}
    </Text>
  );
}

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
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <View style={{ height: Math.max(34, insets.top), backgroundColor: '#FFFFFF' }} />
      <View
        style={{
          height: 48,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="지도 화면으로 돌아가기"
          onPress={onBack}
          hitSlop={10}
          style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon icon={CaretLeftIcon} size="xl" color="#364153" weight="bold" />
        </Pressable>
        <View
          style={{
            height: 40,
            flex: 1,
            minWidth: 0,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            borderRadius: 8,
            backgroundColor: '#F3F4F6',
            paddingHorizontal: 12,
          }}
        >
          <TextInput
            autoFocus
            accessibilityLabel="장소 검색"
            placeholder="장소, 지하철, 주소 검색"
            placeholderTextColor="#99A1AF"
            className="font-sans"
            style={{
              flex: 1,
              minWidth: 0,
              padding: 0,
              height: 26,
              fontSize: 16,
              lineHeight: 26,
              color: '#364153',
              includeFontPadding: false,
            }}
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
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              style={{
                width: 20,
                height: 20,
                flexShrink: 0,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              accessibilityLabel="검색어 지우기"
              onPress={() => {
                request.current++;
                setQuery('');
                setRemoteResults([]);
                setMessage('');
                setLoading(false);
              }}
            >
              <Icon icon={XCircleIcon} size="lg" color="#99A1AF" weight="fill" />
            </Pressable>
          )}
        </View>
      </View>
      <View style={{ height: 8, backgroundColor: '#FFFFFF' }} />
      <FlatList
        style={{ flex: 1 }}
        data={results}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, marginHorizontal: 16, backgroundColor: '#E5E7EB' }} />
        )}
        ListFooterComponent={
          results.length > 0 ? (
            <View style={{ height: 1, marginHorizontal: 16, backgroundColor: '#E5E7EB' }} />
          ) : undefined
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${item.name}, ${item.address}`}
            onPress={() => {
              Keyboard.dismiss();
              onSelect(item);
            }}
            style={{
              height: 88,
              paddingHorizontal: 16,
              paddingVertical: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
              <Icon icon={MapPinIcon} size="xl" weight="bold" color="#99A1AF" />
            </View>
            <View style={{ flex: 1, minWidth: 0, height: 64 }}>
              <MatchedPlaceName name={item.name} query={query} />
              <Text
                style={{
                  fontSize: 13,
                  lineHeight: 20,
                  color: '#99A1AF',
                  includeFontPadding: false,
                }}
                numberOfLines={1}
                className="font-sans"
              >
                {item.address}
              </Text>
              <Text
                numberOfLines={1}
                className="font-sans"
                style={{
                  fontSize: 13,
                  lineHeight: 20,
                  color: '#99A1AF',
                  includeFontPadding: false,
                }}
              >
                {distance(origin, item)}km · {item.category}
              </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={{ paddingVertical: 32 }} color="#364153" />
          ) : (
            <Text className="px-4 py-8 text-center font-sans text-[14px] text-[#99A1AF]">
              {message ||
                (normalized
                  ? '검색 버튼을 눌러 주소를 찾아보세요.'
                  : '장소명이나 주소를 입력해 주세요.')}
            </Text>
          )
        }
      />
    </View>
  );
}
