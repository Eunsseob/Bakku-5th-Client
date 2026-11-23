import { Button, Chip, Icon, TextField, Thumbnail, TopNavigation } from '@/shared/components';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';
import { XIcon } from 'phosphor-react-native/src/icons/X';
import { useRef, useState, type ComponentProps, type ComponentRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import PhotoSelection from './PhotoSelection';
import { postCategories, type PostCategoryLabel } from '../api/createPost';

import ExchangeProgress, { type ExchangeProgressValue } from './ExchangeProgress';
import { useValidationScroll } from '../utils/useValidationScroll';

type ExchangeGoodsProps = {
  editing?: boolean;
  progress: ExchangeProgressValue;
  tags: string[];
  onTagsPress: () => void;
  photos: string[];
  getPhotoSource?: (photo: string) => ComponentProps<typeof Thumbnail>['source'];
  onPhotosChange: (photos: string[]) => void;
  title: string;
  onTitleChange: (title: string) => void;
  category: PostCategoryLabel | '';
  onCategoryChange: (category: PostCategoryLabel) => void;
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
  const [submitted, setSubmitted] = useState(false);
  const [titleTouched, setTitleTouched] = useState(false);
  const titleRef = useRef<ComponentRef<typeof TextInput>>(null);
  const { scrollRef, fieldLayout, focusError } = useValidationScroll<
    'photos' | 'title' | 'category' | 'condition'
  >();
  const titleLength = props.title.trim().length;
  const photoError = props.photos.length ? undefined : '제품 사진을 한 장 이상 추가해 주세요.';
  const titleError =
    titleLength === 0
      ? '제품명을 입력해 주세요.'
      : titleLength < 2 || titleLength > 40
        ? '제품명은 2~40자로 입력해 주세요.'
        : undefined;
  const categoryError = props.category ? undefined : '카테고리를 선택해 주세요.';
  const conditionError = props.condition ? undefined : '제품 상태를 선택해 주세요.';
  const next = () => {
    setSubmitted(true);
    if (photoError) focusError('photos', photoError);
    else if (titleError) focusError('title', titleError, titleRef.current);
    else if (categoryError) focusError('category', categoryError);
    else if (conditionError) focusError('condition', conditionError);
    else props.onNext();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
      style={{ paddingLeft: insets.left, paddingRight: insets.right }}
    >
      <TopNavigation
        type="screen"
        title={props.editing ? '교환글 수정' : '교환글 작성'}
        onBack={props.onBack}
        trailingLabel="그만두기"
        onTrailingPress={props.onQuit}
      />
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
      >
        <ExchangeProgress {...props.progress} />
        <Text
          style={{ includeFontPadding: false }}
          className="mt-[22px] font-sans text-[20px] leading-[26px] tracking-[-0.2px] text-[#030712]"
        >
          어떤 굿즈를 내놓을까요?
        </Text>
        <View onLayout={fieldLayout('photos')} className="mt-8 gap-3">
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
              onPress={() => {
                setPhotoPickerOpen(true);
              }}
              style={{
                width: 66,
                height: 64,
                flexShrink: 0,
                padding: 0,
                borderWidth: 1,
                borderColor: submitted && photoError ? '#EC0042' : '#D1D5DC',
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
                  source={props.getPhotoSource ? props.getPhotoSource(uri) : uri}
                  cachePolicy={props.editing ? 'none' : undefined}
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
          {submitted && photoError && (
            <Text className="font-sans text-label-md text-theme-red-bold">{photoError}</Text>
          )}
        </View>
        <View onLayout={fieldLayout('title')} className="mt-8">
          <TextField
            inputRef={titleRef}
            label="제품명"
            placeholder="제품명을 입력해주세요."
            placeholderTextColor="#99A1AF"
            value={props.title}
            onChangeText={props.onTitleChange}
            onBlur={() => setTitleTouched(true)}
            maxLength={40}
            error={submitted || titleTouched ? titleError : undefined}
          />
        </View>
        <View onLayout={fieldLayout('category')} className="mt-8 gap-3">
          <Text className="font-sans text-[14px] leading-5 text-[#030712]">카테고리</Text>
          <View
            accessibilityRole="radiogroup"
            accessibilityLabel="카테고리"
            className="flex-row flex-wrap gap-2"
          >
            {(Object.keys(postCategories) as PostCategoryLabel[]).map((label) => (
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
                  borderColor: submitted && categoryError ? '#EC0042' : '#D1D5DC',
                }}
              >
                {label}
              </Chip>
            ))}
          </View>
          {submitted && categoryError && (
            <Text className="font-sans text-label-md text-theme-red-bold">{categoryError}</Text>
          )}
        </View>
        <View onLayout={fieldLayout('condition')} className="mt-8 gap-3">
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
                  borderColor: submitted && conditionError ? '#EC0042' : '#D1D5DC',
                }}
              >
                {label}
              </Chip>
            ))}
          </View>
          {submitted && conditionError && (
            <Text className="font-sans text-label-md text-theme-red-bold">{conditionError}</Text>
          )}
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
            maxLength={1000}
          />
        </View>
      </ScrollView>
      <View className="shrink-0 bg-white px-4 pt-3" style={{ paddingBottom: 8 + insets.bottom }}>
        <Button
          hierarchy="primary"
          onPress={next}
          className="!h-[52px] self-stretch !rounded-xl !bg-[#364153]"
        >
          다음
        </Button>
      </View>
      <PhotoSelection
        visible={photoPickerOpen}
        photos={props.photos}
        onClose={() => setPhotoPickerOpen(false)}
        onPhotosChange={props.onPhotosChange}
      />
    </KeyboardAvoidingView>
  );
}
