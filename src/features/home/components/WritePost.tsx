import LocationSelection from './LocationSelection';
import type { MapPoint } from './MapCanvas';
import { Image } from 'expo-image';
import PhotoSelection from './PhotoSelection';
import { router, Stack } from 'expo-router';
import { useRef, useState, type ComponentRef, type ReactNode } from 'react';
import {
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useExchangeStore } from '../store/useExchangeStore';

const font = { fontFamily: 'Pretendard', includeFontPadding: false };
const inputClass =
  'h-12 rounded-lg border-2 border-[#BFBFC7] bg-white px-3 text-[14px] text-[#2E2E33]';
function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <View className="mt-[22px]">
      <View className="mb-[6px] flex-row items-center gap-2">
        <Text style={font} className="text-[14px] leading-5 text-[#2E2E33]">
          {label}
        </Text>
        {hint && (
          <Text style={font} className="text-[12px] text-[#737380]">
            {hint}
          </Text>
        )}
      </View>
      {children}
    </View>
  );
}
function Choices({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string[];
  onSelect: (value: string) => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((value) => (
        <Pressable
          key={value}
          accessibilityRole="button"
          accessibilityState={{ selected: selected.includes(value) }}
          onPress={() => onSelect(value)}
          className={`h-[34px] items-center justify-center rounded-full border-2 px-3 ${selected.includes(value) ? 'border-[#2E2E33] bg-[#2E2E33]' : 'border-[#BFBFC7] bg-white'}`}
        >
          <Text
            style={font}
            className={`text-[13px] leading-[18px] ${selected.includes(value) ? 'text-white' : 'text-[#2E2E33]'}`}
          >
            {value}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function WritePost() {
  const tagInputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const tagScrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const insets = useSafeAreaInsets();
  const addPost = useExchangeStore((state) => state.addPost);
  const [photos, setPhotos] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [wanted, setWanted] = useState('');
  const [anyItem, setAnyItem] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState('');
  const [locationDetail, setLocationDetail] = useState('');
  const [locationPoint, setLocationPoint] = useState<MapPoint>();
  const [locationOpen, setLocationOpen] = useState(false);
  const [onsite, setOnsite] = useState(false);
  const [duration, setDuration] = useState('30분');
  const [customMinutes, setCustomMinutes] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [photoSelectionVisible, setPhotoSelectionVisible] = useState(false);
  const minutes =
    duration === '직접 설정' ? Number(customMinutes) : Number(duration.replace('분', ''));
  const valid =
    photos.length > 0 &&
    !!title.trim() &&
    !!category &&
    (anyItem || !!wanted.trim()) &&
    !!location &&
    (!onsite || (Number.isInteger(minutes) && minutes > 0 && minutes <= 1440));
  const addTags = (value: string) => {
    const next = [...new Set([...tags, ...value.split(/[\s#]+/).filter(Boolean)])];
    if (next.length > 5) {
      setError('태그는 최대 5개까지 추가할 수 있어요.');
      return;
    }
    setTags(next);
    setTagInput('');
    setError('');
  };
  const submit = () => {
    if (!valid) return;
    const finalTags = [...new Set([...tags, ...tagInput.split(/[\s#]+/).filter(Boolean)])];
    if (finalTags.length > 5) {
      setError('태그는 최대 5개까지 추가할 수 있어요.');
      return;
    }
    addPost({
      title: title.trim(),
      category,
      wanted: anyItem ? '상관없음' : wanted.trim(),
      photos,
      tags: finalTags,
      condition: conditions,
      quantity,
      location,
      locationDetail,
      locationPoint,
      onsite,
      remaining: onsite ? minutes : 0,
      minutes: 0,
      distance: 0,
      description: description.trim(),
    });
    router.back();
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View className="h-16 items-center justify-center border-b border-[#E0E0E6]">
        <Text style={font} className="text-[16px] leading-[22px] text-[#2E2E33]">
          교환글 작성
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          onPress={() => router.back()}
          className="absolute left-2 h-11 w-11 items-center justify-center"
        >
          <Text style={font} className="text-[28px] text-[#2E2E33]">
            ‹
          </Text>
        </Pressable>
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 32 }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, alignItems: 'center' }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`사진 추가, ${photos.length}/5`}

            onPress={() => setPhotoSelectionVisible(true)}
            className="h-[72px] w-[72px] items-center justify-center rounded-lg border-2 border-[#BFBFC7] bg-[#F5F5F7]"
          >
            <Text className="text-[20px]">📷</Text>
            <Text style={font} className="text-[12px] leading-[17px] text-[#737380]">
              {photos.length}/5
            </Text>
          </Pressable>
          {photos.map((uri, index) => (
            <View key={`${uri}-${index}`}>
              <Image source={uri} style={{ width: 72, height: 72, borderRadius: 8 }} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`사진 ${index + 1} 삭제`}
                onPress={() => setPhotos(photos.filter((_, i) => i !== index))}
                className="absolute right-0 top-0 h-8 w-8 items-center justify-center rounded-full bg-black/60"
              >
                <Text className="text-white">×</Text>
              </Pressable>
            </View>
          ))}
          {photos.length === 0 && (
            <Text style={font} className="text-[12px] text-[#D93333]">
              사진을 1장 이상 올려주세요
            </Text>
          )}
        </ScrollView>
        <Field label="제목">
          <TextInput
            accessibilityLabel="제목"
            style={font}
            className={inputClass}
            placeholder="예) 치이카와 하치와레 가챠 키링"
            placeholderTextColor="#737380"
            value={title}
            onChangeText={setTitle}
            maxLength={80}
          />
          <Text style={font} className="mt-1 text-[11px] leading-[15px] text-[#737380]">
            작품명 · 캐릭터명은 태그로도 달아주세요
          </Text>
        </Field>
        <Field label="카테고리">
          <Choices
            options={['애니메이션', '아이돌(케이팝)', '스포츠', '기타']}
            selected={[category]}
            onSelect={setCategory}
          />
        </Field>
        <View className="mt-[22px]">
          <View className="mb-[9px] flex-row items-center">
            <Text style={font} className="text-[14px] leading-[17px] text-[#2E2E33]">
              태그
            </Text>
            <Text style={font} className="ml-2 text-[12px] leading-[14px] text-[#737380]">
              선택 · 최대 5개
            </Text>
            <Text style={font} className="ml-auto text-[12px] leading-[14px] text-[#737380]">
              {tags.length}/5
            </Text>
          </View>
          <Pressable
            onPress={() => tagInputRef.current?.focus()}
            accessible={false}
            className="h-12 flex-row items-center rounded-lg border-2 border-[#BFBFC7] bg-white pl-2 pr-[10px]"
          >
            <ScrollView
              ref={tagScrollRef}
              horizontal
              style={{ flex: 1 }}
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ flexGrow: 1, alignItems: 'center', gap: 6 }}
              onContentSizeChange={() => tagScrollRef.current?.scrollToEnd({ animated: true })}
            >
              {tags.map((tag) => (
                <Pressable
                  key={tag}
                  accessibilityRole="button"
                  accessibilityLabel={`${tag} 태그 삭제`}
                  onPress={(event) => {
                    event.stopPropagation();
                    setTags(tags.filter((item) => item !== tag));
                  }}
                  className="h-11 justify-center"
                >
                  <View className="h-[26px] max-w-full justify-center rounded-full bg-[#F0F0F2] px-[10px]">
                    <Text
                      numberOfLines={1}
                      style={font}
                      className="text-[12px] leading-[14px] text-[#2E2E33]"
                    >
                      {`#${tag}  ✕`}
                    </Text>
                  </View>
                </Pressable>
              ))}
              <TextInput
                ref={tagInputRef}
                accessibilityLabel="태그 입력"
                style={{
                  ...font,
                  paddingVertical: 0,
                  minWidth: Math.max(80, tagInput.length * 14 + 20),
                  flexGrow: 1,
                }}
                className="h-11 text-[14px] leading-[17px] text-[#2E2E33]"
                placeholder="# 추가"
                placeholderTextColor="#737380"
                value={tagInput}
                maxLength={160}
                onChangeText={(value) => {
                  if (/\s$/.test(value)) addTags(value);
                  else setTagInput(value);
                }}
                onSubmitEditing={() => addTags(tagInput)}
                onFocus={() => tagScrollRef.current?.scrollToEnd({ animated: true })}
                returnKeyType="done"
              />
            </ScrollView>
          </Pressable>
          <Text style={font} className="mt-1 text-[11px] leading-[15px] text-[#737380]">
            엔터 · 띄어쓰기로 태그 추가. 작품명 · 캐릭터명을 달면 검색 · 알림에 잘 걸려요
          </Text>
        </View>
        <Field label="상품 상태" hint="선택">
          <Choices
            options={['미개봉', '개봉', '하자 없음', '하자 있음']}
            selected={conditions}
            onSelect={(value) =>
              setConditions((previous) =>
                previous.includes(value)
                  ? previous.filter((item) => item !== value)
                  : [
                      ...previous.filter(
                        (item) =>
                          !(value.includes('하자')
                            ? item.includes('하자')
                            : ['미개봉', '개봉'].includes(item)),
                      ),
                      value,
                    ],
              )
            }
          />
        </Field>
        <Field label="원하는 아이템">
          <TextInput
            accessibilityLabel="원하는 아이템"
            editable={!anyItem}
            style={font}
            className={`${inputClass} ${anyItem ? 'opacity-40' : ''}`}
            placeholder="예) 하치와레 키링"
            placeholderTextColor="#737380"
            value={wanted}
            onChangeText={setWanted}
            maxLength={80}
          />
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: anyItem }}
            onPress={() => setAnyItem(!anyItem)}
            className="min-h-11 flex-row items-center gap-2"
          >
            <View
              className={`h-5 w-5 items-center justify-center rounded border-2 ${anyItem ? 'border-[#2E2E33] bg-[#2E2E33]' : 'border-[#BFBFC7]'}`}
            >
              <Text className="text-[12px] text-white">{anyItem ? '✓' : ''}</Text>
            </View>
            <Text style={font} className="text-[13px] text-[#2E2E33]">
              상관없음
            </Text>
          </Pressable>
        </Field>
        <Field label="교환 개수" hint="선택">
          <Choices
            options={['1:1만', '여러 개도 OK']}
            selected={[quantity]}
            onSelect={(value) => setQuantity(quantity === value ? '' : value)}
          />
        </Field>
        <Field label="희망 장소">
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: locationOpen }}
            onPress={() => setLocationOpen(!locationOpen)}
            className={`${inputClass} flex-row items-center justify-between`}
          >
            <Text
              style={font}
              className={`text-[14px] ${location ? 'text-[#2E2E33]' : 'text-[#737380]'}`}
            >
              {locationDetail || location || '희망 장소를 선택해 주세요'}
            </Text>
            <Text>⌄</Text>
          </Pressable>
        </Field>
        <View className="mt-[22px]">
          <View className="min-h-11 flex-row items-center justify-between">
            <View className="flex-row items-center gap-[21px]">
              <Text style={font} className="text-[14px] leading-5 text-[#2E2E33]">
                현장 모드
              </Text>
              <Text style={font} className="text-[12px] leading-[17px] text-[#737380]">
                선택
              </Text>
            </View>
            <Pressable
              accessibilityRole="switch"
              accessibilityLabel="현장 모드"
              accessibilityState={{ checked: onsite }}
              onPress={() => setOnsite((previous) => !previous)}
              className="min-h-11 w-[54px] items-center justify-center"
            >
              <View
                pointerEvents="none"
                className={`h-[26px] w-[46px] justify-center rounded-full px-[3px] ${onsite ? 'bg-[#2E2E33]' : 'bg-[#E0E0E6]'}`}
              >
                <View
                  className={`h-5 w-5 rounded-full bg-white ${onsite ? 'self-end' : 'self-start'}`}
                />
              </View>
            </Pressable>
          </View>
          <Text style={font} className="mb-3 text-[11px] leading-[15px] text-[#737380]">
            지금 이 장소에 있다면 켜주세요. 교환 지도에 보여요
          </Text>
          <View className={onsite ? '' : 'opacity-40'} pointerEvents={onsite ? 'auto' : 'none'}>
            <Choices
              options={['15분', '30분', '60분', '직접 설정']}
              selected={onsite ? [duration] : []}
              onSelect={setDuration}
            />
            {duration === '직접 설정' && (
              <TextInput
                accessibilityLabel="현장 유지 시간, 분"
                style={font}
                className={`${inputClass} mt-2`}
                placeholder="1~1440분"
                keyboardType="number-pad"
                value={customMinutes}
                onChangeText={setCustomMinutes}
                maxLength={4}
              />
            )}
          </View>
        </View>
        <Field label="설명" hint="선택">
          <TextInput
            accessibilityLabel="설명"
            style={{ ...font, textAlignVertical: 'top', height: 130, paddingTop: 12 }}
            className={inputClass}
            multiline
            maxLength={2000}
            placeholder={
              '예) 치이카와 가챠 3탄에서 뽑았어요.\n· 상태: 미개봉, 캡슐 있어요\n· 오늘 6시까지 홍대입구역 근처에 있어요\n판매 · 구매 관련 문구는 쓸 수 없어요'
            }
            placeholderTextColor="#737380"
            value={description}
            onChangeText={setDescription}
          />
        </Field>
        {!!error && (
          <Text accessibilityRole="alert" style={font} className="mt-3 text-[12px] text-[#D93333]">
            {error}
          </Text>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !valid }}
          disabled={!valid}
          onPress={submit}
          className={`mt-12 h-[52px] items-center justify-center rounded-[10px] ${valid ? 'bg-[#2E2E33]' : 'bg-[#E0E0E6]'}`}
        >
          <Text
            style={font}
            className={`text-[15px] leading-[21px] ${valid ? 'text-white' : 'text-[#737380]'}`}
          >
            작성 완료
          </Text>
        </Pressable>
      </ScrollView>
      <Modal
        visible={photoSelectionVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setPhotoSelectionVisible(false)}
      >
        {photoSelectionVisible && (
          <PhotoSelection
            initialPhotos={photos}
            onClose={() => setPhotoSelectionVisible(false)}
            onConfirm={(selected) => {
              setPhotos(selected);
              setPhotoSelectionVisible(false);
            }}
          />
        )}
      </Modal>
      <Modal
        visible={locationOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setLocationOpen(false)}
      >
        {locationOpen && (
          <LocationSelection
            initialLocation={location}
            initialDetail={locationDetail}
            initialPoint={locationPoint}
            onClose={() => setLocationOpen(false)}
            onConfirm={(hub, detail, point) => {
              setLocationPoint(point);
              setLocation(hub);
              setLocationDetail(detail);
              setLocationOpen(false);
            }}
          />
        )}
      </Modal>
    </KeyboardAvoidingView>
  );
}
