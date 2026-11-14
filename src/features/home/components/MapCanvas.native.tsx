import {
  NaverMapMarkerOverlay,
  NaverMapView,
  type NaverMapViewRef,
} from '@mj-studio/react-native-naver-map';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { MapPinIcon } from 'phosphor-react-native/src/icons/MapPin';
import type { MapCanvasProps, MapPoint } from './MapCanvas';
import { getQuickCurrentLocation } from '../utils/currentLocation';

export default function MapCanvas({
  point,
  onSelect,
  preview = false,
  initialZoom = 15,
  onZoomChange,
  centerSelection = false,
  onCameraMove,
  userLocation,
}: MapCanvasProps) {
  const map = useRef<NaverMapViewRef>(null);
  const [initialCamera] = useState(() => ({ ...point, zoom: initialZoom }));
  const zoom = useRef(initialZoom);
  const cameraCenter = useRef(point);
  useEffect(() => {
    if (
      preview ||
      (centerSelection &&
        (cameraCenter.current.latitude !== point.latitude ||
          cameraCenter.current.longitude !== point.longitude))
    )
      map.current?.animateCameraTo({
        latitude: point.latitude,
        longitude: point.longitude,
        duration: 200,
      });
  }, [preview, centerSelection, point.latitude, point.longitude]);
  const [locating, setLocating] = useState(false);
  const [myLocation, setMyLocation] = useState<MapPoint>();
  useEffect(() => {
    if (preview) return;
    let active = true;
    let subscription: Location.LocationSubscription | undefined;
    void (async () => {
      try {
        const permission = await Location.getForegroundPermissionsAsync();
        if (!permission.granted || !active) return;
        const current = await getQuickCurrentLocation();
        if (!active) return;
        setMyLocation({ latitude: current.coords.latitude, longitude: current.coords.longitude });
        const watcher = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, distanceInterval: 10, timeInterval: 5000 },
          (position) => {
            if (active)
              setMyLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
          },
        );
        if (active) subscription = watcher;
        else watcher.remove();
      } catch {
        // The explicit current-location button retains the permission/error flow.
      }
    })();
    return () => {
      active = false;
      subscription?.remove();
    };
  }, [preview]);
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
        locationOverlay={
          myLocation || userLocation
            ? { isVisible: true, position: myLocation ?? userLocation! }
            : undefined
        }
        initialCamera={initialCamera}
        isShowZoomControls={false}
        onCameraChanged={(camera) => {
          cameraCenter.current = { latitude: camera.latitude, longitude: camera.longitude };
          if (centerSelection && camera.reason === 'Gesture') onCameraMove?.();
          if (camera.zoom === undefined) return;
          zoom.current = camera.zoom;
          onZoomChange?.(camera.zoom);
        }}
        onCameraIdle={
          centerSelection
            ? (camera) => {
                const coordinate = { latitude: camera.latitude, longitude: camera.longitude };
                cameraCenter.current = coordinate;
                onSelect?.(coordinate);
              }
            : undefined
        }
        isScrollGesturesEnabled={!preview}
        isZoomGesturesEnabled={!preview}
        onTapMap={onSelect}
        onTapSymbol={(symbol) => onSelect?.(symbol)}
      >
        {!centerSelection && !preview && (
          <NaverMapMarkerOverlay
            latitude={point.latitude}
            longitude={point.longitude}
            caption={{ text: '선택한 위치' }}
          />
        )}
      </NaverMapView>
      {centerSelection && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 56,
            height: 56,
            transform: [{ translateX: -28 }, { translateY: -56 }],
          }}
        >
          <View
            style={{
              position: 'absolute',
              left: 18.67,
              top: 11.67,
              width: 21,
              height: 21,
              borderRadius: 10.5,
              backgroundColor: '#FFFFFF',
              zIndex: 0,
            }}
          />
          <View style={{ zIndex: 1 }}>
            <MapPinIcon size={56} weight="fill" color="#364153" />
          </View>
        </View>
      )}
      {!preview && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="내 위치로 이동"
          accessibilityState={{ busy: locating, disabled: locating }}
          disabled={locating}
          onPress={moveToMyLocation}
          style={{
            position: 'absolute',
            right: 16,
            // The selection panel overlaps the map by 24px.
            bottom: centerSelection ? 40 : 16,
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          {locating ? (
            <ActivityIndicator color="#2E2E33" />
          ) : (
            <Svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#364153"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <Circle cx={12} cy={12} r={9} />
              <Line x1={12} y1={3} x2={12} y2={6} />
              <Line x1={12} y1={18} x2={12} y2={21} />
              <Line x1={3} y1={12} x2={6} y2={12} />
              <Line x1={18} y1={12} x2={21} y2={12} />
              <Circle cx={12} cy={12} r={1} fill="#364153" stroke="none" />
            </Svg>
          )}
        </Pressable>
      )}
    </View>
  );
}
