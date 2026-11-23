import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { ArrowsLeftRightIcon } from 'phosphor-react-native/src/icons/ArrowsLeftRight';
import { BellIcon } from 'phosphor-react-native/src/icons/Bell';
import { BellSlashIcon } from 'phosphor-react-native/src/icons/BellSlash';
import { CalendarCheckIcon } from 'phosphor-react-native/src/icons/CalendarCheck';
import { DotsThreeVerticalIcon } from 'phosphor-react-native/src/icons/DotsThreeVertical';
import { ImageIcon } from 'phosphor-react-native/src/icons/Image';
import { MapPinIcon } from 'phosphor-react-native/src/icons/MapPin';
import { SignOutIcon } from 'phosphor-react-native/src/icons/SignOut';
import { Fragment, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  type ScrollViewInstance,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CompleteConfirmSheet,
  type ConfirmationRequest,
  type ConfirmResult,
  useConfirmExchange,
} from '@/features/completion/review';
import { EmptyState, Icon, Menu, Modal, Toast, TopNavigation } from '@/shared/components';

import type { LeaveImpact } from '../api/chatApi';
import { useChatRoom } from '../hooks/useChatRoom';
import type { ChatRoomDetail } from '../types';
import { isDifferentDay } from '../utils/formatTime';
import { AppointmentBanner } from './AppointmentCards';
import { ChatInput } from './ChatInput';
import { DateDivider, MessageItem } from './MessageItems';
import { SheetMenu, type SheetMenuOption } from './SheetMenu';
import { ExchangeStatusBadge } from './StatusBadges';
import { WIRE } from './wire';

// E 채팅·약속-2 ~ 6 (1차): 1:1 채팅방, + 메뉴, 약속 제안 카드, 약속 수락 모달, 약속 확정(예약중)
// F-1 (1차): 교환 완료 확인 카드, 교환 확정 시트, 성공 · 취소 카드, 토스트

/** + 메뉴 시트가 사라지는 시간 */
const SHEET_CLOSE_MS = 350;
/** 토스트가 떠 있는 시간 */
const TOAST_MS = 3000;
/** TopNavigation 높이 (h-14). ⋮ 메뉴를 그 아래에 띄운다 */
const HEADER_HEIGHT = 56;

/** 서버 요청이 실패했을 때 */
const RETRY_MESSAGE = '잠시 후 다시 시도해 주세요';

/** CH-7 나가기 확인 팝업: CH-2 leaveImpact 로 고른다 */
const LEAVE_DESCRIPTION: Record<LeaveImpact, string> = {
  NONE: '나간 채팅방은 다시 들어올 수 없어요.',
  UNILATERAL_CANCEL: '나가면 확정된 약속이 취소돼요. 나간 채팅방은 다시 들어올 수 없어요.',
  UNILATERAL_CANCEL_IMMINENT:
    '약속이 얼마 남지 않아 지금 나가면 매너 지표에 반영돼요. 나간 채팅방은 다시 들어올 수 없어요.',
};

/** appointmentDisabled: 약속이 확정(예약중)됐거나 교환이 끝났거나, 서버 약속 제안(A-1)이 아직 연결 전 */
function plusMenu(appointmentDisabled: boolean): SheetMenuOption[] {
  return [
    { key: 'photo', label: '사진', icon: ImageIcon },
    {
      key: 'appointment',
      label: '약속 잡기',
      icon: CalendarCheckIcon,
      disabled: appointmentDisabled,
    },
    { key: 'place', label: '장소 보내기 (2차)', icon: MapPinIcon, disabled: true },
  ];
}

/** 교환글 요약: 사진 48 r8 · 제목 label/lg SemiBold · 요약 body/2xs Medium · 상태 태그 */
function PostSummary({ post }: { post: ChatRoomDetail['post'] }) {
  return (
    <View className="flex-row items-center gap-4 border-b border-gray-75 bg-white px-4 py-3">
      {post.thumbnailUrl ? (
        <Image
          source={post.thumbnailUrl}
          contentFit="cover"
          style={{ width: 48, height: 48, borderRadius: 8 }}
        />
      ) : (
        <View className="size-12 rounded-8 bg-gray-50" />
      )}
      <View className="flex-1 flex-row items-center gap-0.5">
        <View className="flex-1 gap-0.5">
          <Text numberOfLines={1} className="font-sans text-label-lg font-semibold text-gray-900">
            {post.title}
          </Text>
          <View className="flex-row items-center gap-0.5">
            <Icon icon={ArrowsLeftRightIcon} size="sm" color={WIRE.alternative} />
            <Text numberOfLines={1} className="font-sans text-body-2xs font-medium text-gray-500">
              {post.offerSummary}
            </Text>
          </View>
        </View>
        {/* BDS Tag 는 self-start 라서 감싸서 세로 가운데에 둔다 */}
        <View>
          <ExchangeStatusBadge status={post.status} />
        </View>
      </View>
    </View>
  );
}

