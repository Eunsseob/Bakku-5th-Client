import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { router, useNavigation, usePreventRemove } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { semantic } from '@/design-tokens';

import {
  checkNicknameAvailability,
  nicknameCheckError,
  nicknameUnavailableMessage,
} from '@/features/auth/api/nicknameAvailability';
import { validateNickname } from '@/features/auth/utils/profileValidation';
import { Modal, TopNavigation } from '@/shared/components';

import { getMyInfo, type MyInfoResponse, updateNickname } from '../../api/mypageApi';
import { mypageKeys } from '../../api/queryKeys';
import { setFlashToast } from '../../hooks/flashToast';
import { useToastMessage } from '../../hooks/useToastMessage';
import { ToastOverlay } from '../common/ToastOverlay';

// G-1 닉네임 수정 (추가 프레임 5-03 · 3115:52493)
// 30일 안에 다시 변경 (3115:52521) · 뒤로 가기 확인 (3115:52549) · 저장 뒤 내 프로필 토스트 (3115:52585)
// 생년월일 · 성별은 가입할 때만 입력할 수 있어서 읽기 전용으로 보여준다.

type Check =
  | { nickname: string; status: 'available' }
  | { nickname: string; status: 'unavailable' | 'failed'; message: string };

/** MB-3 에러 코드 → 문구 */
const SAVE_ERRORS: Record<string, string> = {
  MEMBER_101: '사용할 수 없는 닉네임이에요.',
  MEMBER_102: '이미 사용 중인 닉네임이에요.',
  MEMBER_103: '닉네임은 30일에 한 번 바꿀 수 있어요.',
  MEMBER_104: '지금 닉네임과 같아요.',
};

function saveErrorMessage(error: unknown) {
  if (isAxiosError<{ code?: string; message?: string }>(error)) {
    const code = error.response?.data?.code;
    if (code && SAVE_ERRORS[code]) return SAVE_ERRORS[code];
  }
  return '저장하지 못했어요. 잠시 후 다시 시도해 주세요.';
}

/** 2000-01-01 → 2000. 01. 01 */
function formatBirthDate(value?: string) {
  const [year, month, day] = (value ?? '').split('-');
  return year && month && day ? `${year}. ${month}. ${day}` : '';
}

const GENDER: Record<NonNullable<MyInfoResponse['gender']>, string> = {
  MALE: '남성',
  FEMALE: '여성',
};

/** 다음 변경 가능 시각이 아직 안 왔으면 'M월 D일' */
function lockedUntil(changeableAt: string | null | undefined) {
  if (!changeableAt) return null;
  const date = new Date(changeableAt);
  if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) return null;
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

/** 입력칸 이름: 13 medium · object/alternative */
function FieldLabel({ children }: { children: string }) {
  return (
    <Text className="font-sans text-body-xs font-medium text-object-alternative">{children}</Text>
  );
}

/** 입력칸 아래 안내: 12 · object/alternative (오류면 빨강) */
function FieldHelper({ children, error }: { children: string; error?: boolean }) {
  return (
    <Text
      className={`font-sans text-label-sm font-normal ${error ? 'text-theme-red-bold' : 'text-object-alternative'}`}
    >
      {children}
    </Text>
  );
}

/** 바꿀 수 있는 입력칸: 테두리 r10 · 안쪽 14×12 · 15 */
function EditableField({ error, ...props }: TextInputProps & { error?: boolean }) {
  return (
    <View
      className={`rounded-10 border px-3.5 py-3 ${error ? 'border-theme-red-bold' : 'border-stroke-assistive'}`}
    >
      <TextInput
        {...props}
        placeholderTextColor={semantic.object.assistive}
        className="p-0 font-sans text-body-md font-normal text-object-boldest"
      />
    </View>
  );
}

/** 읽기 전용 입력칸: #f3f4f6 r10 · 안쪽 14×12 · 15 흐린 글씨 */
function ReadOnlyField({ value }: { value: string }) {
  return (
    <View className="rounded-10 bg-surface-deeper px-3.5 py-3">
      <Text className="font-sans text-body-md font-normal text-object-assistive">
        {value || ' '}
      </Text>
    </View>
  );
}

