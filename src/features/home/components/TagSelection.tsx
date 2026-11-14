import { Icon } from '@/shared/components/Icon';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
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
import { XIcon } from 'phosphor-react-native/src/icons/X';
import { XCircleIcon } from 'phosphor-react-native/src/icons/XCircle';
import { Button } from '@/shared/components/Button';
import { Divider } from '@/shared/components/Divider';
import { TopNavigation } from '@/shared/components/TopNavigation';
import { useExchangeStore } from '../store/useExchangeStore';
import { useWriteTagsStore } from '../store/useWriteTagsStore';

const suggestedTags = ['치이카와', '하치와레', '우사기', '포토카드', '피규어', '키링'];

export default function TagSelection() {
  const insets = useSafeAreaInsets();
  const [tags, setTags] = useState(() => useWriteTagsStore.getState().tags);
  const posts = useExchangeStore((state) => state.posts);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [message, setMessage] = useState('');
  const value = query.normalize('NFC').replace(/[#\s]/g, '');
  const candidates = [...new Set([...suggestedTags, ...posts.flatMap((post) => post.tags ?? [])])];
  const results = value
    ? [
        ...new Set([
          value,
          ...candidates.filter((tag) => tag.toLowerCase().includes(value.toLowerCase())),
        ]),
      ].filter((tag) => !tags.some((selected) => selected.toLowerCase() === tag.toLowerCase()))
    : [];
  const addTag = (tag: string) => {
    if (tags.some((selected) => selected.toLowerCase() === tag.toLowerCase())) return;
    if (tags.length >= 5) {
      setMessage('태그는 최대 5개까지 추가할 수 있어요.');
      return;
    }
    setTags([...tags, tag]);
    setQuery('');
    setMessage('');
  };
  const finish = () => {
    let selectedTags = tags;
    if (value && !tags.some((tag) => tag.toLowerCase() === value.toLowerCase())) {
      if (tags.length >= 5) {
        setMessage('태그는 최대 5개까지 추가할 수 있어요.');
        return;
      }
      selectedTags = [...tags, value];
    }
    useWriteTagsStore.getState().setTags(selectedTags);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
      style={{ paddingLeft: insets.left, paddingRight: insets.right, paddingBottom: insets.bottom }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <TopNavigation type="screen" title="태그 추가" onBack={() => router.back()} />
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: 32, paddingBottom: 24 }}
      >
        <View
          className={`mx-4 h-[52px] flex-row items-center rounded-lg border px-3.5 ${focused ? 'border-[#364153]' : 'border-[#D1D5DC]'}`}
        >
          <Text className="mr-2 shrink-0 font-sans text-[16px] leading-[26px] text-[#364153]">
            #
          </Text>
          <TextInput
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              setMessage('');
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            accessibilityLabel="태그 입력, 최대 5개"
            placeholder="태그 입력 (최대 5개)"
            placeholderTextColor="#99A1AF"
            className="min-w-0 flex-1 p-0 font-sans text-[16px] leading-[26px] text-[#364153]"
            style={{ minWidth: 0, flexShrink: 1, includeFontPadding: false }}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            submitBehavior="submit"
            onSubmitEditing={() => {
              if (value) addTag(value);
            }}
          />
          {!!query && (
            <View className="ml-2 size-6 shrink-0 items-center justify-center">
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                className="size-6 items-center justify-center"
                accessibilityLabel="태그 입력 지우기"
                onPress={() => {
                  setQuery('');
                  setMessage('');
                }}
              >
                <Icon icon={XCircleIcon} size="xl" weight="fill" color="#6A7282" />
              </Pressable>
            </View>
          )}
        </View>
        {!value && tags.length > 0 && (
          <View className="mx-4 mt-4 flex-row flex-wrap gap-2">
            {tags.map((tag) => (
              <Pressable
                key={tag}
                accessibilityRole="button"
                style={{
                  height: 32,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: '#D1D5DC',
                  backgroundColor: '#FFFFFF',
                  // Include the 1px border in the design's 12/8/7px insets.
                  paddingLeft: 11,
                  paddingRight: 7,
                  paddingVertical: 6,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 3,
                }}
                accessibilityLabel={`${tag} 태그 삭제`}
                hitSlop={6}
                onPress={() => {
                  setTags(tags.filter((selected) => selected !== tag));
                  setMessage('');
                }}
              >
                <Text
                  className="font-sans"
                  style={{
                    fontSize: 12,
                    lineHeight: 18,
                    letterSpacing: -0.12,
                    color: '#364153',
                    includeFontPadding: false,
                    textAlign: 'center',
                  }}
                >
                  {`#${tag}`}
                </Text>
                <Icon icon={XIcon} size="xs" color="#99A1AF" weight="regular" />
              </Pressable>
            ))}
          </View>
        )}
        {!!message && (
          <Text
            accessibilityRole="alert"
            className="mx-4 mt-3 font-sans text-[13px] leading-5 text-red-600"
          >
            {message}
          </Text>
        )}
        {results.length > 0 && (
          <View className="mt-[26px]">
            <Divider />
            {results.map((tag) => {
              const matchIndex = tag.toLowerCase().indexOf(value.toLowerCase());
              return (
                <Pressable
                  key={tag}
                  accessibilityRole="button"
                  accessibilityLabel={`${tag} 태그 추가`}
                  onPress={() => addTag(tag)}
                  className="h-[46px] justify-center px-4"
                >
                  <Text
                    numberOfLines={1}
                    style={{ includeFontPadding: false }}
                    className="font-sans text-[16px] leading-[22px] tracking-[-0.16px] text-[#99A1AF]"
                  >
                    #{tag.slice(0, matchIndex)}
                    <Text style={{ color: '#030712' }}>
                      {tag.slice(matchIndex, matchIndex + value.length)}
                    </Text>
                    {tag.slice(matchIndex + value.length)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
        {!value && (
          <Text className="mx-4 mt-6 font-sans text-[13px] leading-5 text-[#6A7282]">
            {
              '장르, 종류 등 굿즈를 설명할 수 있는 태그를 작성해주세요\n상품과 관련 없는 태그를 입력하면 제재를 받을 수 있어요.'
            }
          </Text>
        )}
      </ScrollView>
      <View className="shrink-0 bg-white px-4 pb-2 pt-3">
        <Button
          hierarchy="primary"
          onPress={finish}
          className="!h-[52px] self-stretch !rounded-xl !bg-[#364153]"
        >
          선택 완료
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
