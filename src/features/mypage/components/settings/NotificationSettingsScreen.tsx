import { primitive, semantic } from '@/design-tokens';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';

import { Modal, TopNavigation } from '@/shared/components';

import {
  getMyInfo,
  getNotificationSettings,
  type MyInfoResponse,
  type NotificationType,
  updateMarketingConsent,
  updateNotificationSetting,
} from '../../api/mypageApi';
import { mypageKeys } from '../../api/queryKeys';
import { useToastMessage } from '../../hooks/useToastMessage';
import { ToastOverlay } from '../common/ToastOverlay';

// G-3 알림 설정 (추가 프레임 5-10 · 3115:53729, 약속 끄기 확인 3115:53760)
// 교환 요청 · 채팅 · 약속(교환 확인 포함)은 NT-5/NT-6, 마케팅 정보 수신은 MB-7 로 바로 저장한다.
// TODO: 5-10 '휴대폰 알림 꺼짐'(3115:53801) — 휴대폰 알림 권한을 읽으려면 expo-notifications(네이티브)가 필요하다.
//       붙이면 권한이 꺼져 있을 때 위에 '휴대폰 설정에서 알림이 꺼져 있어요 · 설정 열기'(Linking.openSettings) 띠를 띄우고 토글을 막는다.

type Row = { type: NotificationType; label: string };

const ROWS: Row[] = [
  { type: 'EXCHANGE_REQUEST', label: '교환 요청' },
  { type: 'CHAT', label: '채팅 메시지' },
  { type: 'APPOINTMENT', label: '약속 · 교환 확인' },
  { type: 'MARKETING', label: '마케팅 정보 수신' },
];

const SAVE_FAILED = '저장하지 못했어요. 잠시 후 다시 시도해 주세요';

/** 한 줄: label/lg + 토글, 높이 56 */
function ToggleRow({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: boolean;
  disabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View className="min-h-14 flex-row items-center justify-between px-4">
      <Text
        className={`font-sans text-label-lg font-normal ${disabled ? 'text-object-subtler' : 'text-object-boldest'}`}
      >
        {label}
      </Text>
      <Switch
        accessibilityLabel={label}
        value={value}
        disabled={disabled}
        onValueChange={onChange}
        trackColor={{ false: semantic.fill.subtle, true: semantic.fill.boldest }}
        thumbColor={primitive.base[0]}
        ios_backgroundColor={semantic.fill.subtle}
      />
    </View>
  );
}

export function NotificationSettingsScreen() {
  const queryClient = useQueryClient();
  const [toast, setToast] = useToastMessage();
  const [confirmAppointmentOff, setConfirmAppointmentOff] = useState(false);

  const me = useQuery({ queryKey: mypageKeys.me, queryFn: getMyInfo });
  const settings = useQuery({
    queryKey: mypageKeys.notificationSettings,
    queryFn: getNotificationSettings,
  });

  const save = useMutation({
    mutationFn: async ({ type, enabled }: { type: NotificationType; enabled: boolean }) => {
      if (type === 'MARKETING') await updateMarketingConsent(enabled);
      else await updateNotificationSetting(type, enabled);
    },
    // 누르면 바로 바뀐 것처럼 보여주고, 실패하면 되돌린다
    onMutate: ({ type, enabled }) => {
      if (type === 'MARKETING') {
        queryClient.setQueryData<MyInfoResponse>(mypageKeys.me, (old) =>
          old ? { ...old, marketingAgreed: enabled } : old,
        );
      } else {
        queryClient.setQueryData<Awaited<ReturnType<typeof getNotificationSettings>>>(
          mypageKeys.notificationSettings,
          (old) =>
            old && {
              settings: old.settings.map((item) =>
                item.type === type ? { ...item, enabled } : item,
              ),
            },
        );
      }
    },
    onError: () => setToast(SAVE_FAILED),
    onSettled: (_data, _error, { type }) =>
      queryClient.invalidateQueries({
        queryKey: type === 'MARKETING' ? mypageKeys.me : mypageKeys.notificationSettings,
      }),
  });

  const valueOf = (type: NotificationType) => {
    if (type === 'MARKETING') return me.data?.marketingAgreed ?? false;
    return settings.data?.settings.find((item) => item.type === type)?.enabled ?? true;
  };
  const loaded = (type: NotificationType) => (type === 'MARKETING' ? !!me.data : !!settings.data);

  const change = (type: NotificationType, enabled: boolean) => {
    // 5-10 약속 · 교환 확인을 끌 때는 한 번 더 묻는다
    if (type === 'APPOINTMENT' && !enabled) {
      setConfirmAppointmentOff(true);
      return;
    }
    save.mutate({ type, enabled });
  };

  return (
    <View className="flex-1 bg-surface-standard">
      <TopNavigation type="screen" title="알림 설정" onBack={() => router.back()} />
      <ScrollView contentContainerClassName="pb-6 pt-1">
        {ROWS.map((row) => (
          <ToggleRow
            key={row.type}
            label={row.label}
            value={valueOf(row.type)}
            disabled={!loaded(row.type)}
            onChange={(enabled) => change(row.type, enabled)}
          />
        ))}
      </ScrollView>

      <Modal
        visible={confirmAppointmentOff}
        title="약속 알림을 끄면 약속을 놓쳐 노쇼가 될 수 있어요"
        // TODO: 설명 · 버튼 문구는 Figma 에 'PD' 로 비어 있다. 정해지면 맞춘다
        description="교환 확인 알림도 함께 꺼져요"
        primary={{ label: '켜 두기', onPress: () => setConfirmAppointmentOff(false) }}
        secondary={{
          label: '끄기',
          onPress: () => {
            setConfirmAppointmentOff(false);
            save.mutate({ type: 'APPOINTMENT', enabled: false });
          },
        }}
        onRequestClose={() => setConfirmAppointmentOff(false)}
      />
      <ToastOverlay message={toast} />
    </View>
  );
}
