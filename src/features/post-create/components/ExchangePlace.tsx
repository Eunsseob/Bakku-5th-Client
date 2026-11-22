import { Button, Icon, TextField, TopNavigation } from '@/shared/components';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';
import { MapPinIcon } from 'phosphor-react-native/src/icons/MapPin';
import { useRef, useState, type ComponentRef } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import LocationSelection from './LocationSelection';
import type { MapPoint } from '@/features/home/components/MapCanvas';

import ExchangeProgress, { type ExchangeProgressValue } from './ExchangeProgress';
import { useValidationScroll } from '../utils/useValidationScroll';

type ExchangePlaceProps = {
  editing?: boolean;
  progress: ExchangeProgressValue;
  location: string;
  detail: string;
  regionName: string;
  point?: MapPoint;
  onLocationChange: (location: string, regionName: string, point: MapPoint) => void;
  onDetailChange: (detail: string) => void;
  submitting: boolean;
  onBack: () => void;
  onQuit: () => void;
  onSubmit: () => void;
};

export default function ExchangePlace(props: ExchangePlaceProps) {
  const insets = useSafeAreaInsets();
  const [locationOpen, setLocationOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [locationTouched, setLocationTouched] = useState(false);
  const [detailTouched, setDetailTouched] = useState(false);
  const detailRef = useRef<ComponentRef<typeof TextInput>>(null);
  const { scrollRef, fieldLayout, focusError } = useValidationScroll<'location' | 'detail'>();
  const locationError =
    props.location.trim() && props.regionName && props.point
      ? undefined
      : '교환 장소를 선택해 주세요.';
  const showLocationError = (submitted || locationTouched) && locationError;
  const closeLocationPicker = () => {
    setLocationTouched(true);
    setLocationOpen(false);
  };
  const detailError =
    props.detail.trim().length === 1 ? '상세 주소는 2자 이상 입력해 주세요.' : undefined;
  const submit = () => {
    setSubmitted(true);
    if (locationError) focusError('location', locationError);
    else if (detailError) focusError('detail', detailError, detailRef.current);
    else props.onSubmit();
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
          어디서 교환할까요?
        </Text>
        <View onLayout={fieldLayout('location')} className="mt-8 gap-3">
          <Text
            style={{ includeFontPadding: false }}
            className="font-sans text-[14px] leading-5 text-[#030712]"
          >
            장소 설정
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              props.location ? `교환 장소 변경, ${props.location}` : '교환 희망 장소, 위치 추가'
            }
            onPress={() => setLocationOpen(true)}
            onBlur={() => setLocationTouched(true)}
            disabled={props.submitting}
            className={`h-[50px] flex-row items-center gap-2 rounded-lg border px-3.5 ${showLocationError ? 'border-theme-red-bold bg-theme-red-subtlest' : 'border-[#D1D5DC]'}`}
          >
            {!!props.location && <Icon icon={MapPinIcon} size="lg" color="#364153" />}
            <Text
              numberOfLines={1}
              className={`flex-1 font-sans text-[16px] leading-[26px] ${props.location ? 'text-[#364153]' : 'text-[#4A5565]'}`}
            >
              {props.location || '교환 희망 장소'}
            </Text>
            {!props.location && (
              <>
                <Text className="font-sans text-[12px] leading-[18px] text-[#99A1AF]">
                  위치 추가
                </Text>
                <Icon icon={CaretRightIcon} size="xl" color="#99A1AF" />
              </>
            )}
          </Pressable>
          {showLocationError && (
            <Text className="font-sans text-label-md text-theme-red-bold">{showLocationError}</Text>
          )}
        </View>
        <View onLayout={fieldLayout('detail')} className="mt-8">
          <TextField
            inputRef={detailRef}
            label="상세 주소"
            optional
            multiline
            placeholder="교환할 장소의 상세한 주소를 알려주세요."
            placeholderTextColor="#99A1AF"
            value={props.detail}
            onChangeText={props.onDetailChange}
            disabled={props.submitting}
            onBlur={() => setDetailTouched(true)}
            error={submitted || detailTouched ? detailError : undefined}
            maxLength={30}
          />
        </View>
      </ScrollView>
      <View className="shrink-0 bg-white px-4 pt-3" style={{ paddingBottom: 8 + insets.bottom }}>
        <Button
          hierarchy="primary"
          disabled={props.submitting}
          accessibilityState={{ busy: props.submitting }}
          onPress={submit}
          className={`!h-[52px] self-stretch !rounded-xl ${props.submitting ? '' : '!bg-[#9C43FF]'}`}
        >
          {props.editing
            ? props.submitting
              ? '저장 중…'
              : '저장'
            : props.submitting
              ? '등록 중…'
              : '작성 완료'}
        </Button>
      </View>
      <Modal
        visible={locationOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeLocationPicker}
      >
        {locationOpen && (
          <SafeAreaProvider>
            <LocationSelection
              initialLocation={props.location}
              initialDetail={props.detail}
              initialRegionName={props.regionName}
              initialPoint={props.point}
              onClose={closeLocationPicker}
              onConfirm={(location, regionName, point) => {
                props.onLocationChange(location, regionName, point);
                setLocationOpen(false);
              }}
            />
          </SafeAreaProvider>
        )}
      </Modal>
    </KeyboardAvoidingView>
  );
}
