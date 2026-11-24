import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { BellIcon } from 'phosphor-react-native/src/icons/Bell';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';
import { ScrollView, Text, View } from 'react-native';

import { Button, Divider, MenuRow, TopNavigation } from '@/shared/components';

import { getMyInfo } from '../api/mypageApi';
import { mypageKeys } from '../api/queryKeys';
import { useToastMessage } from '../hooks/useToastMessage';
import { ToastOverlay } from './ToastOverlay';

// G. 마이페이지. Figma BDS '📝 화면 작업 > G. 마이페이지' (2729:30645)
// 프로필 카드(MB-2 닉네임 · 교환 완료 횟수) · 내가 올린 교환글 · 설정

const PREPARING = '준비 중이에요';

export function MyPageScreen() {
  const [toast, setToast] = useToastMessage();
  const me = useQuery({ queryKey: mypageKeys.me, queryFn: getMyInfo });

  const completed = me.data?.completedCount ?? 0;
  let summary = '';
  if (me.data) summary = completed > 0 ? `교환 완료 ${completed}회` : '첫 교환을 기다리고 있어요';

  return (
    <View className="flex-1 bg-surface-standard">
      <TopNavigation
        type="home"
        title="마이페이지"
        actions={[
          {
            icon: BellIcon,
            accessibilityLabel: '알림',
            // TODO: C-2 알림 화면 · 안 읽은 알림(점 배지)이 생기면 연결
            onPress: () => setToast('새로운 알림이 없어요'),
          },
        ]}
      />
      <ScrollView contentContainerClassName="pb-6">
        {/* 프로필 카드: 343 · 테두리 stroke/subtler · r16 · 안쪽 20 */}
        <View className="mx-4 mt-4 flex-row items-center rounded-16 border border-stroke-subtler p-5">
          <View className="flex-1 gap-0.5">
            <Text
              numberOfLines={1}
              className="font-sans text-title-1 font-semibold text-object-bolder"
            >
              {me.data?.nickname ?? (me.isError ? '정보를 불러오지 못했어요' : ' ')}
            </Text>
            <Text
              numberOfLines={1}
              className="font-sans text-label-sm font-normal text-object-assistive"
            >
              {summary}
            </Text>
          </View>
          {/* TODO: MB-3 닉네임 수정(2차) */}
          <Button hierarchy="secondary" size="xs" onPress={() => setToast(PREPARING)}>
            프로필 수정
          </Button>
        </View>

        {/* 디바이더 360 가운데 */}
        <Divider className="mx-[7.5px] mt-4" />

        <View className="mt-6 gap-2">
          {/* TODO: 내 교환글 목록 API 가 나오면 G-2 화면으로 이동 */}
          <MenuRow
            label="내가 올린 교환글"
            trailingIcon={CaretRightIcon}
            onPress={() => setToast(PREPARING)}
          />
          <MenuRow
            label="설정"
            trailingIcon={CaretRightIcon}
            onPress={() => router.push('/mypage/settings')}
          />
        </View>
      </ScrollView>
      <ToastOverlay message={toast} />
    </View>
  );
}
