import type { Appointment } from '@/features/appointment/chat/types';
import { formatClock, formatDateDivider } from '@/features/appointment/chat/utils/formatTime';
import { ArrowsLeftRightIcon } from 'phosphor-react-native/src/icons/ArrowsLeftRight';
import { CalendarCheckIcon } from 'phosphor-react-native/src/icons/CalendarCheck';
import { ClockIcon } from 'phosphor-react-native/src/icons/Clock';
import { MapPinIcon } from 'phosphor-react-native/src/icons/MapPin';
import { Pressable, Text, View } from 'react-native';

import { Icon, type IconComponent } from '@/shared/components';

import type { CompletionState } from '../types';
import { F_COLOR } from './fColors';

// F-1 교환 완료 확인 카드 (채팅방 메시지). Figma UI-Flow '💻 F. 현장교환, 완료' 의 카드 값 그대로
// 흰 바탕 r12, 안쪽 12·10, 제목 → 구분선 → 내용(14 Regular, 줄 간격 8) → 버튼(36, r8)

const TITLE: Record<CompletionState, string> = {
  asking: '교환을 무사히 완료했나요?',
  completed: '교환에 성공했어요!',
  cancelled: '약속이 취소됐어요',
};

/** 아이콘 16 + 14 Regular */
function DetailRow({ icon, children }: { icon: IconComponent; children: string }) {
  return (
    <View className="flex-row items-start gap-2">
      <View className="py-0.5">
        <Icon icon={icon} size="md" color={F_COLOR.assistive} />
      </View>
      <Text className="flex-1 font-sans text-label-md font-normal text-[#4a5565]">{children}</Text>
    </View>
  );
}

/** 카드 안 버튼 (36, r8, 14) */
function CardButton({
  label,
  onPress,
  tone,
}: {
  label: string;
  onPress: () => void;
  tone: 'light' | 'accent';
}) {
  const light = tone === 'light';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={`h-9 items-center justify-center rounded-8 ${light ? 'border border-[#e5e7eb] bg-[#f3f4f6]' : 'bg-[#9c43ff]'}`}
      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
    >
      <Text
        className={`font-sans text-label-md ${light ? 'font-medium text-[#6a7282]' : 'font-semibold text-[#f6f2ff]'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

type CompletionCardProps = {
  appointment: Appointment;
  state: CompletionState;
  /** [교환을 완료했어요!] */
  onComplete: () => void;
  /** [교환에 실패했어요] */
  onFail: () => void;
  /** [합의하에 취소했어요] */
  onCancelByAgreement: () => void;
};

export function CompletionCard({
  appointment,
  state,
  onComplete,
  onFail,
  onCancelByAgreement,
}: CompletionCardProps) {
  const asking = state === 'asking';

  return (
    <View className="gap-4 rounded-12 bg-white px-2.5 py-3">
      <View className="gap-2">
        {/* 묻는 카드는 15 Medium, 결과 카드는 18 SemiBold */}
        <Text
          accessibilityRole="header"
          className={`font-sans text-[#364153] ${asking ? 'text-body-md font-medium' : 'text-title-1 font-semibold'}`}
        >
          {TITLE[state]}
        </Text>
        <View className="gap-3">
          <View className="h-px bg-[#e5e7eb]" />
          <View className="gap-2">
            <DetailRow icon={ArrowsLeftRightIcon}>
              {appointment.items.map((item) => item.name).join('\n')}
            </DetailRow>
            <DetailRow icon={CalendarCheckIcon}>{formatDateDivider(appointment.meetAt)}</DetailRow>
            <DetailRow icon={ClockIcon}>{formatClock(appointment.meetAt)}</DetailRow>
            <DetailRow icon={MapPinIcon}>{appointment.place}</DetailRow>
          </View>
        </View>
      </View>

      {state === 'completed' ? (
        <Text className="font-sans text-label-md font-semibold text-[#4a5565]">
          소중한 굿즈와 행복한 시간 보내세요!
        </Text>
      ) : null}

      {asking ? (
        <View className="gap-2">
          <CardButton label="교환에 실패했어요" tone="light" onPress={onFail} />
          <CardButton label="교환을 완료했어요!" tone="accent" onPress={onComplete} />
          <Pressable
            accessibilityRole="button"
            onPress={onCancelByAgreement}
            hitSlop={8}
            className="self-end"
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text className="font-sans text-label-xs font-normal text-[#4a5565] underline">
              합의하에 취소했어요
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
