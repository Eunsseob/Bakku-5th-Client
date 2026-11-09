import MapCanvas, { type MapPoint } from './MapCanvas';
import * as Location from 'expo-location';
import { getQuickCurrentLocation } from '../utils/currentLocation';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const font = { fontFamily: 'Pretendard', includeFontPadding: false };
const hubs = [
  { name: '홍대', places: ['홍대입구역 9번 출구', '홍대 가챠샵'] },
  { name: '용산', places: ['용산역', '아이파크몰'] },
  { name: '건대·성수', places: ['건대입구역', '성수역'] },
  { name: '신도림', places: ['신도림역', '테크노마트'] },
  { name: '국전', places: ['남부터미널역', '국제전자센터'] },
];
const inputClass =
  'h-12 rounded-lg border-2 border-[#BFBFC7] px-3 text-[14px] leading-5 text-[#2E2E33]';

export default function LocationSelection({
  initialLocation,
  initialDetail,
  initialPoint,
  onClose,
  onConfirm,
}: {
  initialLocation: string;
  initialDetail: string;
  initialPoint?: MapPoint;
  onClose: () => void;
  onConfirm: (location: string, detail: string, point?: MapPoint) => void;
}) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [mapOpen, setMapOpen] = useState(false);
  const [mapZoom, setMapZoom] = useState(15);
  const [point, setPoint] = useState<MapPoint | undefined>(initialPoint);
  const [confirmedPoint, setConfirmedPoint] = useState<MapPoint | undefined>(initialPoint);
  const [locating, setLocating] = useState(() => !initialPoint && !initialLocation);
  const [selected, setSelected] = useState(initialLocation);
  const [detail, setDetail] = useState(initialDetail);
  const userSelected = useRef(false);
  useEffect(() => {
    if (initialPoint || initialLocation) return;
    let active = true;
    void (async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!permission.granted) return;
        const result = await getQuickCurrentLocation();
        if (!active || userSelected.current) return;
        const coordinate = { latitude: result.coords.latitude, longitude: result.coords.longitude };
        setPoint(coordinate);
        setConfirmedPoint(coordinate);
        setSelected('현재 위치');
        setDetail(`${coordinate.latitude.toFixed(5)}, ${coordinate.longitude.toFixed(5)}`);
      } catch {
        // Keep the map empty so an unrelated location cannot be mistaken for GPS.
      } finally {
        if (active) setLocating(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [initialPoint, initialLocation]);
  const useCurrentLocation = async () => {
    if (locating) return;
    setLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('위치 권한이 필요해요', '설정에서 위치 접근을 허용해 주세요.', [
          { text: '취소', style: 'cancel' },
          {
            text: '설정 열기',
            onPress: () => {
              void Linking.openSettings();
            },
          },
        ]);
        return;
      }
      if (!(await Location.hasServicesEnabledAsync())) {
        if (Platform.OS === 'android') {
          // Ask Android to resolve provider settings rather than stopping on a
          // provider check that can disagree with the quick-settings toggle.
          await Location.enableNetworkProviderAsync();
        } else {
          Alert.alert(
            '위치 서비스를 사용할 수 없어요',
            '설정에서 이 앱의 위치 서비스 접근을 확인해 주세요.',
          );
          return;
        }
      }
      const result = await getQuickCurrentLocation();
      const coordinate = { latitude: result.coords.latitude, longitude: result.coords.longitude };
      setPoint(coordinate);
      setConfirmedPoint(coordinate);
      setSelected('현재 위치');
      setDetail(`${coordinate.latitude.toFixed(5)}, ${coordinate.longitude.toFixed(5)}`);
    } catch (error) {
      const code =
        typeof error === 'object' && error !== null && 'code' in error
          ? String(error.code)
          : 'UNKNOWN';
      console.warn('Current location request failed:', code);
      const message =
        code === 'ERR_LOCATION_SETTINGS_UNSATISFIED'
          ? 'Android 위치 서비스 활성화가 완료되지 않았어요. 위치 정확도 설정을 확인해 주세요.'
          : code === 'ERR_LOCATION_UNAUTHORIZED'
            ? 'Bakku의 위치 권한이 허용되지 않았어요. 앱 설정에서 위치 접근을 허용해 주세요.'
            : '현재 위치를 확인하지 못했어요. 아래 오류 코드로 원인을 확인할 수 있어요.';
      Alert.alert('위치를 가져오지 못했어요', `${message}\n오류 코드: ${code}`, [
        { text: '확인', style: 'cancel' },
        {
          text: '앱 설정',
          onPress: () => {
            void Linking.openSettings();
          },
        },
      ]);
    } finally {
      setLocating(false);
    }
  };
  const results = hubs.filter((hub) =>
    `${hub.name} ${hub.places.join(' ')}`.includes(query.trim()),
  );
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <View className="h-16 items-center justify-center border-b border-[#E0E0E6]">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="희망 장소 선택 취소"
          onPress={onClose}
          className="absolute left-2 h-11 w-11 items-center justify-center"
        >
          <Text style={font} className="text-[28px] text-[#2E2E33]">
            ‹
          </Text>
        </Pressable>
        <Text style={font} className="text-[16px] leading-[22px] text-[#2E2E33]">
          희망 장소
        </Text>
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }}
      >
        <TextInput
          accessibilityLabel="장소 검색"
          value={query}
          onChangeText={setQuery}
          placeholder="⌕ 장소 검색 (역 · 매장 이름)"
          placeholderTextColor="#737380"
          style={font}
          className={inputClass}
          returnKeyType="search"
        />
        <Pressable
          accessibilityRole="button"
          disabled={locating}
          accessibilityState={{ busy: locating }}
          onPress={useCurrentLocation}
          className="mt-2 h-11 items-center justify-center rounded-[10px] border-2 border-[#BFBFC7]"
        >
          <Text style={font} className="text-[15px] leading-[21px] text-[#2E2E33]">
            {locating ? '현재 위치를 확인하고 있어요…' : '📍 현재 위치로 설정'}
          </Text>
        </Pressable>
        <Text style={font} className="mb-2 mt-[18px] text-[13px] leading-[18px] text-[#737380]">
          거점
        </Text>
        <View accessibilityRole="radiogroup">
          {results.map((hub) => (
            <Pressable
              key={hub.name}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected === hub.name }}
              onPress={() => {
                userSelected.current = true;
                setSelected(hub.name);
                setConfirmedPoint(undefined);
                setDetail('');
              }}
              className="h-11 flex-row items-center gap-3"
            >
              <View
                className={`h-5 w-5 rounded-full ${selected === hub.name ? 'bg-[#2E2E33]' : 'border-2 border-[#BFBFC7] bg-white'}`}
              />
              <Text style={font} className="text-[15px] leading-[21px] text-[#2E2E33]">
                {hub.name}
              </Text>
            </Pressable>
          ))}
        </View>
        {results.length === 0 && (
          <Text style={font} className="py-4 text-[13px] text-[#737380]">
            검색 결과가 없어요. 다른 역·매장 이름으로 검색해 주세요.
          </Text>
        )}
        <Text style={font} className="mb-2 mt-[18px] text-[13px] leading-[18px] text-[#737380]">
          또는 지도에서 위치 선택
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="네이버 지도 열기"
          onPress={() => setMapOpen(true)}
          className="h-[150px] items-center justify-center rounded-[10px] bg-[#E0E0E6]"
        >
          <View pointerEvents="none" style={{ width: '100%', height: '100%' }}>
            {point ? (
              <MapCanvas point={confirmedPoint ?? point} preview />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Text style={font} className="text-[13px] text-[#737380]">
                  {locating
                    ? '현재 위치를 확인하고 있어요…'
                    : '현재 위치로 설정을 눌러 위치를 확인해 주세요'}
                </Text>
              </View>
            )}
          </View>
        </Pressable>
        <TextInput
          accessibilityLabel="만날 곳 이름"
          value={detail}
          onChangeText={setDetail}
          maxLength={100}
          placeholder="만날 곳 이름 (예: 홍대입구역 9번 출구)"
          placeholderTextColor="#737380"
          style={font}
          className={`${inputClass} mt-3`}
        />
        <Pressable
          accessibilityRole="button"
          disabled={!selected || locating}
          onPress={() => onConfirm(selected, detail.trim(), confirmedPoint)}
          className="mt-7 h-[52px] items-center justify-center rounded-[10px] bg-[#2E2E33]"
        >
          <Text style={font} className="text-[15px] leading-[21px] text-white">
            이 위치로 설정
          </Text>
        </Pressable>
      </ScrollView>
      <Modal
        visible={mapOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setMapOpen(false)}
      >
        <View
          className="flex-1 bg-white"
          style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        >
          <View className="h-16 flex-row items-center px-4">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="지도 닫기"
              onPress={() => setMapOpen(false)}
              className="h-11 w-11 items-center justify-center"
            >
              <Text className="text-[26px]">‹</Text>
            </Pressable>
            <Text style={font} className="text-[16px]">
              지도에서 위치 선택
            </Text>
          </View>
          {mapOpen && point && (
            <MapCanvas
              point={point}
              onSelect={setPoint}
              initialZoom={mapZoom}
              onZoomChange={setMapZoom}
            />
          )}
          <View className="p-4">
            <Text style={font} className="mb-3 text-[12px] text-[#737380]">
              지도를 눌러 만날 위치를 선택해 주세요.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                if (!point) return;
                setSelected('지도 선택');
                setConfirmedPoint(point);
                setDetail(`${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}`);
                setMapOpen(false);
              }}
              className="h-[52px] items-center justify-center rounded-[10px] bg-[#2E2E33]"
            >
              <Text style={font} className="text-[15px] text-white">
                이 위치 선택
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
