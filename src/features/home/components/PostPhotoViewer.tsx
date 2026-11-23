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
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets';

const clamp = (value: number, min: number, max: number) => {
  'worklet';
  return Math.min(max, Math.max(min, value));
};

function ZoomablePhotos({
  photos,
  activeIndex,
  onIndexChange,
}: {
  photos: ImageSource[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
}) {
  const { width, height } = useWindowDimensions();
  const frameHeight = Math.min(width, height);
  const scale = useSharedValue(1);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const pinchStart = useSharedValue({ scale: 1, x: 0, y: 0, focalX: 0, focalY: 0 });
  const panStart = useSharedValue({ x: 0, y: 0, zoomed: false, enabled: false });
  const pinching = useSharedValue(false);
  const pageIndex = useSharedValue(activeIndex);
  const pageDrag = useSharedValue(0);
  const changingPage = useSharedValue(false);
  const imageSizes = useSharedValue<Record<number, { width: number; height: number }>>({});
  const photoCount = photos.length;

  const changePage = (direction: number) => {
    'worklet';
    if (changingPage.value) return;
    const next = clamp(pageIndex.value + direction, 0, photoCount - 1);
    if (next === pageIndex.value) {
      pageDrag.value = withTiming(0, { duration: 180 });
      return;
    }

    changingPage.value = true;
    scale.value = withTiming(1, { duration: 200 });
    offsetX.value = withTiming(0, { duration: 200 });
    offsetY.value = withTiming(0, { duration: 200 });
    pageDrag.value = withTiming(pageIndex.value - next, { duration: 220 }, (finished) => {
      if (finished) {
        pageIndex.value = next;
        pageDrag.value = 0;
        scheduleOnRN(onIndexChange, next);
      }
      changingPage.value = false;
    });
  };

  const moveTo = (x: number, y: number, zoom: number) => {
    'worklet';
    const size = imageSizes.value[pageIndex.value];
    const fit = size ? Math.min(width / size.width, frameHeight / size.height) : 1;
    const maxX = Math.max(0, ((size ? size.width * fit : width) * zoom - width) / 2);
    const maxY = Math.max(0, ((size ? size.height * fit : frameHeight) * zoom - height) / 2);
    offsetX.value = clamp(x, -maxX, maxX);
    offsetY.value = clamp(y, -maxY, maxY);
  };

  const pinch = usePinchGesture({
    onActivate: ({ focalX, focalY }) => {
      if (changingPage.value) return;
      pinching.value = true;
      pageDrag.value = withTiming(0, { duration: 180 });
      pinchStart.value = {
        scale: scale.value,
        x: offsetX.value,
        y: offsetY.value,
        focalX,
        focalY,
      };
    },
    onUpdate: ({ scale: factor, focalX, focalY }) => {
      if (!pinching.value) return;
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
      panStart.value = {
        x: offsetX.value,
        y: offsetY.value,
        zoomed: scale.value > 1,
        enabled: !changingPage.value && !pinching.value,
      };
      if (panStart.value.enabled) cancelAnimation(pageDrag);
    },
    onUpdate: ({ translationX, translationY }) => {
      if (!panStart.value.enabled || changingPage.value || pinching.value) return;
      const start = panStart.value;
      if (start.zoomed) {
        moveTo(start.x + translationX, start.y + translationY, scale.value);
      } else if (scale.value === 1) {
        const draggingOutward =
          (pageIndex.value === 0 && translationX > 0) ||
          (pageIndex.value === photoCount - 1 && translationX < 0);
        pageDrag.value =
          Math.abs(translationX) > Math.abs(translationY)
            ? clamp(translationX / width, -1, 1) * (draggingOutward ? 0.2 : 1)
            : 0;
      }
    },
    onDeactivate: ({ canceled, translationX, translationY, velocityX }) => {
      if (!panStart.value.enabled || changingPage.value || pinching.value) return;
      if (
        !canceled &&
        !panStart.value.zoomed &&
        scale.value === 1 &&
        Math.abs(translationX) > Math.abs(translationY) &&
        (Math.abs(translationX) >= width * 0.2 ||
          (Math.abs(translationX) >= 12 &&
            Math.abs(velocityX) >= 650 &&
            translationX * velocityX > 0))
      ) {
        changePage(translationX < 0 ? 1 : -1);
      } else {
        pageDrag.value = withTiming(0, { duration: 180 });
      }
    },
  });
  const doubleTap = useTapGesture({
    numberOfTaps: 2,
    onDeactivate: ({ canceled }) => {
      if (canceled || changingPage.value) return;
      const zoom = scale.value > 1 ? 1 : 2.5;
      offsetX.value = withTiming(0);
      offsetY.value = withTiming(0);
      scale.value = withTiming(zoom);
    },
  });
  const gesture = useSimultaneousGestures(pinch, pan, doubleTap);
  const pageTransform = useAnimatedStyle(() => ({
    transform: [{ translateX: (pageDrag.value - pageIndex.value) * width }],
  }));
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
        accessibilityLabel={`굿즈 사진 ${activeIndex + 1} / ${photoCount}`}
        accessibilityRole="adjustable"
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={({ nativeEvent }) =>
          scheduleOnUI(changePage, nativeEvent.actionName === 'increment' ? 1 : -1)
        }
      >
        <Animated.View
          className="flex-row self-start"
          style={[{ width: width * photoCount, height: frameHeight }, pageTransform]}
        >
          {photos.map((source, index) => (
            <Animated.View
              key={index}
              style={[{ width, height: frameHeight }, index === activeIndex && imageTransform]}
            >
              <Image
                source={source}
                cachePolicy="memory"
                contentFit="contain"
                style={{ flex: 1 }}
                onLoad={({ source: loaded }) => {
                  const { width: imageWidth, height: imageHeight } = loaded;
                  if (!imageWidth || !imageHeight) return;
                  imageSizes.modify((sizes) => {
                    'worklet';
                    return { ...sizes, [index]: { width: imageWidth, height: imageHeight } };
                  });
                }}
              />
            </Animated.View>
          ))}
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
        <ZoomablePhotos photos={photos} activeIndex={activeIndex} onIndexChange={setIndex} />
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
