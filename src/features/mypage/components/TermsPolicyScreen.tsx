import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';
import { ScrollView, View } from 'react-native';

import { getTerms } from '@/features/auth/api/terms';
import { EmptyState, MenuRow, TopNavigation } from '@/shared/components';

import { useToastMessage } from '../hooks/useToastMessage';
import { ToastOverlay } from './ToastOverlay';

// G-1-2. 설정 - 약관 및 정책 (2729:30740). 약관 목록은 TM-1, 누르면 약관 주소(url)를 연다.
// 가장 민감한 약관(개인정보 처리방침)은 굵게 (Figma 주석: 카카오 벤치마킹)

export function TermsPolicyScreen() {
  const [toast, setToast] = useToastMessage();
  const terms = useQuery({ queryKey: ['terms'], queryFn: ({ signal }) => getTerms(signal) });

  const open = (url: string | null) => {
    if (!url) return setToast('준비 중이에요');
    openBrowserAsync(url).catch(() => setToast('약관을 열지 못했어요'));
  };

  return (
    <View className="flex-1 bg-surface-standard">
      <TopNavigation type="screen" title="약관 및 정책" onBack={() => router.back()} />
      {terms.isError ? (
        <View className="flex-1 justify-center">
          <EmptyState
            title="약관을 불러오지 못했어요."
            action={{ label: '다시 시도', onPress: () => terms.refetch() }}
          />
        </View>
      ) : (
        <ScrollView contentContainerClassName="gap-2 pb-6 pt-4">
          {terms.data?.map((term) => (
            <MenuRow
              key={term.termsType}
              label={term.title}
              emphasized={term.title.includes('개인정보')}
              trailingIcon={CaretRightIcon}
              onPress={() => open(term.url)}
            />
          ))}
          {terms.data ? (
            // TODO: 오픈소스 라이선스 화면
            <MenuRow
              label="오픈소스 라이선스"
              trailingIcon={CaretRightIcon}
              onPress={() => setToast('준비 중이에요')}
            />
          ) : null}
        </ScrollView>
      )}
      <ToastOverlay message={toast} />
    </View>
  );
}