export function NicknameEditScreen() {
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [toast, setToast] = useToastMessage();
  const me = useQuery({ queryKey: mypageKeys.me, queryFn: getMyInfo });
  const current = me.data?.nickname ?? '';

  const [draft, setDraft] = useState<string | null>(null);
  const nickname = draft ?? current;
  const [check, setCheck] = useState<Check | null>(null);
  const [focused, setFocused] = useState(false);
  const [leaveAction, setLeaveAction] = useState<Parameters<typeof navigation.dispatch>[0] | null>(
    null,
  );

  const locked = lockedUntil(me.data?.nicknameChangeableAt);
  const changed = draft !== null && nickname.trim() !== current;
  const formatError = changed ? validateNickname(nickname) : null;
  const currentCheck = check?.nickname === nickname ? check : null;

  const save = useMutation({
    mutationFn: () => updateNickname(nickname),
    onSuccess: async (result) => {
      queryClient.setQueryData<MyInfoResponse>(mypageKeys.me, (old) =>
        old && result ? { ...old, ...result } : old,
      );
      await queryClient.invalidateQueries({ queryKey: mypageKeys.me });
      setFlashToast('프로필을 수정했어요');
      setDraft(null);
    },
    onError: (error) => setToast(saveErrorMessage(error)),
  });

  // 저장이 끝나 draft 가 비워지면 (막을 것이 없으니) 돌아간다
  useEffect(() => {
    if (save.isSuccess && draft === null) router.back();
  }, [save.isSuccess, draft]);

  // 입력이 멈추고 0.5초 뒤 중복 확인 (가입 프로필 화면과 같은 방식)
  useEffect(() => {
    if (!changed || formatError || locked) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const result = await checkNicknameAvailability(nickname, controller.signal);
        if (controller.signal.aborted) return;
        setCheck(
          result.available
            ? { nickname, status: 'available' }
            : {
                nickname,
                status: 'unavailable',
                message: nicknameUnavailableMessage(result.reason),
              },
        );
      } catch (error) {
        if (!controller.signal.aborted) {
          setCheck({ nickname, status: 'failed', message: nicknameCheckError(error) });
        }
      }
    }, 500);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [nickname, changed, formatError, locked]);

  // 5-03 뒤로 가기 확인: 바꾼 닉네임이 있는데 저장하지 않고 나가려 할 때
  usePreventRemove(changed && !save.isPending && !save.isSuccess, ({ data }) => {
    setLeaveAction(data.action);
  });

  let error: string | undefined;
  let helper: string | undefined;
  if (locked) {
    helper = `닉네임은 30일에 한 번 바꿀 수 있어요 (${locked}부터 가능)`;
  } else if (formatError && !focused) {
    error = formatError;
  } else if (currentCheck?.status === 'available') {
    helper = '사용할 수 있는 닉네임이에요';
  } else if (currentCheck) {
    error = currentCheck.message;
  }

  const canSave =
    !locked && changed && !formatError && currentCheck?.status === 'available' && !save.isPending;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-surface-standard"
    >
      <TopNavigation type="screen" title="닉네임 수정" onBack={() => router.back()} />
      {/* 내용: 안쪽 16 · 간격 8 (닉네임 안내 뒤 +8, 생년월일 뒤 +4) */}
      <ScrollView contentContainerClassName="gap-2 p-4" keyboardShouldPersistTaps="handled">
        <FieldLabel>닉네임</FieldLabel>
        <EditableField
          accessibilityLabel="닉네임"
          value={nickname}
          onChangeText={(text) => setDraft(text)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          maxLength={10}
          autoCorrect={false}
          autoCapitalize="none"
          editable={!locked}
          error={!!error}
        />
        {error ? <FieldHelper error>{error}</FieldHelper> : null}
        {!error && helper ? <FieldHelper>{helper}</FieldHelper> : null}
        <View className="h-2" />
        <FieldLabel>생년월일</FieldLabel>
        <ReadOnlyField value={formatBirthDate(me.data?.birthDate)} />
        <View className="h-1" />
        <FieldLabel>성별</FieldLabel>
        <ReadOnlyField value={me.data?.gender ? GENDER[me.data.gender] : ''} />
        <FieldHelper>가입할 때만 입력할 수 있어요</FieldHelper>
      </ScrollView>

      <View>
        {/* 토스트는 저장 버튼 바로 위 */}
        <View className="absolute inset-x-0 -top-2">
          <ToastOverlay message={toast} />
        </View>
        {/* 하단 버튼: 안쪽 16×8 · 높이 52 · r12 · 진한 회색 (못 누르면 연회색) */}
        <View className="px-4 pt-2" style={{ paddingBottom: 8 + insets.bottom }}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSave }}
            disabled={!canSave}
            onPress={() => save.mutate()}
            className={`h-[52px] items-center justify-center rounded-12 px-3 ${canSave ? 'bg-surface-inverse-deep active:bg-surface-inverse-deeper' : 'bg-surface-deepest'}`}
          >
            <Text
              className={`font-sans text-label-lg font-medium ${canSave ? 'text-object-inverse-boldest' : 'text-object-assistive'}`}
            >
              저장
            </Text>
          </Pressable>
        </View>
      </View>

      <Modal
        visible={leaveAction !== null}
        title="변경한 내용이 저장되지 않아요"
        // TODO: 버튼 문구는 Figma 에 'PD' 로 비어 있다. 정해지면 맞춘다
        primary={{ label: '계속 수정', onPress: () => setLeaveAction(null) }}
        secondary={{
          label: '나가기',
          onPress: () => {
            const action = leaveAction;
            setLeaveAction(null);
            if (action) navigation.dispatch(action);
          },
        }}
        onRequestClose={() => setLeaveAction(null)}
      />
    </KeyboardAvoidingView>
  );
}
