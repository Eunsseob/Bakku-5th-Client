import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { ArrowsLeftRightIcon } from 'phosphor-react-native/src/icons/ArrowsLeftRight';
import { CalendarCheckIcon } from 'phosphor-react-native/src/icons/CalendarCheck';
import { DotsThreeVerticalIcon } from 'phosphor-react-native/src/icons/DotsThreeVertical';
import { ImageIcon } from 'phosphor-react-native/src/icons/Image';
import { MapPinIcon } from 'phosphor-react-native/src/icons/MapPin';
import { Fragment, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type ScrollViewInstance,
  Text,
  View,
} from 'react-native';

import { CompleteConfirmSheet, CompletionToast } from '@/features/completion/review';
import { EmptyState, Icon, TopNavigation } from '@/shared/components';

import { useChatStore } from '../store/useChatStore';
import type { ChatRoomDetail } from '../types';
import { isDifferentDay } from '../utils/formatTime';
import { AppointmentBanner } from './AppointmentCards';
import { ChatInput } from './ChatInput';
import { DateDivider, MessageItem } from './MessageItems';
import { SheetMenu, type SheetMenuOption } from './SheetMenu';
import { ExchangeStatusBadge } from './StatusBadges';
import { WIRE, WireDialog } from './wire';

// E 채팅·약속-2 ~ 6 (1차): 1:1 채팅방, + 메뉴, 약속 제안 카드, 약속 수락 모달, 약속 확정(예약중)
// F-1 (1차): 교환 완료 확인 카드, 교환 확정 시트, 성공 · 취소 카드, 토스트

/** + 메뉴 시트가 사라지는 시간 */
const SHEET_CLOSE_MS = 350;
/** 토스트가 떠 있는 시간 */
const TOAST_MS = 3000;

function plusMenu(reserved: boolean): SheetMenuOption[] {
  return [
    { key: 'photo', label: '사진', icon: ImageIcon },
    // 약속이 확정(예약중)됐거나 교환이 끝나면 새 약속을 잡을 수 없다
    { key: 'appointment', label: '약속 잡기', icon: CalendarCheckIcon, disabled: reserved },
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
        <ExchangeStatusBadge status={post.status} emphasized />
      </View>
    </View>
  );
}

export function ChatRoomScreen({ roomId }: { roomId: string }) {
  const room = useChatStore((state) => state.rooms[roomId]);
  const send = useChatStore((state) => state.send);
  const accept = useChatStore((state) => state.accept);
  const reject = useChatStore((state) => state.reject);
  const completeExchange = useChatStore((state) => state.completeExchange);
  const cancelExchange = useChatStore((state) => state.cancelExchange);

  const [menuOpen, setMenuOpen] = useState(false);
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
          <EmptyState title="채팅방을 찾을 수 없어요." />
        </View>
      </View>
    );
  }

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      send(room.id, { type: 'image', uri: result.assets[0].uri });
    }
  };

  const confirmComplete = () => {
    const messageId = completingId;
    setCompletingId(null);
    if (!messageId) return;
    try {
      if (completeExchange(room.id, messageId) === 'alreadyCompleted') {
        setToast("상대가 먼저 '무사히 교환했어요'로 답해 완료됐어요");
      }
    } catch {
      setToast('잠시 후 다시 시도해 주세요');
    }
  };

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
          { icon: DotsThreeVerticalIcon, accessibilityLabel: '채팅방 메뉴', onPress: () => {} },
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
                    onRejectProposal={(messageId) => reject(room.id, messageId)}
                    onCompleteExchange={setCompletingId}
                    onCancelExchange={(messageId) => cancelExchange(room.id, messageId)}
                  />
                </Fragment>
              );
            })}
          </ScrollView>
          {toast ? (
            <View pointerEvents="none" className="absolute inset-x-4 bottom-[21px]">
              <CompletionToast message={toast} />
            </View>
          ) : null}
        </View>
        <ChatInput
          onSend={(text) => send(room.id, { type: 'text', text })}
          onPlusPress={() => setMenuOpen(true)}
        />
      </KeyboardAvoidingView>

      <SheetMenu
        visible={menuOpen}
        options={plusMenu(room.post.status !== 'available')}
        onSelect={selectMenu}
        onClose={() => setMenuOpen(false)}
      />
      {/* 채팅·약속-6: 약속 수락 모달 */}
      <WireDialog
        visible={acceptingId !== null}
        title="약속을 수락할까요?"
        description="약속을 수락하면 다른 사람과 잡은 약속은 모두 취소돼요."
        confirmLabel="확정하기"
        onCancel={() => setAcceptingId(null)}
        onConfirm={() => {
          if (acceptingId) accept(room.id, acceptingId);
          setAcceptingId(null);
        }}
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
