import Constants from 'expo-constants';
import { router } from 'expo-router';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { logout } from '@/features/auth/utils/logout';
import { Divider, MenuRow, Modal, TopNavigation } from '@/shared/components';

// G-1. 설정-상세 (2729:30664). 알림 설정 → G-3(추가 프레임), 로그아웃 → G-5 5-09a 확인 팝업

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

export function SettingsScreen() {
  const [confirmLogout, setConfirmLogout] = useState(false);

  return (
    <View className="flex-1 bg-surface-standard">
      <TopNavigation type="screen" title="설정" onBack={() => router.back()} />
      <ScrollView contentContainerClassName="pb-6 pt-4">
        <View className="gap-2">
          <MenuRow
            label="알림 설정"
            trailingIcon={CaretRightIcon}
            onPress={() => router.push('/me/notifications')}
          />
          <MenuRow
            label="차단 사용자"
            trailingIcon={CaretRightIcon}
            onPress={() => router.push('/mypage/blocks')}
          />
          <MenuRow
            label="문의하기"
            trailingIcon={CaretRightIcon}
            onPress={() => router.push('/mypage/inquiry')}
          />
          <MenuRow
            label="약관 및 정책"
            trailingIcon={CaretRightIcon}
            onPress={() => router.push('/mypage/terms')}
          />
          {/* 별도 기능이 없어서 들어가지 않고 버전만 보여준다 */}
          <MenuRow label="앱 버전" trailingLabel={APP_VERSION} />
        </View>

        <Divider className="mx-[7.5px] mt-4" />

        {/* 로그아웃 · 탈퇴하기: 344 가운데, 한 줄 24 · 간격 28 */}
        <View className="mt-[30px] gap-7 px-[15.5px]">
          <Pressable
            accessibilityRole="button"
            onPress={() => setConfirmLogout(true)}
            className="h-6 justify-center"
          >
            <Text className="font-sans text-label-lg font-medium text-theme-red-bold">
              로그아웃
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/withdraw')}
            className="h-6 justify-center"
          >
            <Text className="font-sans text-label-lg font-medium text-object-bold">탈퇴하기</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* G-5 5-09a 로그아웃 확인 팝업. TODO: 버튼 문구는 Figma 에 'PD' 로 비어 있다 */}
      <Modal
        visible={confirmLogout}
        title="로그아웃할까요?"
        primary={{
          label: '로그아웃',
          onPress: () => {
            setConfirmLogout(false);
            logout();
          },
        }}
        secondary={{ label: '취소', onPress: () => setConfirmLogout(false) }}
        onRequestClose={() => setConfirmLogout(false)}
      />
    </View>
  );
}
