import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { BellIcon } from 'phosphor-react-native/src/icons/Bell';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';
import { ScrollView, Text, View } from 'react-native';

import { Button, Divider, MenuRow, TextDivider, TopNavigation } from '@/shared/components';

import { getMyInfo } from '../../api/mypageApi';
import { mypageKeys } from '../../api/queryKeys';
import { useToastMessage } from '../../hooks/useToastMessage';
import { ToastOverlay } from '../common/ToastOverlay';

// G. 마이페이지. Figma BDS '📝 화면 작업 > G. 마이페이지' (2729:30645)
// 프로필 카드(MB-2 닉네임 · 교환 횟수 · 매너 단계) [내 프로필] · 내가 올린 교환글 · 설정

export function MyPageScreen() {
  const [toast, setToast] = useToastMessage();
  const me = useQuery({ queryKey: mypageKeys.me, queryFn: getMyInfo });

  const completed = me.data?.completedCount ?? 0;

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
        {/* 프로필 카드: 344 · 테두리 stroke/subtler · r16 · 안쪽 왼20 오14 위아래20. [내 프로필] → 내 프로필 */}
        <View className="mx-4 mt-4 flex-row items-center rounded-16 border border-stroke-subtler py-5 pl-5 pr-3.5">
          <View className="flex-1">
            <Text
              numberOfLines={1}
              className="font-sans text-title-1 font-semibold text-object-bolder"
            >
              {me.data?.nickname ?? (me.isError ? '정보를 불러오지 못했어요' : ' ')}
            </Text>
            {/* 교환 N 회 · 굿즈헌터 (label/sm · alternative) */}
            <View className="flex-row items-center gap-1">
              <Text className="font-sans text-label-sm font-normal text-object-alternative">
                {me.data ? `교환 ${completed}회` : ' '}
              </Text>
              {me.data ? (
                <>
                  <TextDivider />
                  {/* TODO: 매너 지표 단계(교환 연습생 · 굿즈헌터 · 프로 컬렉터) 기준이 정해지면 점수에 따라 바꾼다 */}
                  <Text className="font-sans text-label-sm font-normal text-object-alternative">
                    굿즈헌터
                  </Text>
                </>
              ) : null}
            </View>
          </View>
          <Button hierarchy="secondary" size="sm" onPress={() => router.push('/me/profile')}>
            내 프로필
          </Button>
        </View>

        {/* 디바이더 360 가운데 */}
        <Divider className="mx-[7.5px] mt-4" />

        <View className="mt-6 gap-2">
          <MenuRow
            label="내가 올린 교환글"
            trailingIcon={CaretRightIcon}
            onPress={() => router.push('/mypage/posts')}
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
