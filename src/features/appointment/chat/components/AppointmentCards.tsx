import { ArrowsLeftRightIcon } from 'phosphor-react-native/src/icons/ArrowsLeftRight';
import { CalendarCheckIcon } from 'phosphor-react-native/src/icons/CalendarCheck';
import { ClockIcon } from 'phosphor-react-native/src/icons/Clock';
import { DotsThreeVerticalIcon } from 'phosphor-react-native/src/icons/DotsThreeVertical';
import { MapPinIcon } from 'phosphor-react-native/src/icons/MapPin';
import { Text, View } from 'react-native';

import { semantic } from '@/design-tokens';
import { Button, Icon, type IconComponent } from '@/shared/components';

import type { Appointment, ProposalState } from '../types';
import { formatClock, formatDateDivider, formatShortDate } from '../utils/formatTime';
import { WIRE } from './wire';

// E 채팅·약속-5: 약속 제안 카드 (수락하면 '약속 확정' 카드로 바뀐다), 채팅방 상단 약속 배너

/** 1차: 약속 전 알림은 30분 전으로 고정 (알림 선택은 2차) */
const REMINDER_NOTE = '약속 30분 전에 알림을 보내드려요';

const DETAIL_TEXT = 'font-sans text-label-md font-normal text-object-bold';

/** 아이콘 16 (object/neutral) + label/md subtle (object/bold), 사이 8 */
function DetailRow({ icon, children }: { icon: IconComponent; children: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <Icon icon={icon} size="md" color={semantic.object.neutral} />
      <Text className={`flex-1 ${DETAIL_TEXT}`}>{children}</Text>
    </View>
  );
}

/** 교환 물건: 아이콘과 이름 목록이 함께 위아래 2 안쪽, 사이 10 · 이름 사이 2 */
function ItemsRow({ names }: { names: string[] }) {
  return (
    <View className="flex-row items-start gap-2.5 py-0.5">
      <Icon icon={ArrowsLeftRightIcon} size="md" color={semantic.object.neutral} />
      <View className="flex-1 gap-0.5">
        {names.map((name, index) => (
          <Text key={`${index}-${name}`} className={DETAIL_TEXT}>
            {name}
          </Text>
        ))}
      </View>
    </View>
  );
}

type ProposalCardProps = {
  /** 내가 보낸 제안이면 수락할 수 없고 '수락 대기중' 으로 보인다 */
  mine: boolean;
  appointment: Appointment;
  state: ProposalState;
  onAccept: () => void;
  onReject: () => void;
};

// BDS 메시지 버블 Chatbubble/reserveationcard
// 흰 바탕 · 테두리 stroke/assistive · r12 · 안쪽 좌우 12 위아래 14 · 사이 10
// 제목 body/md bold → 구분선 → 내용(사이 8) → 안내 문구 → 버튼 (Chatbubble/reserved/button)
export function ProposalCard({ mine, appointment, state, onAccept, onReject }: ProposalCardProps) {
  const confirmed = state === 'accepted';

  let footer = null;
  if (state === 'pending' && !mine) {
    // state=received: 110 버튼 두 개, 사이 4
    footer = (
      <View className="flex-row gap-1">
        <Button hierarchy="secondary" size="sm" onPress={onReject} className="flex-1">
          거절
        </Button>
        <Button hierarchy="primary" size="sm" onPress={onAccept} className="flex-1">
          수락하기
        </Button>
      </View>
    );
  } else if (!confirmed) {
    // state=unselected: 누를 수 없는 회색 버튼
    footer = (
      <Button hierarchy="secondary" size="sm" disabled className="self-stretch">
        {state === 'pending' ? '수락 대기중' : '거절했어요'}
      </Button>
    );
  }

  return (
    <View className="w-[250px] gap-2.5 rounded-12 border border-stroke-assistive bg-surface-standard px-3 py-3.5">
      <View className="gap-2">
        <Text className="font-sans text-body-md font-medium text-object-boldest">
          {confirmed ? '약속 확정' : '약속을 제안해요'}
        </Text>
        <View className="gap-2">
          <View className="h-px bg-object-subtlest" />
          <View className="gap-2">
            <ItemsRow names={appointment.items.map((item) => item.name)} />
            <DetailRow icon={CalendarCheckIcon}>{formatDateDivider(appointment.meetAt)}</DetailRow>
            <DetailRow icon={ClockIcon}>
              {appointment.isNow
                ? `지금 바로 (${formatClock(appointment.meetAt)})`
                : formatClock(appointment.meetAt)}
            </DetailRow>
            <DetailRow icon={MapPinIcon}>{appointment.place}</DetailRow>
          </View>
        </View>
      </View>
      {confirmed ? (
        <Text className="font-sans text-label-md font-normal text-object-assistive">
          {REMINDER_NOTE}
        </Text>
      ) : null}
      {footer}
    </View>
  );
}

/** 확정 약속이 있을 때 채팅방 위에 고정되는 한 줄 요약 (테두리 r8, 14 Regular) */
export function AppointmentBanner({ appointment }: { appointment: Appointment }) {
  return (
    <View className="mx-3 mt-2 flex-row items-center gap-2 rounded-8 border border-gray-75 bg-white px-2 py-[11px]">
      <Icon icon={CalendarCheckIcon} size="lg" color={WIRE.normal} />
      <Text numberOfLines={1} className="flex-1 font-sans text-label-md font-normal text-gray-600">
        {`${formatShortDate(appointment.meetAt)} · ${formatClock(appointment.meetAt)} · ${appointment.place}`}
      </Text>
      {/* 약속 상세(2-06)는 1차 범위 밖이라 아이콘만 둔다 */}
      <Icon icon={DotsThreeVerticalIcon} size="lg" color={WIRE.normal} />
    </View>
  );
}
