import { Button, Divider, Icon, TopNavigation } from '@/shared/components';
import { useAuthStore } from '@/shared/api/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { getTagSuggestions } from '../api/tagSuggestions';
import { useWriteTagsStore } from '../store/useWriteTagsStore';

const maxTagLength = 20;
const tagLengthMessage = '태그는 공백과 앞의 #을 제외하고 20자까지 입력할 수 있어요.';

export default function TagSelection({ editing = false }: { editing?: boolean }) {
  const insets = useSafeAreaInsets();
  const [tags, setTags] = useState(() => {
    const draft = useWriteTagsStore.getState();
    return editing ? draft.editTags : draft.tags;
  });
  const accessToken = useAuthStore((state) => state.accessToken);
  const sessionId = useAuthStore((state) => state.sessionId);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [message, setMessage] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const value = query.normalize('NFC').replace(/\s/g, '').replace(/^#+/, '');
  const tooLong = [...value].length > maxTagLength;
  useEffect(() => {
    if (!value || tooLong) return;
    const timer = setTimeout(() => setDebouncedKeyword(value), 250);
    return () => clearTimeout(timer);
  }, [tooLong, value]);
  const canSuggest = !!accessToken && !!value && !tooLong && value === debouncedKeyword;
  const suggestions = useQuery({
    queryKey: ['tag-suggestions', sessionId, value],
    queryFn: ({ signal }) => getTagSuggestions(value, signal),
    enabled: canSuggest,
    retry: false,
  });
  const { fetchStatus, status: queryStatus, data: suggestedTags } = suggestions;
  useEffect(() => {
    if (!__DEV__ || !value) return;
    console.info('[tag-suggestions] query state', {
      keyword: value,
      ready: canSuggest,
      hasAccessToken: !!accessToken,
      tooLong,
      fetchStatus,
      status: queryStatus,
      receivedCount: suggestedTags?.length,
    });
  }, [value, canSuggest, accessToken, tooLong, fetchStatus, queryStatus, suggestedTags]);
  const seen = new Set(tags.map((tag) => tag.toLowerCase()));
  const results =
    value && !tooLong
      ? [...(canSuggest ? (suggestions.data ?? []) : []), value].filter((tag) => {
          const key = tag.toLowerCase();
          if (seen.has(key) || [...tag].length > maxTagLength) return false;
          seen.add(key);
          return true;
        })
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
    if (tooLong) return;
    let selectedTags = tags;
    if (value && !tags.some((tag) => tag.toLowerCase() === value.toLowerCase())) {
      if (tags.length >= 5) {
        setMessage('태그는 최대 5개까지 추가할 수 있어요.');
        return;
      }
      selectedTags = [...tags, value];
    }
    const draft = useWriteTagsStore.getState();
    if (editing) draft.setEditTags(selectedTags);
    else draft.setTags(selectedTags);
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
              if (value && !tooLong) addTag(value);
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
        {(tooLong || !!message) && (
          <Text
            accessibilityRole="alert"
            className="mx-4 mt-3 font-sans text-[13px] leading-5 text-red-600"
          >
            {tooLong ? tagLengthMessage : message}
          </Text>
        )}
        {canSuggest && suggestions.isError && (
          <Text className="mx-4 mt-3 font-sans text-[13px] leading-5 text-[#6A7282]">
            추천 태그를 불러오지 못했어요. 입력한 태그는 추가할 수 있어요.
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
                    {matchIndex < 0 ? (
                      `#${tag}`
                    ) : (
                      <>
                        #{tag.slice(0, matchIndex)}
                        <Text style={{ color: '#030712' }}>
                          {tag.slice(matchIndex, matchIndex + value.length)}
                        </Text>
                        {tag.slice(matchIndex + value.length)}
                      </>
                    )}
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
