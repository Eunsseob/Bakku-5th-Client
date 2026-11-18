import { ArrowsLeftRightIcon } from 'phosphor-react-native/src/icons/ArrowsLeftRight';
import { CalendarCheckIcon } from 'phosphor-react-native/src/icons/CalendarCheck';
import { ClockIcon } from 'phosphor-react-native/src/icons/Clock';
import { DotsThreeVerticalIcon } from 'phosphor-react-native/src/icons/DotsThreeVertical';
import { MapPinIcon } from 'phosphor-react-native/src/icons/MapPin';
import { Text, View } from 'react-native';

import { Icon, type IconComponent } from '@/shared/components';

import type { Appointment, ProposalState } from '../types';
import { formatClock, formatDateDivider, formatShortDate } from '../utils/formatTime';
import { WIRE, WireButton } from './wire';

// E 채팅·약속-5: 약속 제안 카드 (수락하면 '약속 확정' 카드로 바뀐다), 채팅방 상단 약속 배너

/** 1차: 약속 전 알림은 30분 전으로 고정 (알림 선택은 2차) */
const REMINDER_NOTE = '약속 30분 전에 알림을 보내드려요';

/** 아이콘 16 + 14 Regular */
function DetailRow({ icon, children }: { icon: IconComponent; children: string }) {
  return (
    <View className="flex-row items-start gap-2">
      <View className="py-0.5">
        <Icon icon={icon} size="md" color={WIRE.assistive} />
      </View>
      <Text className="flex-1 font-sans text-label-md font-normal text-gray-600">{children}</Text>
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

// 카드: 흰 바탕 r12, 안쪽 12·10, 제목(15 Medium) → 구분선 → 내용(14, 줄 간격 8) → 버튼
export function ProposalCard({ mine, appointment, state, onAccept, onReject }: ProposalCardProps) {
  const confirmed = state === 'accepted';

  let footer = null;
  if (state === 'pending' && !mine) {
    footer = (
      <View className="flex-row gap-1">
        <WireButton label="거절" tone="light" onPress={onReject} className="flex-1" />
        <WireButton label="수락하기" tone="dark" onPress={onAccept} className="flex-1" />
      </View>
    );
  } else if (!confirmed) {
    footer = <WireButton label={state === 'pending' ? '수락 대기중' : '거절했어요'} disabled />;
  }

  return (
    <View className="gap-4 rounded-12 bg-white px-2.5 py-3">
      <View className="gap-2">
        <Text className="font-sans text-body-md font-medium text-gray-700">
          {confirmed ? '약속 확정' : '약속을 제안해요'}
        </Text>
        <View className="gap-3">
          <View className="h-px bg-gray-75" />
          <View className="gap-2">
            <DetailRow icon={ArrowsLeftRightIcon}>
              {appointment.items.map((item) => item.name).join('\n')}
            </DetailRow>
            <DetailRow icon={CalendarCheckIcon}>{formatDateDivider(appointment.meetAt)}</DetailRow>
            <DetailRow icon={ClockIcon}>
              {appointment.isNow
                ? `지금 바로 (${formatClock(appointment.meetAt)})`
                : formatClock(appointment.meetAt)}
            </DetailRow>
            <DetailRow icon={MapPinIcon}>{appointment.place}</DetailRow>
            {confirmed ? (
              <Text className="font-sans text-label-md font-normal text-object-subtle">
                {REMINDER_NOTE}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
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
