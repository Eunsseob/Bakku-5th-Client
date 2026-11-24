import { Fragment } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Divider, ListItem, TopNavigation } from '@/shared/components';

import { reportReasonDetails, type ReportReason } from './PostReportDetailScreen';

const detailedReportReasons: ReportReason[] = ['sale', 'external', 'inappropriate', 'fraud', 'other'];

export function PostReportScreen({
  onBack,
  onReasonPress,
}: {
  onBack: () => void;
  onReasonPress: (reason: ReportReason) => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white">
      <TopNavigation type="screen" onBack={onBack} />
      <ScrollView
        contentContainerClassName="grow justify-between gap-6 pt-6"
        contentContainerStyle={{
          paddingLeft: insets.left + 16,
          paddingRight: insets.right + 16,
          paddingBottom: insets.bottom + 12,
        }}
      >
        <Text
          accessibilityRole="header"
          className="font-sans text-[24px] leading-8 tracking-[-0.48px] text-[#2E303D]"
        >
          신고하는 이유를 선택해주세요.
        </Text>
        <View>
          {detailedReportReasons.map((reason, index) => (
            <Fragment key={reason}>
              {index > 0 && <Divider />}
              <ListItem
                label={reportReasonDetails[reason].title}
                trailing="chevronRight"
                onPress={() => onReasonPress(reason)}
              />
            </Fragment>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
