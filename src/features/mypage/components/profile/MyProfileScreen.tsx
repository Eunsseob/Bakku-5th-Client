import { useQuery } from '@tanstack/react-query';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { EmptyState, TopNavigation } from '@/shared/components';

import { MOCK_NO_SHOW_CASES, type NoShowCase } from '../../api/mockNoShows';
import { getMyInfo } from '../../api/mypageApi';
import { mypageKeys } from '../../api/queryKeys';
import { takeFlashToast } from '../../hooks/flashToast';
import { useToastMessage } from '../../hooks/useToastMessage';
import { MiniBadge } from '../common/MiniBadge';
import { ToastOverlay } from '../common/ToastOverlay';

// G-1 내 프로필 (추가 프레임 5-02 · 3115:52419, 교환 0회 3115:52463)
// MB-2: 닉네임 · 교환 완료 횟수 · 매너 지표 · 경고 · 이용 제한
// 노쇼 기록은 건별 목록 API 가 없어서 목업(MOCK_NO_SHOW_CASES)으로 그린다.

/** 화면 폭 띠 디바이더 (8px · #f3f4f6) */
function SectionGap() {
  return <View className="h-2 bg-surface-deeper" />;
}

function formatDate(iso: string) {
  const date = new Date(iso);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/** 10월 30일 (목) 오후 3:00 */
function formatAppointment(iso: string) {
  const date = new Date(iso);
  const hours = date.getHours();
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${formatDate(iso)} (${WEEKDAYS[date.getDay()]}) ${hours < 12 ? '오전' : '오후'} ${hour12}:${minutes}`;
}

/** 노쇼 한 건: 테두리 카드 r10 · 안쪽 14×12 · 간격 6. 인정된 건만 [이의 제기] */
function NoShowCard({ item, onAppeal }: { item: NoShowCase; onAppeal: () => void }) {
  const confirmed = item.status === 'CONFIRMED';
  return (
    <View className="gap-1.5 rounded-10 border border-stroke-assistive px-3.5 py-3">
      <View className="flex-row items-center justify-between">
        <Text className="font-sans text-label-md font-medium text-object-boldest">
          {formatAppointment(item.appointmentAt)}
        </Text>
        <MiniBadge tone={confirmed ? 'dark' : 'light'}>{confirmed ? '인정' : '확인 중'}</MiniBadge>
      </View>
      <Text className="font-sans text-label-sm font-normal text-object-alternative">
        {`${item.placeName} · ${item.partnerNickname}`}
      </Text>
      {confirmed ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAppeal}
          className="h-9 items-center justify-center rounded-10 border border-stroke-assistive bg-surface-standard px-3 active:bg-surface-deep"
        >
          <Text className="font-sans text-label-md font-medium text-object-boldest">이의 제기</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function MyProfileScreen() {
  const [toast, setToast] = useToastMessage();
  const me = useQuery({ queryKey: mypageKeys.me, queryFn: getMyInfo });
  const info = me.data;

  // 5-02 저장 뒤: 닉네임 수정에서 돌아오면 '프로필을 수정했어요'
  useFocusEffect(
    useCallback(() => {
      const message = takeFlashToast();
      if (message) setToast(message);
    }, [setToast]),
  );

  if (me.isError) {
    return (
      <View className="flex-1 bg-surface-standard">
        <TopNavigation type="screen" title="내 프로필" onBack={() => router.back()} />
        <View className="flex-1 justify-center">
          <EmptyState
            title="프로필을 불러오지 못했어요."
            action={{ label: '다시 시도', onPress: () => me.refetch() }}
          />
        </View>
      </View>
    );
  }

  const completed = info?.completedCount ?? 0;
  const summary = completed > 0 ? `교환 완료 ${completed}회` : '첫 교환을 기다리고 있어요';
  // 교환 0회 프레임(3115:52463)이 '굿즈헌터 · 50' 이라 점수가 없으면 50 으로 보여준다.
  // TODO: 매너 지표 단계(교환 연습생 · 굿즈헌터 · 프로 컬렉터) 기준 점수가 정해지면 점수에 따라 이름을 바꾼다
  const manner = `굿즈헌터 · ${info?.mannerScore ?? 50}`;
  // TODO: 노쇼 목록 API 가 생기면 목업 대신 서버 데이터 (개수는 MB-2 noShow 와 맞는지 확인)
  const noShows = MOCK_NO_SHOW_CASES;
  const confirmedCount = noShows.filter((item) => item.status === 'CONFIRMED').length;
  const pendingCount = noShows.length - confirmedCount;
  const status = info?.restrictedUntil
    ? `이용 제한 · ${formatDate(info.restrictedUntil)}까지`
    : `정상 · 경고 ${info?.warningCount ?? 0}회`;

  return (
    <View className="flex-1 bg-surface-standard">
      <TopNavigation type="screen" title="내 프로필" onBack={() => router.back()} />
      <ScrollView contentContainerClassName="pb-6">
        <View className="gap-3 px-4 pb-4 pt-3">
          <View className="flex-row items-center justify-between gap-3">
            <View className="flex-1 gap-1">
              <Text
                numberOfLines={1}
                className="font-sans text-title-2 font-bold text-object-boldest"
              >
                {info?.nickname ?? ' '}
              </Text>
              <Text className="font-sans text-body-xs font-normal text-object-alternative">
                {info ? summary : ' '}
              </Text>
            </View>
            {/* 수정: 높이 32 · r10 · #f3f4f6 · label/md medium */}
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/me/nickname')}
              className="h-8 items-center justify-center rounded-10 bg-surface-deeper px-3 active:bg-surface-deepest"
            >
              <Text className="font-sans text-label-md font-medium text-object-boldest">수정</Text>
            </Pressable>
          </View>

          {/* 매너 지표: r12 · #f3f4f6 · 안쪽 16×14 */}
          <View className="flex-row items-center justify-between rounded-12 bg-surface-deeper px-4 py-3.5">
            <Text className="font-sans text-label-md font-medium text-object-boldest">
              매너 지표
            </Text>
            <Text className="font-sans text-title-1 font-bold text-object-boldest">{manner}</Text>
          </View>
        </View>

        <SectionGap />

        <View className="gap-2.5 p-4">
          <Text className="font-sans text-body-md font-bold text-object-boldest">노쇼 기록</Text>
          <Text className="font-sans text-body-xs font-normal text-object-alternative">
            {`인정 ${confirmedCount}회 · 확인 중 ${pendingCount}건`}
          </Text>
          {noShows.map((item) => (
            <NoShowCard
              key={item.id}
              item={item}
              // TODO: 이의 제기 화면 · API 가 정해지면 연결
              onAppeal={() => setToast('이의 제기는 준비 중이에요')}
            />
          ))}
        </View>

        <SectionGap />

        <View className="flex-row items-center justify-between px-4 py-3.5">
          <Text className="font-sans text-body-md font-normal text-object-boldest">이용 상태</Text>
          <Text className="font-sans text-label-md font-normal text-object-boldest">{status}</Text>
        </View>
      </ScrollView>
      <ToastOverlay message={toast} />
    </View>
  );
}
