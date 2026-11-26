import { ArrowsLeftRightIcon } from 'phosphor-react-native/src/icons/ArrowsLeftRight';
import { CalendarCheckIcon } from 'phosphor-react-native/src/icons/CalendarCheck';
import { ClockIcon } from 'phosphor-react-native/src/icons/Clock';
import { MapPinIcon } from 'phosphor-react-native/src/icons/MapPin';
import { Text, View } from 'react-native';

import { semantic } from '@/design-tokens';
import { Button, Icon, type IconComponent } from '@/shared/components';

import type { Appointment, ProposalState } from '../types';
import { formatClock, formatDateDivider, formatShortDate } from '../utils/formatTime';

// E-5 약속 제안 카드 (수락하면 '약속 확정' 카드로 바뀐다), E-5-4 채팅방 위 약속 배너

/** 약속 시각 30분 뒤 F-1 교환 확인 카드가 온다 */
const HELP_MESSAGE = '약속 30분 뒤, 교환했는지 물어볼게요';

/** 끝난 제안 (BDS reserved/button state=unselected) */
const CLOSED_LABEL: Partial<Record<ProposalState, string>> = {
  rejected: '거절된 제안이에요',
  withdrawn: '취소된 제안이에요',
};

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
  /** 내가 보낸 제안이면 수락할 수 없고 [약속 취소] 만 보인다 */
  mine: boolean;
  appointment: Appointment;
  state: ProposalState;
  onAccept: () => void;
  /** 받은 제안 [제안 취소] (A-5 거절) */
  onReject: () => void;
  /** 보낸 제안 [약속 취소] (A-6 철회) */
  onWithdraw: () => void;
};

// BDS 메시지 버블 Chatbubble/reserveationcard
// 흰 바탕 · 테두리 stroke/assistive · r12 · 안쪽 좌우 12 위아래 14 · 사이 10
// 제목 body/md bold → 구분선 → 내용(사이 8) → 안내 문구 → 버튼 (Chatbubble/reserved/button)
export function ProposalCard({
  mine,
  appointment,
  state,
  onAccept,
  onReject,
  onWithdraw,
}: ProposalCardProps) {
  const confirmed = state === 'accepted';
  const closedLabel = CLOSED_LABEL[state];

  let footer = null;
  if (state === 'pending' && !mine) {
    // state=received: 110 버튼 두 개, 사이 4
    footer = (
      <View className="flex-row gap-1">
        <Button hierarchy="secondary" size="sm" onPress={onReject} className="flex-1">
          제안 취소
        </Button>
        <Button hierarchy="primary" size="sm" onPress={onAccept} className="flex-1">
          수락하기
        </Button>
      </View>
    );
  } else if (state === 'pending') {
    // state=sent: 회색 버튼 하나
    footer = (
      <Button hierarchy="secondary" size="sm" onPress={onWithdraw} className="self-stretch">
        약속 취소
      </Button>
    );
  } else if (closedLabel) {
    // state=unselected: 누를 수 없는 회색 버튼
    footer = (
      <Button hierarchy="secondary" size="sm" disabled className="self-stretch">
        {closedLabel}
      </Button>
    );
  }

  return (
    <View className="w-[250px] gap-2.5 rounded-12 border border-stroke-assistive bg-surface-standard px-3 py-3.5">
      <View className="gap-2">
        <Text className="font-sans text-body-md font-medium text-object-boldest">
          {confirmed ? '약속 확정' : '약속 제안'}
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
      {closedLabel ? null : (
        <Text className="font-sans text-label-md font-normal text-object-assistive">
          {HELP_MESSAGE}
        </Text>
      )}
      {footer}
    </View>
  );
}

/**
 * E-5-4: 확정 약속이 있을 때 채팅방 위에 고정되는 한 줄 요약 (BDS Field/Control, accent 바탕 · 테두리 r8).
 * 날짜 시간, 장소 순서. 교환이 끝나면 확정 약속이 없어져 사라진다
 */
export function AppointmentBanner({ appointment }: { appointment: Appointment }) {
  return (
    <View className="mx-4 mt-2 flex-row items-center gap-2 rounded-8 border border-accent-subtle bg-accent-subtlest px-3.5 py-3">
      <Icon icon={CalendarCheckIcon} size="lg" weight="fill" color={semantic.accent.bolder} />
      <Text
        numberOfLines={1}
        className="flex-1 font-sans text-label-md font-normal text-object-boldest"
      >
        {`${formatShortDate(appointment.meetAt)} ${formatClock(appointment.meetAt)}, ${appointment.place}`}
      </Text>
    </View>
  );
}
