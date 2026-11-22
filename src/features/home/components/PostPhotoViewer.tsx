import { Image, type ImageSource } from 'expo-image';
import { XIcon } from 'phosphor-react-native/src/icons/X';
import { useState } from 'react';
import { Modal, Pressable, View, useWindowDimensions } from 'react-native';
import {
  GestureDetector,
  GestureHandlerRootView,
  usePanGesture,
  usePinchGesture,
  useSimultaneousGestures,
  useTapGesture,
} from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

const clamp = (value: number, min: number, max: number) => {
  'worklet';
  return Math.min(max, Math.max(min, value));
};

function ZoomablePhoto({
  source,
  label,
  onPage,
}: {
  source: ImageSource;
  label: string;
  onPage: (direction: number) => void;
}) {
  const { width, height } = useWindowDimensions();
  const frameHeight = Math.min(width, height);
  const scale = useSharedValue(1);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const pinchStart = useSharedValue({ scale: 1, x: 0, y: 0, focalX: 0, focalY: 0 });
  const panStart = useSharedValue({ x: 0, y: 0, zoomed: false });
  const pinching = useSharedValue(false);
  const imageSize = useSharedValue({ width, height: frameHeight });

  const moveTo = (x: number, y: number, zoom: number) => {
    'worklet';
    const maxX = Math.max(0, (imageSize.value.width * zoom - width) / 2);
    const maxY = Math.max(0, (imageSize.value.height * zoom - height) / 2);
    offsetX.value = clamp(x, -maxX, maxX);
    offsetY.value = clamp(y, -maxY, maxY);
  };

  const pinch = usePinchGesture({
    onActivate: ({ focalX, focalY }) => {
      pinching.value = true;
      pinchStart.value = {
        scale: scale.value,
        x: offsetX.value,
        y: offsetY.value,
        focalX,
        focalY,
      };
    },
    onUpdate: ({ scale: factor, focalX, focalY }) => {
      const start = pinchStart.value;
      const zoom = clamp(start.scale * factor, 1, 4);
      const ratio = zoom / start.scale;
      scale.value = zoom;
      moveTo(
        focalX - width / 2 - (start.focalX - width / 2 - start.x) * ratio,
        focalY - height / 2 - (start.focalY - height / 2 - start.y) * ratio,
        zoom,
      );
    },
    onFinalize: () => {
      pinching.value = false;
    },
  });
  const pan = usePanGesture({
    maxPointers: 1,
    onActivate: () => {
      panStart.value = { x: offsetX.value, y: offsetY.value, zoomed: scale.value > 1 };
    },
    onUpdate: ({ translationX, translationY }) => {
      const start = panStart.value;
      if (!pinching.value && start.zoomed)
        moveTo(start.x + translationX, start.y + translationY, scale.value);
    },
    onDeactivate: ({ canceled, translationX, translationY }) => {
      if (
        !canceled &&
        !pinching.value &&
        !panStart.value.zoomed &&
        scale.value === 1 &&
        Math.abs(translationX) > Math.max(48, Math.abs(translationY))
      ) {
        scheduleOnRN(onPage, translationX < 0 ? 1 : -1);
      }
    },
  });
  const doubleTap = useTapGesture({
    numberOfTaps: 2,
    onDeactivate: ({ canceled }) => {
      if (canceled) return;
      const zoom = scale.value > 1 ? 1 : 2.5;
      offsetX.value = withTiming(0);
      offsetY.value = withTiming(0);
      scale.value = withTiming(zoom);
    },
  });
  const gesture = useSimultaneousGestures(pinch, pan, doubleTap);
  const imageTransform = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View
        collapsable={false}
        className="flex-1 items-center justify-center overflow-hidden"
        accessible
        accessibilityLabel={label}
        accessibilityRole="adjustable"
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={({ nativeEvent }) =>
          onPage(nativeEvent.actionName === 'increment' ? 1 : -1)
        }
      >
        <Animated.View style={[{ width, height: frameHeight }, imageTransform]}>
          <Image
            source={source}
            cachePolicy="none"
            contentFit="contain"
            style={{ flex: 1 }}
            onLoad={({ source: loaded }) => {
              if (!loaded.width || !loaded.height) return;
              const fit = Math.min(width / loaded.width, frameHeight / loaded.height);
              imageSize.value = { width: loaded.width * fit, height: loaded.height * fit };
            }}
          />
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

export default function PostPhotoViewer({
  photos,
  initialIndex,
  onClose,
}: {
  photos: ImageSource[];
  initialIndex: number;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(initialIndex);
  const activeIndex = Math.min(index, photos.length - 1);
  const current = photos[activeIndex];
  if (!current) return null;

  return (
    <Modal
      visible
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000000' }}>
        <ZoomablePhoto
          key={activeIndex}
          source={current}
          label={`굿즈 사진 ${activeIndex + 1} / ${photos.length}`}
          onPage={(direction) =>
            setIndex((currentIndex) =>
              clamp(Math.min(currentIndex, photos.length - 1) + direction, 0, photos.length - 1),
            )
          }
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="사진 닫기"
          onPress={onClose}
          className="absolute h-11 w-11 items-center justify-center rounded-full bg-black/50"
          style={{ top: insets.top + 8, right: insets.right + 16 }}
        >
          <XIcon size={24} color="#FFFFFF" />
        </Pressable>
        {photos.length > 1 && (
          <View
            pointerEvents="none"
            className="absolute inset-x-0 flex-row justify-center gap-2"
            style={{ bottom: Math.max(66, insets.bottom + 16) }}
          >
            {photos.map((_, dot) => (
              <View
                key={dot}
                className={`h-2 w-2 rounded-full ${dot === activeIndex ? 'bg-white' : 'bg-white/40'}`}
              />
            ))}
          </View>
        )}
      </GestureHandlerRootView>
    </Modal>
  );
}
