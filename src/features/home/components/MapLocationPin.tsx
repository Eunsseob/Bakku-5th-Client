import { MapPinIcon } from 'phosphor-react-native/src/icons/MapPin';
import { View } from 'react-native';

export default function MapLocationPin({ size = 56 }: { size?: number }) {
  const scale = size / 56;
  return (
    <View collapsable={false} style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          left: 18.67 * scale,
          top: 11.67 * scale,
          width: 21 * scale,
          height: 21 * scale,
          borderRadius: 10.5 * scale,
          backgroundColor: '#FFFFFF',
          zIndex: 0,
        }}
      />
      <View style={{ zIndex: 1 }}>
        <MapPinIcon size={size} weight="fill" color="#364153" />
      </View>
    </View>
  );
}
