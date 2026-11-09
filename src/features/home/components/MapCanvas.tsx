import { Text, View } from 'react-native';

export type MapPoint = { latitude: number; longitude: number };
export type MapCanvasProps = {
  point: MapPoint;
  onSelect?: (point: MapPoint) => void;
  preview?: boolean;
  initialZoom?: number;
  onZoomChange?: (zoom: number) => void;
};
export default function MapCanvas(_props: MapCanvasProps) {
  return (
    <View className="flex-1 items-center justify-center bg-[#F5F5F7]">
      <Text className="px-6 text-center text-[14px] text-[#737380]">
        네이버 지도는 iOS·Android 개발 빌드에서 사용할 수 있어요.
      </Text>
    </View>
  );
}