export function ChatRoomScreen({ roomId }: { roomId: string }) {
  const insets = useSafeAreaInsets();
  const chat = useChatRoom(roomId);
  const { room } = chat;
  const confirmExchange = useConfirmExchange();

  const [menuOpen, setMenuOpen] = useState(false);
  /** 상단 ⋮ 메뉴 (알림 · 나가기) */
  const [roomMenuOpen, setRoomMenuOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  /** 수락 확인 모달을 띄운 제안 카드 */
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  /** 교환 확정 시트를 띄운 교환 완료 확인 카드 */
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const scrollRef = useRef<ScrollViewInstance>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!room) {
    return (
      <View className="flex-1 bg-surface-standard">
        <TopNavigation type="screen" onBack={() => router.back()} />
        <View className="flex-1 justify-center">
          {chat.isLoading ? null : chat.isError ? (
            <EmptyState
              title="채팅방을 불러오지 못했어요."
              action={{ label: '다시 시도', onPress: () => chat.refetch() }}
            />
          ) : (
            <EmptyState title="채팅방을 찾을 수 없어요." />
          )}
        </View>
      </View>
    );
  }

  const showError = () => setToast(RETRY_MESSAGE);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0] && !chat.sendImage(result.assets[0].uri)) {
      setToast('사진 보내기는 준비 중이에요');
    }
  };

  /** 교환 확인 결과를 카드에 반영한다. 상대가 먼저 답했으면 토스트로 알린다 */
  const applyResult = (messageId: string, { state, byPartner }: ConfirmResult) => {
    chat.resolveCompletion(messageId, state);
    if (!byPartner) return;
    setToast(
      state === 'completed'
        ? "상대가 먼저 '무사히 교환했어요'로 답해 완료됐어요"
        : "상대가 먼저 '교환하지 못했어요'로 답해 취소됐어요",
    );
  };

  /** F-1 교환 확인 응답. 서버 약속 ID 가 없는 목업 방은 화면에서만 바꾼다 */
  const answerCompletion = (messageId: string, body: ConfirmationRequest) => {
    const card = room.messages.find((item) => item.id === messageId);
    if (card?.type !== 'completion') return;
    const state = body.answer === 'DONE' ? 'completed' : 'cancelled';
    if (card.appointmentId === undefined) {
      applyResult(messageId, {
        state,
        byPartner: state === 'completed' && !!room.partnerCompleted,
      });
      return;
    }
    confirmExchange.mutate(
      { appointmentId: card.appointmentId, body },
      {
        onSuccess: (result) => applyResult(messageId, result),
        onError: showError,
      },
    );
  };

  const confirmComplete = () => {
    const messageId = completingId;
    setCompletingId(null);
    if (messageId) answerCompletion(messageId, { answer: 'DONE' });
  };

  /** [교환하지 못했어요] */
  const failExchange = (messageId: string) => {
    const card = room.messages.find((item) => item.id === messageId);
    // TODO: 서버는 NOT_MET 에 이유(notMetReason)가 필수다. 이유를 어떻게 받을지 정해지면 서버 방도 보낸다.
    if (card?.type === 'completion' && card.appointmentId === undefined) {
      answerCompletion(messageId, { answer: 'NOT_MET', notMetReason: 'OTHER' });
    }
  };

  const selectRoomMenu = async (key: string) => {
    setRoomMenuOpen(false);
    if (key === 'leave') {
      setLeaveOpen(true);
      return;
    }
    try {
      await chat.setNotification(key === 'notificationOn');
    } catch {
      showError();
    }
  };

  const leaveRoom = async () => {
    setLeaveOpen(false);
    try {
      await chat.leave();
      router.back();
    } catch {
      showError();
    }
  };

  const notificationEnabled = room.remote?.notificationEnabled ?? true;
  const inputDisabledMessage = room.remote?.inputDisabledMessage;

  const selectMenu = (key: string) => {
    setMenuOpen(false);
    const run = () => {
      if (key === 'photo') {
        pickPhoto();
      } else if (key === 'appointment') {
        router.push({ pathname: '/chat/[id]/appointment', params: { id: room.id } });
      }
    };
    // iOS 는 닫히는 중인 모달 위에 사진 선택창을 띄우지 못해서 시트가 닫힌 뒤 연다.
    // 다른 플랫폼은 바로 실행해야 화면 이동 뒤에 시트가 남지 않는다.
    if (Platform.OS === 'ios') {
      setTimeout(run, SHEET_CLOSE_MS);
    } else {
      run();
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <TopNavigation
        type="screen"
        titleSize="sm"
        title={room.partner.nickname}
        description={`교환 ${room.partner.exchangeCount}회`}
        onBack={() => router.back()}
        actions={[
          {
            icon: DotsThreeVerticalIcon,
            accessibilityLabel: '채팅방 메뉴',
            // 알림 끄기 · 나가기는 서버 방만 (목업은 그대로)
            onPress: () => {
              if (room.remote) setRoomMenuOpen(true);
            },
          },
        ]}
      />
      <PostSummary post={room.post} />
      {room.appointment ? <AppointmentBanner appointment={room.appointment} /> : null}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-1">
          <ScrollView
            ref={scrollRef}
            className="flex-1"
            contentContainerClassName="gap-2 px-1.5 pb-4"
            keyboardDismissMode="interactive"
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          >
            {room.messages.map((message, index) => {
              const previous = room.messages[index - 1];
              const showDate = !previous || isDifferentDay(previous.sentAt, message.sentAt);
              return (
                <Fragment key={message.id}>
                  {showDate ? <DateDivider date={message.sentAt} /> : null}
                  <MessageItem
                    message={message}
                    onAcceptProposal={setAcceptingId}
                    onRejectProposal={(messageId) => {
                      Promise.resolve(chat.reject(messageId)).catch(showError);
                    }}
                    onCompleteExchange={setCompletingId}
                    onCancelExchange={failExchange}
                  />
                </Fragment>
              );
            })}
          </ScrollView>
          {toast ? (
            <View pointerEvents="none" className="absolute inset-x-4 bottom-[21px]">
              <Toast title={toast} />
            </View>
          ) : null}
        </View>
        {inputDisabledMessage ? (
          // CH-2 inputDisabledReason: 입력창 대신 안내
          <View className="bg-white px-4 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
            <Text className="text-center font-sans text-label-md font-normal text-object-alternative">
              {inputDisabledMessage}
            </Text>
          </View>
        ) : (
          <ChatInput
            onSend={(text) => {
              Promise.resolve(chat.sendText(text)).catch(showError);
            }}
            onPlusPress={() => setMenuOpen(true)}
          />
        )}
      </KeyboardAvoidingView>

      <SheetMenu
        visible={menuOpen}
        // TODO: 서버 방의 약속 잡기는 A-1 약속 제안이 연결되면 연다
        options={plusMenu(room.post.status !== 'available' || chat.remote)}
        onSelect={selectMenu}
        onClose={() => setMenuOpen(false)}
      />
      {/* 채팅·약속-6: 약속 수락 모달 */}
      <Modal
        visible={acceptingId !== null}
        title="약속을 수락할까요?"
        description="약속을 수락하면 다른 사람과 잡은 약속은 모두 취소돼요."
        onRequestClose={() => setAcceptingId(null)}
        secondary={{ label: '취소', onPress: () => setAcceptingId(null) }}
        primary={{
          label: '확정하기',
          onPress: () => {
            if (acceptingId) Promise.resolve(chat.accept(acceptingId)).catch(showError);
            setAcceptingId(null);
          },
        }}
      />
      {/* CH-6 알림 끄기 · 켜기, CH-7 나가기 */}
      {roomMenuOpen ? (
        // BDS Menu: ⋮ 아래에 뜨는 메뉴 카드. 바깥을 누르면 닫힌다
        <View className="absolute inset-0">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="메뉴 닫기"
            onPress={() => setRoomMenuOpen(false)}
            className="absolute inset-0"
          />
          <View className="absolute right-4" style={{ top: insets.top + HEADER_HEIGHT }}>
            <Menu
              items={[
                notificationEnabled
                  ? {
                      key: 'notificationOff',
                      label: '알림 끄기',
                      leadingIcon: BellSlashIcon,
                      onPress: () => selectRoomMenu('notificationOff'),
                    }
                  : {
                      key: 'notificationOn',
                      label: '알림 켜기',
                      leadingIcon: BellIcon,
                      onPress: () => selectRoomMenu('notificationOn'),
                    },
                {
                  key: 'leave',
                  label: '채팅방 나가기',
                  leadingIcon: SignOutIcon,
                  destructive: true,
                  onPress: () => selectRoomMenu('leave'),
                },
              ]}
            />
          </View>
        </View>
      ) : null}
      <Modal
        visible={leaveOpen}
        title="채팅방을 나갈까요?"
        description={LEAVE_DESCRIPTION[room.remote?.leaveImpact ?? 'NONE']}
        onRequestClose={() => setLeaveOpen(false)}
        secondary={{ label: '취소', onPress: () => setLeaveOpen(false) }}
        primary={{ label: '나가기', onPress: leaveRoom }}
      />
      {/* F-1: 교환 확정 시트 */}
      <CompleteConfirmSheet
        visible={completingId !== null}
        onCancel={() => setCompletingId(null)}
        onConfirm={confirmComplete}
      />
    </View>
  );
}
