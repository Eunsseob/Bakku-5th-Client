import type { Appointment } from '@/features/appointment/chat/types';
import { formatClock, formatDateDivider } from '@/features/appointment/chat/utils/formatTime';
import { ArrowsLeftRightIcon } from 'phosphor-react-native/src/icons/ArrowsLeftRight';
import { CalendarCheckIcon } from 'phosphor-react-native/src/icons/CalendarCheck';
import { ClockIcon } from 'phosphor-react-native/src/icons/Clock';
import { MapPinIcon } from 'phosphor-react-native/src/icons/MapPin';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { primitive } from '@/design-tokens';
import { Button, Divider, Icon, type IconComponent } from '@/shared/components';

import type { CompletionState } from '../types';

// F. 교환 완료 카드 (채팅방 메시지). Figma BDS '📝 화면 작업 > ✅F. 교환 완료' 값 그대로
// 흰 바탕 · stroke-subtler 테두리 r12, 안쪽 14·12, 사이 10
// 제목 body/md Medium → 8 → [BDS Divider → 12 → 내용 label/md (줄 사이 8)] → 안내 · 버튼(224, 사이 8)
// F-1 묻는 카드 / F-2 성공 / F-3 실패. '합의하에 취소했어요' 는 2차로 옮겨져 뺐다.
// 와이어 회색(foreground/normal #364153 · neutral #4a5565 · gray/400 #99a1af)은 가장 가까운 BDS 회색(wire.tsx 표)을 쓴다.

// primitive.gray 는 JS 에서 단계를 펼쳐 만들어 숫자 키 타입이 빠져 있다
const GRAY = primitive.gray as unknown as Record<number, string>;

const TITLE: Record<CompletionState, string> = {
  asking: '교환을 완료했나요?',
  completed: '교환에 성공했어요!',
  cancelled: '교환이 취소됐어요',
};

/** 아이콘 16 + label/md Regular */
function DetailRow({ icon, children }: { icon: IconComponent; children: ReactNode }) {
  return (
    <View className="flex-row items-start gap-2">
      <View className="py-0.5">
        <Icon icon={icon} size="md" color={GRAY[300]} />
      </View>
      <View className="flex-1 gap-0.5">{children}</View>
    </View>
  );
}

function DetailText({ children }: { children: string }) {
  return <Text className="font-sans text-label-md font-normal text-gray-600">{children}</Text>;
}

type CompletionCardProps = {
  appointment: Appointment;
  state: CompletionState;
  /** [무사히 교환했어요] → F-1-2 바텀시트 */
  onComplete: () => void;
  /** [교환하지 못했어요] → F-3 */
  onFail: () => void;
};

export function CompletionCard({ appointment, state, onComplete, onFail }: CompletionCardProps) {
  const asking = state === 'asking';

  return (
    <View className="w-[250px] gap-2.5 rounded-12 border border-stroke-subtler bg-surface-standard px-3 py-3.5">
      <View className="gap-2">
        <Text
          accessibilityRole="header"
          className="font-sans text-body-md font-medium text-gray-700"
        >
          {TITLE[state]}
        </Text>
        <View className="gap-3">
          <Divider />
          <View className="gap-2">
            <DetailRow icon={ArrowsLeftRightIcon}>
              {appointment.items.map((item) => (
                <DetailText key={item.id}>{item.name}</DetailText>
              ))}
            </DetailRow>
            <DetailRow icon={CalendarCheckIcon}>
              <DetailText>{formatDateDivider(appointment.meetAt)}</DetailText>
            </DetailRow>
            <DetailRow icon={ClockIcon}>
              <DetailText>{formatClock(appointment.meetAt)}</DetailText>
            </DetailRow>
            <DetailRow icon={MapPinIcon}>
              <DetailText>{appointment.place}</DetailText>
            </DetailRow>
          </View>
        </View>
      </View>

      {state === 'completed' ? (
        <Text className="font-sans text-label-md font-semibold text-accent-bold">
          소중한 굿즈와 행복한 시간 보내세요!
        </Text>
      ) : null}

      {asking ? (
        <>
          <Text className="font-sans text-label-md font-normal text-object-assistive">
            약속 30분 전에 알림을 보내드려요
          </Text>
          <View className="gap-2">
            <Button hierarchy="secondary" size="sm" onPress={onFail} className="self-stretch">
              교환하지 못했어요
            </Button>
            <Button hierarchy="primary" size="sm" onPress={onComplete} className="self-stretch">
              무사히 교환했어요
            </Button>
          </View>
        </>
      ) : null}
    </View>
  );
}
