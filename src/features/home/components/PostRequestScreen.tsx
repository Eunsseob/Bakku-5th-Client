import { uploadPostImages } from '@/features/post-create/api/createPost';
import PhotoSelection from '@/features/post-create/components/PhotoSelection';
import { Button, Chip, Icon, TextField, Thumbnail, TopNavigation } from '@/shared/components';
import { CameraIcon } from 'phosphor-react-native/src/icons/Camera';
import { XIcon } from 'phosphor-react-native/src/icons/X';
import { useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSubmitExchange } from '../hooks/useSubmitExchange';

const conditions = ['미개봉', '개봉'] as const;

export function PostRequestScreen({
  postId,
  onBack,
  onQuit,
}: {
  postId: number;
  onBack: () => void;
  onQuit: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [photos, setPhotos] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [name, setName] = useState('');
  const [condition, setCondition] = useState<(typeof conditions)[number]>();
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { busy, submitExchange } = useSubmitExchange(postId);

  const submit = () => {
    setSubmitted(true);
    if (!photos.length || name.trim().length < 2 || !condition) return;
    Keyboard.dismiss();
    void submitExchange(async () => ({
      offerType: 'NEW',
      newItem: {
        imageKeys: await uploadPostImages(photos, 'EXCHANGE'),
        name: name.trim(),
        opened: condition === '개봉',
        description: description.trim() || null,
      },
    }));
  };

  const confirmLeaving = (leave: () => void) => {
    if (busy) return;
    if (!photos.length && !name && !condition && !description) {
      leave();
      return;
    }
    Alert.alert('작성을 그만둘까요?', '입력한 제품 정보가 사라져요.', [
      { text: '계속 작성', style: 'cancel' },
      { text: '그만두기', style: 'destructive', onPress: leave },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-surface-standard"
      style={{ paddingLeft: insets.left, paddingRight: insets.right }}
    >
      <TopNavigation
        type="screen"
        title="제품 정보 입력"
        onBack={() => confirmLeaving(onBack)}
        trailingLabel="그만두기"
        onTrailingPress={() => confirmLeaving(onQuit)}
      />
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 32, gap: 32 }}
      >
        <Text
          accessibilityRole="header"
          className="font-sans text-[24px] leading-8 tracking-[-0.48px] text-object-bold"
        >
          교환할 제품을 알려주세요.
        </Text>
        <View className="gap-3">
          <Text className="font-sans text-label-md font-semibold text-object-boldest">사진</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`사진 추가, ${photos.length}/5장`}
              onPress={() => setPickerOpen(true)}
              disabled={busy}
              className="h-16 w-16 items-center justify-center rounded-xl border border-stroke-alpha-subtle"
            >
              <Icon icon={CameraIcon} size="xl" color="#000B3A52" />
              <Text className="font-sans text-label-sm text-object-subtle">{photos.length}/5</Text>
            </Pressable>
            {photos.map((photo, index) => (
              <View key={photo}>
                <Thumbnail
                  source={photo}
                  size={64}
                  cornerStyle="curved"
                  accessibilityLabel={`제품 사진 ${index + 1}`}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`사진 ${index + 1} 삭제`}
                  hitSlop={6}
                  disabled={busy}
                  onPress={() => setPhotos((current) => current.filter((uri) => uri !== photo))}
                  className="absolute right-0 top-0 h-5 w-5 items-center justify-center rounded-full bg-fill-boldest"
                >
                  <Icon icon={XIcon} size="xs" color="#FFFFFF" />
                </Pressable>
              </View>
            ))}
          </ScrollView>
          {submitted && !photos.length && (
            <Text className="font-sans text-label-md text-theme-red-bold">
              사진을 한 장 이상 추가해 주세요.
            </Text>
          )}
        </View>
        <TextField
          label="제품명"
          accessibilityLabel="제품명"
          placeholder="제품명을 입력해주세요."
          value={name}
          onChangeText={setName}
          disabled={busy}
          maxLength={40}
          error={
            submitted && name.trim().length < 2 ? '제품명을 2자 이상 입력해 주세요.' : undefined
          }
        />
        <View className="gap-3">
          <Text className="font-sans text-label-md font-semibold text-object-boldest">
            상품 상태
          </Text>
          <View
            accessibilityRole="radiogroup"
            accessibilityLabel="상품 상태"
            className="flex-row gap-2"
          >
            {conditions.map((label) => (
              <Chip
                key={label}
                size="md"
                hierarchy={condition === label ? 'primary' : 'secondary'}
                variant={condition === label ? 'solid' : 'outlined'}
                accessibilityRole="radio"
                accessibilityState={{ checked: condition === label }}
                onPress={() => setCondition(label)}
                disabled={busy}
              >
                {label}
              </Chip>
            ))}
          </View>
          {submitted && !condition && (
            <Text className="font-sans text-label-md text-theme-red-bold">
              상품 상태를 선택해 주세요.
            </Text>
          )}
        </View>
        <TextField
          label="자세한 설명"
          accessibilityLabel="자세한 설명"
          optional
          multiline
          placeholder="제품에 대한 구체적인 사항을 알려주세요."
          value={description}
          onChangeText={setDescription}
          disabled={busy}
          maxLength={1000}
        />
      </ScrollView>
      <View className="px-4 pt-2.5" style={{ paddingBottom: 10 + insets.bottom }}>
        <Button className="self-stretch" disabled={busy} onPress={submit}>
          {busy ? '교환 요청 보내는 중…' : '교환 요청하기'}
        </Button>
      </View>
      <PhotoSelection
        visible={pickerOpen}
        photos={photos}
        onClose={() => setPickerOpen(false)}
        onPhotosChange={setPhotos}
      />
    </KeyboardAvoidingView>
  );
}
