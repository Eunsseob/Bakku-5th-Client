import {
  NaverMapMarkerOverlay,
  NaverMapView,
  type NaverMapViewRef,
} from '@mj-studio/react-native-naver-map';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import type { MapCanvasProps, MapPoint } from './MapCanvas';
import { getQuickCurrentLocation } from '../utils/currentLocation';

export default function MapCanvas({
  point,
  onSelect,
  preview = false,
  initialZoom = 15,
  onZoomChange,
}: MapCanvasProps) {
  const map = useRef<NaverMapViewRef>(null);
  const initialCamera = useRef({ ...point, zoom: initialZoom });
  const zoom = useRef(initialZoom);
  useEffect(() => {
    if (preview) map.current?.animateCameraTo({ ...point, duration: 200 });
  }, [preview, point.latitude, point.longitude]);
  const [locating, setLocating] = useState(false);
  const [myLocation, setMyLocation] = useState<MapPoint>();
  const moveToMyLocation = async () => {
    if (locating) return;
    setLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('위치 권한이 필요해요', 'Bakku의 위치 접근을 허용해 주세요.', [
          { text: '취소', style: 'cancel' },
          {
            text: '설정',
            onPress: () => {
              void Linking.openSettings();
            },
          },
        ]);
        return;
      }
      const result = await getQuickCurrentLocation();
      const coordinate = { latitude: result.coords.latitude, longitude: result.coords.longitude };
      setMyLocation(coordinate);
      onSelect?.(coordinate);
      map.current?.animateCameraTo({ ...coordinate, zoom: zoom.current, duration: 250 });
    } catch (error) {
      const code =
        typeof error === 'object' && error !== null && 'code' in error
          ? String(error.code)
          : 'UNKNOWN';
      Alert.alert(
        '현재 위치를 가져오지 못했어요',
        `잠시 후 다시 시도해 주세요.\n오류 코드: ${code}`,
      );
    } finally {
      setLocating(false);
    }
  };
  return (
    <View style={{ flex: 1 }}>
      <NaverMapView
        ref={map}
        style={{ flex: 1 }}
        locationOverlay={myLocation ? { isVisible: true, position: myLocation } : undefined}
        initialCamera={initialCamera.current}
        onCameraChanged={(camera) => {
          if (camera.zoom === undefined) return;
          zoom.current = camera.zoom;
          onZoomChange?.(camera.zoom);
        }}
        isScrollGesturesEnabled={!preview}
        isZoomGesturesEnabled={!preview}
        onTapMap={onSelect}
        onTapSymbol={(symbol) => onSelect?.(symbol)}
      >
        <NaverMapMarkerOverlay
          latitude={point.latitude}
          longitude={point.longitude}
          caption={{ text: '선택한 위치' }}
        />
      </NaverMapView>
      {!preview && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="내 위치로 이동"
          accessibilityState={{ busy: locating, disabled: locating }}
          disabled={locating}
          onPress={moveToMyLocation}
          className="absolute bottom-6 right-4 h-12 w-12 items-center justify-center rounded-full border border-[#E0E0E6] bg-white shadow-md"
        >
          {locating ? (
            <ActivityIndicator color="#2E2E33" />
          ) : (
            <Svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2E2E33"
              strokeWidth={1.8}
            >
              <Circle cx={12} cy={12} r={7} />
              <Circle cx={12} cy={12} r={2.5} fill="#2E2E33" stroke="none" />
              <Line x1={12} y1={1} x2={12} y2={5} />
              <Line x1={12} y1={19} x2={12} y2={23} />
              <Line x1={1} y1={12} x2={5} y2={12} />
              <Line x1={19} y1={12} x2={23} y2={12} />
            </Svg>
          )}
        </Pressable>
      )}
    </View>
  );
}
