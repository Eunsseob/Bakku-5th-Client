import { useMutation, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { logout } from '@/features/auth/utils/logout';
import {
  ActionArea,
  Checkbox,
  Divider,
  Modal,
  Radio,
  TextDivider,
  TopNavigation,
} from '@/shared/components';

import { getWithdrawalNotice, withdraw, type WithdrawalReason } from '../api/mypageApi';
import { mypageKeys } from '../api/queryKeys';
import { useToastMessage } from '../hooks/useToastMessage';
import { ToastOverlay } from './ToastOverlay';

// G-1-5. 설정 - 탈퇴하기 (2729:31401). MB-5 진행 중인 교환 안내 · 사유 선택 · 확인 체크
// → G-1-5-1 확인 모달 (2840:31787) → MB-6

const NOTICES = [
  '교환 가능 글은 자동으로 삭제돼요',
  '대화중인 모든 채팅방은 나가기 처리되며, 상대에게는\n‘탈퇴한 사용자’로 보여요',
  '노쇼, 제재 기록은 1년 동안 보관해요',
  '같은 계정으로는 7일 뒤부터 다시 가입할 수 있어요',
];

const REASONS: { value: WithdrawalReason; label: string }[] = [
  { value: 'NO_WANTED_GOODS', label: '원하는 굿즈가 없어요' },
  { value: 'HARD_TO_FIND_PARTNER', label: '교환 상대를 찾기 어려워요' },
  { value: 'INCONVENIENT', label: '사용이 불편해요' },
  { value: 'OTHER', label: '기타' },
];

/** 안내 한 줄: Text Divider(점) + label/md object/bold, 간격 8 */
function Notice({ children }: { children: string }) {
  return (
    <View className="flex-row items-start gap-2">
      <TextDivider />
      <Text className="font-sans text-label-md font-normal text-object-bold">{children}</Text>
    </View>
  );
}

export function WithdrawScreen() {
  const [toast, setToast] = useToastMessage();
  const [reason, setReason] = useState<WithdrawalReason | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const notice = useQuery({
    queryKey: mypageKeys.withdrawalNotice,
    queryFn: getWithdrawalNotice,
  });
  const inProgress = notice.data?.inProgressExchangeCount ?? 0;

  // TODO: 명세상 카카오 · 네이버 연결 끊기(SDK)를 먼저 해야 한다. 로그인한 소셜 종류를 저장하게 되면 붙인다
  const leave = useMutation({
    mutationFn: () => withdraw(reason),
    onSuccess: logout,
    onError: () => {
      setConfirming(false);
      setToast('탈퇴하지 못했어요. 잠시 후 다시 시도해 주세요');
    },
  });

  return (
    <View className="flex-1 bg-surface-standard">
      <TopNavigation type="screen" title="탈퇴하기" onBack={() => router.back()} />
      <ScrollView contentContainerClassName="pb-6 pt-4">
        <Text className="h-[26px] px-4 font-sans text-title-2 font-semibold text-object-bold">
          탈퇴하기 전에 확인해주세요
        </Text>
        <View className="mt-4 gap-4 px-4">
          {/* TODO: 진행 중인 교환 안내는 1차 와이어프레임 문구. 하이파이 디자인이 나오면 맞춘다 */}
          {inProgress > 0 ? (
            <Notice>
              {`진행중인 교환이 ${inProgress}건 있어요. 탈퇴시 잡혀있는 약속은 자동으로 취소되고 상대에게 약속 취소 알림이 발송돼요`}
            </Notice>
          ) : null}
          {NOTICES.map((text) => (
            <Notice key={text}>{text}</Notice>
          ))}
        </View>

        {/* 디바이더 360 가운데, 안내와 32 · 사유와 24 */}
        <Divider className="mx-[7.5px] mt-8" />

        <View className="mt-6 gap-4 px-4">
          <Text className="font-sans text-title-2 font-semibold text-object-boldest">
            탈퇴사유를 알려주세요
          </Text>
          <View className="gap-4">
            {REASONS.map((item) => (
              <Radio
                key={item.value}
                checked={reason === item.value}
                label={item.label}
                onPress={() => setReason(item.value)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <View className="px-5 pb-2">
        <Checkbox
          status={agreed ? 'checked' : 'unchecked'}
          label="위 내용을 확인했습니다"
          onPress={() => setAgreed((value) => !value)}
        />
      </View>
      {/* 메인 버튼은 회색(secondary). 확인 체크 전에는 누를 수 없다 */}
      <ActionArea
        main={{
          label: '탈퇴하기',
          hierarchy: 'secondary',
          disabled: !agreed,
          onPress: () => setConfirming(true),
        }}
      />

      {/* G-1-5-1: [탈퇴하기] 회색 · [취소] 진한 버튼 */}
      <Modal
        visible={confirming}
        title="정말 탈퇴할까요?"
        description={'탈퇴시 계정을 다시 복구할 수 없어요\n재가입은 7일 후 가능해요'}
        primary={{ label: '취소', onPress: () => setConfirming(false) }}
        secondary={{
          label: '탈퇴하기',
          onPress: () => {
            if (!leave.isPending) leave.mutate();
          },
        }}
        onRequestClose={() => setConfirming(false)}
      />
      <ToastOverlay message={toast} />
    </View>
  );
}
