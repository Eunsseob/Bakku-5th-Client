import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapCanvas, { type MapPoint } from './MapCanvas';
import { getQuickCurrentLocation } from '../utils/currentLocation';

export default function ExchangeMap() {
  const insets = useSafeAreaInsets();
  const [point, setPoint] = useState<MapPoint>();
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!permission.granted) return;
        const result = await getQuickCurrentLocation();
        if (active)
          setPoint({ latitude: result.coords.latitude, longitude: result.coords.longitude });
      } catch {
        // Show retry instead of a hardcoded starting location.
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [attempt]);
  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <Text className="px-5 py-4 font-sans text-[20px] text-[#2E2E33]">교환 지도</Text>
      {point ? (
        <MapCanvas point={point} onSelect={setPoint} />
      ) : (
        <View className="flex-1 items-center justify-center gap-3">
          <Text className="text-[14px] text-[#737380]">
            {loading ? '현재 위치를 확인하고 있어요…' : '현재 위치를 확인하지 못했어요.'}
          </Text>
          {!loading && (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setLoading(true);
                setAttempt((value) => value + 1);
              }}
              className="min-h-11 justify-center px-4"
            >
              <Text>다시 시도</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}
