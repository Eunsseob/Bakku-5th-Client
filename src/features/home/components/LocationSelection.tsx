import { Button } from '@/shared/components/Button';
import { Chip } from '@/shared/components/Chip';
import { Icon } from '@/shared/components/Icon';
import { TopNavigation } from '@/shared/components/TopNavigation';
import * as Location from 'expo-location';
import { MagnifyingGlassIcon } from 'phosphor-react-native/src/icons/MagnifyingGlass';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getQuickCurrentLocation } from '../utils/currentLocation';
import { searchPlaces } from '../api/placeSearch';
import MapCanvas, { type MapPoint } from './MapCanvas';
import LocationSearch from './LocationSearch';

const hubs = [
  { label: '홍대', query: '서울 홍대입구역' },
  { label: '용산', query: '서울 용산역' },
  { label: '건대·성수', query: '서울 건대입구역' },
  { label: '신도림', query: '서울 신도림역' },
  { label: '국전', query: '서울 서초구 효령로 304' },
];

type LocationSelectionProps = {
  initialLocation: string;
  initialDetail: string;
  initialPoint?: MapPoint;
  onClose: () => void;
  onConfirm: (location: string, detail: string, point?: MapPoint) => void;
};

export default function LocationSelection({
  initialLocation,
  initialDetail,
  initialPoint,
  onClose,
  onConfirm,
}: LocationSelectionProps) {
  const insets = useSafeAreaInsets();
  const [point, setPoint] = useState<MapPoint>(
    initialPoint ?? { latitude: 37.5665, longitude: 126.978 },
  );
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedHub, setSelectedHub] = useState('');
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(!initialPoint);
  const [locationError, setLocationError] = useState('');
  const [currentLocation, setCurrentLocation] = useState<MapPoint>();
  const [moving, setMoving] = useState(false);
  const [address, setAddress] = useState({
    primary: initialLocation,
    secondary: initialDetail,
    ready: !!initialPoint,
  });
  const [addressPending, setAddressPending] = useState(!initialPoint);
  const userSelected = useRef(false);
  const selectedPlace = useRef<{
    latitude: number;
    longitude: number;
    name: string;
    address: string;
  } | null>(
    initialPoint && initialLocation
      ? { ...initialPoint, name: initialLocation, address: '' }
      : null,
  );
  const searchRequest = useRef(0);

  useEffect(() => {
    if (initialPoint) return;
    let active = true;
    void (async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!permission.granted) {
          if (active) setLocationError('현재 위치를 보려면 위치 권한을 허용해 주세요.');
          return;
        }
        const current = await getQuickCurrentLocation();
        if (active)
          setCurrentLocation({
            latitude: current.coords.latitude,
            longitude: current.coords.longitude,
          });
        if (active && !userSelected.current) {
          setAddressPending(true);
          setPoint({ latitude: current.coords.latitude, longitude: current.coords.longitude });
        }
      } catch {
        // Keep the map available; its initial center is an overview, not a GPS fix.
        if (active)
          setLocationError(
            '현재 위치를 확인하지 못했어요. 지역을 검색하거나 내 위치 버튼으로 다시 시도해 주세요.',
          );
      } finally {
        if (active) setLocating(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [initialPoint]);

  useEffect(() => {
    let active = true;
    if (locating) return;
    const timer = setTimeout(() => {
      void (async () => {
        const coordinateText = `${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}`;
        let next = { primary: '지도에서 선택한 위치', secondary: coordinateText, ready: true };
        try {
          if (Platform.OS !== 'web') {
            const permission = await Location.requestForegroundPermissionsAsync();
            if (permission.granted) {
              const [result] = await Location.reverseGeocodeAsync({
                latitude: point.latitude,
                longitude: point.longitude,
              });
              if (result) {
                const region = [
                  ...new Set([result.region, result.city, result.district].filter(Boolean)),
                ].join(' ');
                const street = [result.street, result.streetNumber].filter(Boolean).join(' ');
                next = {
                  primary:
                    [region, result.name || street].filter(Boolean).join(' ') || coordinateText,
                  secondary: [region, street].filter(Boolean).join(' ') || coordinateText,
                  ready: true,
                };
              }
            }
          }
        } catch {
          // Coordinates remain selectable when the device address lookup fails.
        }
        if (active) {
          const place = selectedPlace.current;
          if (
            place &&
            Math.abs(place.latitude - point.latitude) < 0.00001 &&
            Math.abs(place.longitude - point.longitude) < 0.00001
          ) {
            next.primary = place.name;
            if (place.address) next.secondary = place.address;
          }
          setAddress(next);
          setAddressPending(false);
        }
      })();
    }, 350);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [point.latitude, point.longitude, locating]);

  const selectPoint = (coordinate: MapPoint) => {
    setMoving(false);
    if (point.latitude === coordinate.latitude && point.longitude === coordinate.longitude) return;
    userSelected.current = true;
    setPoint(coordinate);
    setAddressPending(true);
  };
  const search = async (text: string, hub = '') => {
    if (!text.trim()) return;
    if (Platform.OS === 'web') {
      Alert.alert(
        '장소 검색',
        '장소 검색과 네이버 지도는 iOS·Android 개발 빌드에서 사용할 수 있어요.',
      );
      return;
    }
    const request = ++searchRequest.current;
    userSelected.current = true;
    setSearching(true);
    Keyboard.dismiss();
    try {
      const [result] = await searchPlaces(text.trim());
      if (request !== searchRequest.current) return;
      if (!result) {
        Alert.alert('검색 결과가 없어요', '도로명 주소나 지하철역 이름으로 다시 검색해 주세요.');
        return;
      }
      setSelectedHub(hub);
      selectedPlace.current = result;
      selectPoint({ latitude: result.latitude, longitude: result.longitude });
    } catch {
      if (request === searchRequest.current)
        Alert.alert('장소를 찾지 못했어요', '주소를 확인하고 다시 검색해 주세요.');
    } finally {
      if (request === searchRequest.current) setSearching(false);
    }
  };

  const canConfirm =
    Platform.OS !== 'web' && !locating && address.ready && !addressPending && !moving && !searching;
  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingLeft: insets.left, paddingRight: insets.right }}
    >
      <TopNavigation type="screen" title="교환 장소 설정" onBack={onClose} />
      <View className="px-4 pb-3 pt-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="장소, 지하철, 주소 검색 열기"
          onPress={() => setSearchOpen(true)}
          className="h-10 flex-row items-center gap-2 rounded-lg bg-[#F3F4F6] px-3"
        >
          <Icon icon={MagnifyingGlassIcon} size="lg" color="#99A1AF" />
          <Text
            numberOfLines={1}
            className={`flex-1 font-sans text-[16px] leading-[26px] ${query ? 'text-[#364153]' : 'text-[#99A1AF]'}`}
          >
            {query || '장소, 지하철, 주소 검색'}
          </Text>
          {searching && <ActivityIndicator size="small" color="#364153" />}
        </Pressable>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingTop: 12 }}
          keyboardShouldPersistTaps="handled"
        >
          {hubs.map((hub) => (
            <Chip
              key={hub.label}
              size="sm"
              hierarchy={selectedHub === hub.label ? 'primary' : 'secondary'}
              variant={selectedHub === hub.label ? 'solid' : 'outlined'}
              disabled={searching}
              onPress={() => {
                void search(hub.query, hub.label);
              }}
              className="!h-[38px] !px-3.5"
              style={{
                backgroundColor: selectedHub === hub.label ? '#364153' : '#FFFFFF',
                borderColor: '#D1D5DC',
              }}
            >
              {hub.label}
            </Chip>
          ))}
        </ScrollView>
      </View>
      <View className="flex-1 overflow-hidden">
        {locating ? (
          <View className="flex-1 items-center justify-center gap-3 bg-[#F3F4F6]">
            <ActivityIndicator color="#364153" />
            <Text className="font-sans text-[14px] text-[#6A7282]">
              현재 위치를 확인하고 있어요…
            </Text>
          </View>
        ) : (
          <MapCanvas
            point={point}
            userLocation={currentLocation}
            centerSelection
            onSelect={selectPoint}
            onCameraMove={() => {
              userSelected.current = true;
              setMoving(true);
            }}
          />
        )}
        <View pointerEvents="none" className="absolute left-0 right-0 top-8 items-center px-4">
          <View className="rounded-lg bg-[#364153] px-3 py-[7px]">
            <Text className="font-sans text-[14px] leading-5 text-white">
              {locating ? '현재 위치를 찾고 있어요' : '지도를 움직여서 선택해보세요'}
            </Text>
          </View>
        </View>
      </View>
      {!!locationError && (
        <Text className="px-4 pt-2 text-center font-sans text-[12px] leading-[18px] text-[#6A7282]">
          {locationError}
        </Text>
      )}
      <View className="gap-1 px-4 pb-2 pt-4">
        <Text
          numberOfLines={2}
          className="text-center font-sans text-[16px] leading-[22px] text-[#364153]"
        >
          {moving || addressPending ? '선택한 위치를 확인하고 있어요…' : address.primary}
        </Text>
        <Text
          numberOfLines={2}
          className="text-center font-sans text-[14px] leading-5 text-[#6A7282]"
        >
          {moving || addressPending ? '지도를 멈추면 주소가 표시돼요' : address.secondary}
        </Text>
      </View>
      <View className="px-4 pt-3" style={{ paddingBottom: 8 + insets.bottom }}>
        <Button
          hierarchy="primary"
          disabled={!canConfirm}
          onPress={() => onConfirm(address.primary, address.secondary, point)}
          className={`!h-[52px] self-stretch !rounded-xl ${canConfirm ? '!bg-[#364153]' : ''}`}
        >
          선택 완료
        </Button>
      </View>
      <Modal
        visible={searchOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setSearchOpen(false)}
      >
        {searchOpen && (
          <LocationSearch
            initialQuery={query}
            origin={currentLocation ?? point}
            onBack={() => setSearchOpen(false)}
            onSelect={(place) => {
              selectedPlace.current = place;
              searchRequest.current++;
              setSearching(false);
              setQuery(place.name);
              setSelectedHub('');
              selectPoint({ latitude: place.latitude, longitude: place.longitude });
              if (point.latitude === place.latitude && point.longitude === place.longitude) {
                setAddress({ primary: place.name, secondary: place.address, ready: true });
                setAddressPending(false);
              }
              setSearchOpen(false);
            }}
          />
        )}
      </Modal>
    </View>
  );
}
