import { Button } from '@/shared/components/Button';
import { Chip } from '@/shared/components/Chip';
import { Icon } from '@/shared/components/Icon';
import { TextField } from '@/shared/components/TextField';
import { Thumbnail } from '@/shared/components/Thumbnail';
import { TopNavigation } from '@/shared/components/TopNavigation';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';
import { XIcon } from 'phosphor-react-native/src/icons/X';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import PhotoSelection from './PhotoSelection';

type ExchangeGoodsProps = {
  tags: string[];
  onTagsPress: () => void;
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  title: string;
  onTitleChange: (title: string) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  condition: string;
  onConditionChange: (condition: string) => void;
  description: string;
  onDescriptionChange: (description: string) => void;
  onBack: () => void;
  onQuit: () => void;
  onNext: () => void;
};

export default function ExchangeGoods(props: ExchangeGoodsProps) {
  const insets = useSafeAreaInsets();
  const [photoPickerOpen, setPhotoPickerOpen] = useState(false);
  const valid =
    props.photos.length > 0 && !!props.title.trim() && !!props.category && !!props.condition;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
      style={{ paddingLeft: insets.left, paddingRight: insets.right }}
    >
      <TopNavigation
        type="screen"
        title="교환글 작성"
        onBack={props.onBack}
        trailingLabel="그만두기"
        onTrailingPress={props.onQuit}
      />
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
      >
        <View
          accessibilityRole="progressbar"
          accessibilityLabel="교환글 작성 단계"
          accessibilityValue={{ min: 1, max: 5, now: 3 }}
          className="mt-[22px] flex-row gap-1"
        >
          {Array.from({ length: 5 }, (_, index) => (
            <View
              key={index}
              className={`h-0.5 flex-1 rounded-full ${index < 3 ? 'bg-[#4A5565]' : 'bg-[#E5E7EB]'}`}
            />
          ))}
        </View>
        <Text
          style={{ includeFontPadding: false }}
          className="mt-[22px] font-sans text-[20px] leading-[26px] tracking-[-0.2px] text-[#030712]"
        >
          어떤 굿즈를 내놓을까요?
        </Text>
        <View className="mt-8 gap-3">
          <Text
            style={{ includeFontPadding: false }}
            className="font-sans text-[14px] leading-5 text-[#030712]"
          >
            사진
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ height: 74, flexGrow: 0, marginVertical: -5 }}
            contentContainerStyle={{
              gap: 8,
              alignItems: 'center',
              paddingVertical: 5,
              paddingRight: 5,
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`사진 선택, ${props.photos.length}/5장`}
              onPress={() => setPhotoPickerOpen(true)}
              style={{
                width: 66,
                height: 64,
                flexShrink: 0,
                padding: 0,
                borderWidth: 1,
                borderColor: '#D1D5DC',
                borderRadius: 12,
                backgroundColor: '#FFFFFF',
              }}
            >
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  left: 20,
                  top: 11,
                  width: 24,
                  height: 24,
                  flexShrink: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M14.5 4H9.5a1 1 0 0 0-1 1 2 2 0 0 1-2 2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-1.5a2 2 0 0 1-2-2 1 1 0 0 0-1-1Z"
                    stroke="#99A1AF"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Circle cx={12} cy={13} r={3} stroke="#99A1AF" strokeWidth={2} />
                </Svg>
              </View>
              <Text
                style={{
                  position: 'absolute',
                  left: 24,
                  top: 36,
                  includeFontPadding: false,
                  fontSize: 10,
                  lineHeight: 14,
                  textAlign: 'center',
                  width: 16,
                  height: 14,
                  letterSpacing: -0.1,
                  color: '#99A1AF',
                }}
                className="font-sans"
              >
                {props.photos.length}/5
              </Text>
            </Pressable>
            {props.photos.map((uri, index) => (
              <View key={uri} style={{ width: 64, height: 64, flexShrink: 0 }}>
                <Thumbnail
                  source={uri}
                  size={64}
                  cornerStyle="curved"
                  className="!rounded-xl !border-[#D1D5DC]"
                  accessibilityLabel={`굿즈 사진 ${index + 1}`}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`사진 ${index + 1} 삭제`}
                  hitSlop={6}
                  style={{
                    position: 'absolute',
                    left: 53,
                    top: -5,
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: '#364153',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() =>
                    props.onPhotosChange(props.photos.filter((photo) => photo !== uri))
                  }
                >
                  <Icon icon={XIcon} size="xs" weight="regular" color="#FFFFFF" />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>
        <View className="mt-8">
          <TextField
            label="제품명"
            placeholder="제품명을 입력해주세요."
            placeholderTextColor="#99A1AF"
            value={props.title}
            onChangeText={props.onTitleChange}
            maxLength={100}
          />
        </View>
        <View className="mt-8 gap-3">
          <Text className="font-sans text-[14px] leading-5 text-[#030712]">카테고리</Text>
          <View
            accessibilityRole="radiogroup"
            accessibilityLabel="카테고리"
            className="flex-row flex-wrap gap-2"
          >
            {['캐릭터', '아이돌', '스포츠', '기타'].map((label) => (
              <Chip
                key={label}
                size="sm"
                accessibilityRole="radio"
                accessibilityState={{ checked: props.category === label }}
                hierarchy={props.category === label ? 'primary' : 'secondary'}
                variant={props.category === label ? 'solid' : 'outlined'}
                onPress={() => props.onCategoryChange(label)}
                className="!h-[38px] !px-0"
                style={{
                  width: label === '기타' ? 53 : 65,
                  backgroundColor: props.category === label ? '#364153' : '#FFFFFF',
                  borderColor: '#D1D5DC',
                }}
              >
                {label}
              </Chip>
            ))}
          </View>
        </View>
        <View className="mt-8 gap-3">
          <Text className="font-sans text-[14px] leading-5 text-[#030712]">제품 상태</Text>
          <View
            accessibilityRole="radiogroup"
            accessibilityLabel="제품 상태"
            className="flex-row gap-2"
          >
            {['미개봉', '개봉'].map((label) => (
              <Chip
                key={label}
                size="sm"
                accessibilityRole="radio"
                accessibilityState={{ checked: props.condition === label }}
                hierarchy={props.condition === label ? 'primary' : 'secondary'}
                variant={props.condition === label ? 'solid' : 'outlined'}
                onPress={() => props.onConditionChange(label)}
                className="!h-[38px] !px-0"
                style={{
                  width: label === '미개봉' ? 65 : 53,
                  backgroundColor: props.condition === label ? '#364153' : '#FFFFFF',
                  borderColor: '#D1D5DC',
                }}
              >
                {label}
              </Chip>
            ))}
          </View>
        </View>
        <View className="mt-8 gap-3">
          <Text className="font-sans text-[14px] leading-5 tracking-[-0.14px] text-[#030712]">
            태그 (선택)
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`태그 추가, ${props.tags.length}/5개`}
            onPress={props.onTagsPress}
            className="h-[50px] flex-row items-center gap-2 rounded-lg border border-[#D1D5DC] px-3.5"
          >
            <Text
              numberOfLines={1}
              className={`flex-1 font-sans text-[16px] leading-[26px] ${props.tags.length ? 'text-[#030712]' : 'text-[#99A1AF]'}`}
            >
              {props.tags.length
                ? props.tags.map((tag) => `#${tag}`).join(' ')
                : '#제품명, #캐릭터명, #작품명'}
            </Text>
            <Icon icon={CaretRightIcon} size="xl" color="#364153" />
          </Pressable>
        </View>
        <View className="mt-8">
          <TextField
            label="자세한 설명"
            optional
            multiline
            placeholder="제품에 대한 구체적인 사항을 알려주세요."
            placeholderTextColor="#99A1AF"
            value={props.description}
            onChangeText={props.onDescriptionChange}
            maxLength={2000}
          />
        </View>
      </ScrollView>
      <View className="shrink-0 bg-white px-4 pt-3" style={{ paddingBottom: 8 + insets.bottom }}>
        <Button
          hierarchy="primary"
          disabled={!valid}
          onPress={props.onNext}
          className={`!h-[52px] self-stretch !rounded-xl ${valid ? '!bg-[#364153]' : ''}`}
        >
          다음
        </Button>
      </View>
      <Modal
        visible={photoPickerOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setPhotoPickerOpen(false)}
      >
        {photoPickerOpen && (
          <PhotoSelection
            initialPhotos={props.photos}
            onClose={() => setPhotoPickerOpen(false)}
            onConfirm={(photos) => {
              props.onPhotosChange(photos);
              setPhotoPickerOpen(false);
            }}
          />
        )}
      </Modal>
    </KeyboardAvoidingView>
  );
}
