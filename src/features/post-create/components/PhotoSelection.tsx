import { BottomSheet } from '@/shared/components';
import { InteractionLayer } from '@/shared/components/decoration/InteractionLayer';
import * as ImagePicker from 'expo-image-picker';
import { CameraIcon } from 'phosphor-react-native/src/icons/Camera';
import { ImagesIcon } from 'phosphor-react-native/src/icons/Images';
import { useRef } from 'react';
import { Alert, Platform, Pressable, Text, View } from 'react-native';

const sources = [
  { type: 'album', label: '앨범에서 선택하기', icon: ImagesIcon },
  { type: 'camera', label: '카메라로 촬영하기', icon: CameraIcon },
] as const;

type PhotoSource = (typeof sources)[number]['type'];

export default function PhotoSelection({
  visible,
  photos,
  onClose,
  onPhotosChange,
}: {
  visible: boolean;
  photos: string[];
  onClose: () => void;
  onPhotosChange: (photos: string[]) => void;
}) {
  const pickerBusy = useRef(false);
  const pendingSource = useRef<PhotoSource | null>(null);

  const launchPicker = async (source: PhotoSource) => {
    try {
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('카메라 권한', '촬영하려면 설정에서 카메라 접근을 허용해 주세요.');
          return;
        }
      }
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsMultipleSelection: true,
              orderedSelection: true,
              selectionLimit: 5 - photos.length,
              quality: 1,
              preferredAssetRepresentationMode:
                ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Current,
            });
      if (!result.canceled) {
        const incoming = result.assets.map((asset) => asset.uri);
        onPhotosChange([...new Set([...photos, ...incoming])].slice(0, 5));
      }
    } catch {
      Alert.alert('사진 추가', '사진을 불러오지 못했어요. 다시 시도해 주세요.');
    } finally {
      pickerBusy.current = false;
    }
  };

  const chooseSource = (source: PhotoSource) => {
    if (pickerBusy.current) return;
    if (photos.length >= 5) {
      Alert.alert('사진 추가', '사진은 최대 5장까지 선택할 수 있어요.');
      return;
    }
    pickerBusy.current = true;
    if (Platform.OS === 'ios') pendingSource.current = source;
    onClose();
    if (Platform.OS !== 'ios') void launchPicker(source);
  };

  return (
    <BottomSheet
      visible={visible}
      minimumBottomInset={34}
      onRequestClose={onClose}
      onDismiss={() => {
        const source = pendingSource.current;
        pendingSource.current = null;
        if (source) void launchPicker(source);
      }}
      title="제품 사진 추가"
      description="사진을 추가할 방법을 선택하세요."
    >
      <View style={{ paddingBottom: 8 }}>
        {sources.map(({ type, label, icon: SourceIcon }) => (
          <Pressable
            key={type}
            accessibilityRole="button"
            disabled={type === 'camera' && Platform.OS === 'web'}
            onPress={() => chooseSource(type)}
            className="min-h-12 flex-row items-center justify-between gap-3 py-2 disabled:opacity-40"
          >
            {({ pressed }) => (
              <>
                <Text className="flex-1 font-sans text-[16px] leading-[22px] tracking-[-0.16px] text-[#232531]">
                  {label}
                </Text>
                <View className="h-5 w-5 shrink-0 items-center justify-center overflow-hidden">
                  <SourceIcon size={20} color="#000A3161" weight="regular" />
                </View>
                <InteractionLayer pressed={pressed} color="#000212D1" />
              </>
            )}
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}
