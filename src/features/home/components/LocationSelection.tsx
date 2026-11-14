import { Chip } from '@/shared/components/Chip';
import { Icon } from '@/shared/components/Icon';
import { XIcon } from 'phosphor-react-native/src/icons/X';
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
  const [showMapHint, setShowMapHint] = useState(true);
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
      <View style={{ height: Math.max(34, insets.top), backgroundColor: '#FFFFFF' }} />
      <View
        style={{
          height: 44,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          backgroundColor: '#FFFFFF',
        }}
      >
        <Text
          className="font-sans"
          style={{
            position: 'absolute',
            left: 52,
            right: 52,
            textAlign: 'center',
            fontSize: 16,
            lineHeight: 22,
            fontWeight: '600',
            color: '#030712',
            includeFontPadding: false,
          }}
        >
          교환 장소 설정
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="교환 장소 설정 닫기"
          onPress={onClose}
          hitSlop={10}
          style={{ width: 24, height: 24 }}
        >
          <Icon icon={XIcon} size="xl" weight="bold" color="#030712" />
        </Pressable>
      </View>
      <View style={{ height: 110, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
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
          style={{ height: 50, flexGrow: 0 }}
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
              setShowMapHint(false);
              userSelected.current = true;
              setMoving(true);
            }}
          />
        )}
        {showMapHint && !locating && (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '50%',
              marginTop: -90,
              alignItems: 'center',
              paddingHorizontal: 16,
            }}
          >
            <View
              style={{
                borderRadius: 8,
                backgroundColor: '#364153',
                paddingHorizontal: 12,
                paddingVertical: 7,
              }}
            >
              <Text
                className="font-sans"
                style={{
                  fontSize: 14,
                  lineHeight: 20,
                  letterSpacing: -0.14,
                  color: '#FFFFFF',
                  textAlign: 'center',
                  includeFontPadding: false,
                }}
              >
                지도를 움직여서 선택해보세요
              </Text>
            </View>
          </View>
        )}
        {!!locationError && (
          <View
            style={{
              position: 'absolute',
              left: 16,
              right: 16,
              bottom: 32,
              padding: 8,
              borderRadius: 8,
              backgroundColor: '#FFFFFF',
            }}
          >
            <Text
              className="font-sans"
              style={{ fontSize: 12, lineHeight: 18, textAlign: 'center', color: '#6A7282' }}
            >
              {locationError}
            </Text>
          </View>
        )}
      </View>
      <View
        style={{
          marginTop: -24,
          flexShrink: 0,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          overflow: 'hidden',
          zIndex: 1,
          paddingHorizontal: 16,
          paddingTop: 16,
          backgroundColor: '#FFFFFF',
        }}
      >
        <View style={{ height: 44, flexShrink: 0, gap: 2, justifyContent: 'center' }}>
          <Text
            numberOfLines={1}
            className="text-center font-sans text-[16px] leading-[22px] text-[#364153]"
            style={{ letterSpacing: -0.16, includeFontPadding: false }}
          >
            {moving || addressPending ? '선택한 위치를 확인하고 있어요…' : address.primary}
          </Text>
          <Text
            numberOfLines={1}
            className="text-center font-sans text-[14px] leading-5 text-[#6A7282]"
            style={{ letterSpacing: -0.14, includeFontPadding: false }}
          >
            {moving || addressPending ? '지도를 멈추면 주소가 표시돼요' : address.secondary}
          </Text>
        </View>
        <View style={{ flexShrink: 0, paddingTop: 12, paddingBottom: 8 + insets.bottom }}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !canConfirm }}
            disabled={!canConfirm}
            onPress={() => onConfirm(address.primary, address.secondary, point)}
            style={{
              height: 52,
              flexShrink: 0,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: canConfirm ? '#364153' : '#D1D5DC',
            }}
          >
            <Text
              className="font-sans"
              style={{
                fontSize: 16,
                lineHeight: 22,
                letterSpacing: -0.16,
                color: canConfirm ? '#FFFFFF' : '#99A1AF',
                includeFontPadding: false,
              }}
            >
              선택 완료
            </Text>
          </Pressable>
        </View>
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
