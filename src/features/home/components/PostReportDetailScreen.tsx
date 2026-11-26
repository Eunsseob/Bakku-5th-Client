import { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionArea, TextField, TopNavigation } from '@/shared/components';

export const reportReasonDetails = {
  sale: {
    title: '판매 · 구매 유도',
    description: '제품을 현금을 통해 구매하거나 판매하도록 유도하는 경우 신고해주세요.',
  },
  external: {
    title: '외부 거래',
    description:
      '바꾸 앱이 아닌 다른 메신저, 커뮤니티 등을 통해 거래를 유도하는 경우 신고해주세요.',
  },
  inappropriate: {
    title: '부적절한 사진 · 내용',
    description: '부적절한 사진이나 내용을 게시한 경우 신고해주세요.',
  },
  fraud: {
    title: '사기 의심',
    description: '사기가 의심되는 경우 신고해주세요.',
  },
  other: {
    title: '기타',
    description: '신고 내용을 자유롭게 적어주세요.',
  },
};

export type ReportReason = keyof typeof reportReasonDetails;

export function PostReportDetailScreen({
  reason,
  onBack,
  onComplete,
}: {
  reason: ReportReason;
  onBack: () => void;
  onComplete: () => void;
}) {
  const { left, right } = useSafeAreaInsets();
  const { title, description } = reportReasonDetails[reason];
  const [details, setDetails] = useState('');
  const requiresDetails = reason === 'other';

  return (
    <KeyboardAvoidingView
      behavior="padding"
      enabled={requiresDetails && Platform.OS === 'ios'}
      className="flex-1 bg-white"
      style={{ paddingLeft: left, paddingRight: right }}
    >
      <TopNavigation type="screen" onBack={onBack} />
      <ScrollView className="flex-1" contentContainerClassName="gap-3 px-4 py-6">
        <Text
          accessibilityRole="header"
          className="font-sans text-[24px] leading-8 tracking-[-0.48px] text-[#2E303D]"
        >
          {title}
        </Text>
        <Text className="font-sans text-[16px] leading-[26px] text-[#00051E8D]">{description}</Text>
        {requiresDetails && (
          <View className="mt-5 gap-3">
            <Text className="font-sans text-label-md font-semibold text-object-boldest">
              상세 설명 <Text className="font-normal text-object-assistive">(필수)</Text>
            </Text>
            <TextField
              accessibilityLabel="상세 설명 (필수)"
              multiline
              placeholder="신고 내용을 입력해주세요."
              value={details}
              onChangeText={setDetails}
            />
          </View>
        )}
      </ScrollView>
      <ActionArea
        main={{
          label: '신고하기',
          hierarchy: 'accent',
          disabled: requiresDetails && !details.trim(),
          onPress: () => {
            if (requiresDetails) Keyboard.dismiss();
            onComplete();
          },
        }}
      />
    </KeyboardAvoidingView>
  );
}
