import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';
import { ScrollView, View } from 'react-native';

import { getTerms } from '@/features/auth/api/terms';
import { MenuRow, TopNavigation } from '@/shared/components';

import { useToastMessage } from '../../hooks/useToastMessage';
import { ToastOverlay } from '../common/ToastOverlay';

// G-1-2. 설정 - 약관 및 정책 (2729:30740)
// Figma 는 서비스 이용약관 · 개인정보 처리방침(굵게, 카카오 벤치마킹) · 오픈소스 라이선스 3개만 보여준다.
// 누르면 TM-1 약관 목록에서 같은 termsType 의 url(최신 버전)을 연다. 위치기반서비스 이용약관은 없음.

const POLICY_ROWS = [
  { termsType: 'SERVICE', label: '서비스 이용약관', emphasized: false },
  { termsType: 'PRIVACY_POLICY', label: '개인정보 처리방침', emphasized: true },
] as const;

export function TermsPolicyScreen() {
  const [toast, setToast] = useToastMessage();
  const terms = useQuery({ queryKey: ['terms'], queryFn: ({ signal }) => getTerms(signal) });

  const open = (termsType: string) => {
    if (terms.isError) {
      terms.refetch();
      return setToast('약관을 불러오지 못했어요. 다시 눌러 주세요');
    }
    const url = terms.data?.find((term) => term.termsType === termsType)?.url;
    if (!url) return setToast('준비 중이에요');
    openBrowserAsync(url).catch(() => setToast('약관을 열지 못했어요'));
  };

  return (
    <View className="flex-1 bg-surface-standard">
      <TopNavigation type="screen" title="약관 및 정책" onBack={() => router.back()} />
      <ScrollView contentContainerClassName="gap-2 pb-6 pt-4">
        {POLICY_ROWS.map((row) => (
          <MenuRow
            key={row.termsType}
            label={row.label}
            emphasized={row.emphasized}
            trailingIcon={CaretRightIcon}
            onPress={() => open(row.termsType)}
          />
        ))}
        {/* TODO: 오픈소스 라이선스 화면 */}
        <MenuRow
          label="오픈소스 라이선스"
          trailingIcon={CaretRightIcon}
          onPress={() => setToast('준비 중이에요')}
        />
      </ScrollView>
      <ToastOverlay message={toast} />
    </View>
  );
}
