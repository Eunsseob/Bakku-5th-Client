import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, FlatList, Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const font = { fontFamily: 'Pretendard', includeFontPadding: false };

export default function PhotoSelection({
  initialPhotos,
  onClose,
  onConfirm,
}: {
  initialPhotos: string[];
  onClose: () => void;
  onConfirm: (photos: string[]) => void;
}) {
  const insets = useSafeAreaInsets();
  const [photos, setPhotos] = useState(initialPhotos);
  const [selected, setSelected] = useState(initialPhotos);
  const [busy, setBusy] = useState(false);
  const [width, setWidth] = useState(360);
  const size = (width - 52) / 3;
  const addPhotos = async (camera: boolean) => {
    if (busy) return;
    if (selected.length >= 5) {
      Alert.alert('사진 선택', '사진은 최대 5장까지 선택할 수 있어요.');
      return;
    }
    setBusy(true);
    try {
      if (camera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('카메라 권한', '촬영하려면 설정에서 카메라 접근을 허용해 주세요.');
          return;
        }
      }
      const result = camera
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            orderedSelection: true,
            selectionLimit: 5 - selected.length,
            quality: 0.8,
          });
      if (!result.canceled) {
        const incoming = result.assets.map((asset) => asset.uri);
        setPhotos((previous) => [...new Set([...previous, ...incoming])]);
        setSelected((previous) => [...new Set([...previous, ...incoming])].slice(0, 5));
      }
    } catch {
      Alert.alert('사진 선택', '사진을 불러오지 못했어요. 다시 시도해 주세요.');
    } finally {
      setBusy(false);
    }
  };
  const toggle = (uri: string) => {
    if (selected.includes(uri)) setSelected(selected.filter((item) => item !== uri));
    else if (selected.length < 5) setSelected([...selected, uri]);
    else Alert.alert('사진 선택', '사진은 최대 5장까지 선택할 수 있어요.');
  };
  return (
    <View
      className="flex-1 bg-white"
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
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
          accessibilityLabel="사진 선택 취소"
          onPress={onClose}
          className="absolute left-2 h-11 w-11 items-center justify-center"
        >
          <Text style={font} className="text-[28px] text-[#2E2E33]">
            ‹
          </Text>
        </Pressable>
        <Text style={font} className="text-[16px] leading-[22px] text-[#2E2E33]">
          사진 선택
        </Text>
      </View>
      <Text style={font} className="mx-4 mb-3 mt-3 text-[12px] leading-[17px] text-[#737380]">
        실물을 직접 찍어주세요 · 첫 장이 대표 사진이 돼요
      </Text>
      <FlatList
        style={{ flex: 1 }}
        data={['camera', ...photos, 'album']}
        numColumns={3}
        keyExtractor={(item) => item}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20, gap: 10 }}
        columnWrapperStyle={{ gap: 10 }}
        renderItem={({ item }) => {
          if (item === 'camera' || item === 'album')
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={item === 'camera' ? '촬영' : '앨범에서 사진 추가'}
                disabled={busy || (item === 'camera' && Platform.OS === 'web')}
                onPress={() => addPhotos(item === 'camera')}
                style={{ width: size, height: size }}
                className="items-center justify-center rounded-lg border-2 border-[#BFBFC7] bg-[#F5F5F7] disabled:opacity-40"
              >
                <Text className="text-[20px]">{item === 'camera' ? '📷' : '+'}</Text>
                <Text style={font} className="text-[13px] leading-[18px] text-[#737380]">
                  {item === 'camera' ? '촬영' : '앨범에서 추가'}
                </Text>
              </Pressable>
            );
          const order = selected.indexOf(item);
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`사진${order >= 0 ? `, 선택 순서 ${order + 1}` : ''}`}
              accessibilityState={{ selected: order >= 0 }}
              onPress={() => toggle(item)}
              style={{ width: size, height: size }}
              className="overflow-hidden rounded-lg bg-[#E0E0E6]"
            >
              <Image source={item} style={{ width: '100%', height: '100%' }} contentFit="cover" />
              <View
                className={`absolute right-[6px] top-[6px] h-[22px] w-[22px] items-center justify-center rounded-full ${order >= 0 ? 'bg-[#2E2E33]' : 'border border-white bg-black/20'}`}
              >
                <Text style={font} className="text-[12px] text-white">
                  {order >= 0 ? order + 1 : ''}
                </Text>
              </View>
              {order === 0 && (
                <View className="absolute bottom-0 left-0 rounded-tr-lg bg-[#2E2E33] px-2 py-1">
                  <Text style={font} className="text-[11px] text-white">
                    대표
                  </Text>
                </View>
              )}
            </Pressable>
          );
        }}
      />
      <View
        className="shrink-0 bg-white px-4 pt-3"
        style={{ paddingBottom: Math.max(16, 38 - insets.bottom) }}
      >
        <Pressable
          accessibilityRole="button"
          disabled={busy || selected.length === 0}
          onPress={() => onConfirm(selected)}
          className="h-[52px] items-center justify-center rounded-[10px] bg-[#2E2E33] disabled:opacity-40"
        >
          <Text style={font} className="text-[15px] leading-[21px] text-white">
            선택 완료 ({selected.length})
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
