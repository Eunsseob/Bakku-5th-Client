import { Button } from '@/shared/components/Button';
import { Icon } from '@/shared/components/Icon';
import { TextField } from '@/shared/components/TextField';
import { TopNavigation } from '@/shared/components/TopNavigation';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';
import { MapPinIcon } from 'phosphor-react-native/src/icons/MapPin';
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
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import LocationSelection from './LocationSelection';
import type { MapPoint } from './MapCanvas';

type ExchangePlaceProps = {
  location: string;
  detail: string;
  point?: MapPoint;
  onLocationChange: (location: string, detail: string, point?: MapPoint) => void;
  onDetailChange: (detail: string) => void;
  valid: boolean;
  onBack: () => void;
  onQuit: () => void;
  onSubmit: () => void;
};

export default function ExchangePlace(props: ExchangePlaceProps) {
  const insets = useSafeAreaInsets();
  const [locationOpen, setLocationOpen] = useState(false);

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
          accessibilityValue={{ min: 1, max: 5, now: 5 }}
          className="mt-[22px] flex-row gap-1"
        >
          {Array.from({ length: 5 }, (_, index) => (
            <View key={index} className="h-0.5 flex-1 rounded-full bg-[#4A5565]" />
          ))}
        </View>
        <Text
          style={{ includeFontPadding: false }}
          className="mt-[22px] font-sans text-[20px] leading-[26px] tracking-[-0.2px] text-[#030712]"
        >
          어디서 교환할까요?
        </Text>
        <View className="mt-8 gap-3">
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
            className="h-[50px] flex-row items-center gap-2 rounded-lg border border-[#D1D5DC] px-3.5"
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
        </View>
        <View className="mt-8">
          <TextField
            label="상세 주소"
            multiline
            placeholder="교환할 장소의 상세한 주소를 알려주세요."
            placeholderTextColor="#99A1AF"
            value={props.detail}
            onChangeText={props.onDetailChange}
            maxLength={500}
          />
        </View>
      </ScrollView>
      <View className="shrink-0 bg-white px-4 pt-3" style={{ paddingBottom: 8 + insets.bottom }}>
        <Button
          hierarchy="primary"
          disabled={!props.valid}
          onPress={props.onSubmit}
          className={`!h-[52px] self-stretch !rounded-xl ${props.valid ? '!bg-[#364153]' : ''}`}
        >
          작성 완료
        </Button>
      </View>
      <Modal
        visible={locationOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setLocationOpen(false)}
      >
        {locationOpen && (
          <SafeAreaProvider>
            <LocationSelection
              initialLocation={props.location}
              initialDetail={props.detail}
              initialPoint={props.point}
              onClose={() => setLocationOpen(false)}
              onConfirm={(location, _address, point) => {
                props.onLocationChange(location, props.detail, point);
                setLocationOpen(false);
              }}
            />
          </SafeAreaProvider>
        )}
      </Modal>
    </KeyboardAvoidingView>
  );
}
