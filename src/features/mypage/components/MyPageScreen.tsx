import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { logout } from '@/features/auth/utils/logout';
import { Button } from '@/shared/components';

// 내정보 (G 화면 작업 전 임시). 자동 로그인 · 토큰 재발급 테스트용 로그아웃 버튼만 둔다.

export function MyPageScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-1 items-center justify-center bg-surface-standard"
      style={{ paddingTop: insets.top }}
    >
      {/* BDS Button 은 self-start 라서 감싸서 가운데에 둔다 */}
      <View>
        <Button hierarchy="secondary" size="md" onPress={logout}>
          로그아웃
        </Button>
      </View>
    </View>
  );
}
