import { router } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Divider, MenuRow, Modal, TopNavigation } from '@/shared/components';

// G-1-3. 설정 - 문의하기 (2729:30765). 항목을 누르면 문의 폼(웹)으로 간다.
// G-1-3-1. 폼을 열지 못하면 이메일로 보내달라는 모달을 띄운다.

/** TODO: 문의 폼 주소 · 문의 이메일이 정해지면 채운다 */
const INQUIRY_FORM_URL = '';
const INQUIRY_EMAIL = '';

const TOPICS = [
  '노쇼 신고 이의 제기',
  '교환 물품 문제',
  '마감 임박건 취소 구제신청',
  '신고 및 제재문의',
  '오류 및 버그신고',
  '기타 문의',
];

const NOTES = [
  '선택하면 문의 폼으로 이동합니다',
  '영업일 기준 3일 안에 등록한 이메일로 답변을 회신합니다',
];

export function InquiryScreen() {
  const [formFailed, setFormFailed] = useState(false);

  const openForm = () => {
    if (!INQUIRY_FORM_URL) return setFormFailed(true);
    openBrowserAsync(INQUIRY_FORM_URL).catch(() => setFormFailed(true));
  };

  return (
    <View className="flex-1 bg-surface-standard">
      <TopNavigation type="screen" title="문의하기" onBack={() => router.back()} />
      <ScrollView contentContainerClassName="pb-6 pt-4">
        <Text className="h-[26px] px-4 font-sans text-title-2 font-semibold text-object-boldest">
          어떤 도움이 필요하세요?
        </Text>
        <View className="mt-4 gap-2">
          {TOPICS.map((topic) => (
            <MenuRow key={topic} label={topic} trailingIcon={CaretRightIcon} onPress={openForm} />
          ))}
        </View>
        <Divider className="mx-[7.5px] mt-4" />
        {/* 글머리 목록: label/sm · object/subtle, 왼쪽 13 + 들여쓰기 18 */}
        <View className="mt-3.5 pl-[13px]">
          {NOTES.map((note) => (
            <View key={note} className="flex-row">
              <View className="h-[18px] w-[18px] items-center justify-center">
                <View className="size-[3px] rounded-max bg-object-subtle" />
              </View>
              <Text className="shrink font-sans text-label-sm font-normal text-object-subtle">
                {note}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* TODO: Figma 는 [닫기] · [주소 복사]. 복사는 expo-clipboard(네이티브 모듈)가 필요해서 이메일이 정해지면 붙인다 */}
      <Modal
        visible={formFailed}
        title="문의 폼을 열지 못했어요"
        description={`문의하고 싶은 내용을 이메일로 보내주세요${INQUIRY_EMAIL ? `\n${INQUIRY_EMAIL}` : ''}`}
        primary={{ label: '닫기', onPress: () => setFormFailed(false) }}
        onRequestClose={() => setFormFailed(false)}
      />
    </View>
  );
}
