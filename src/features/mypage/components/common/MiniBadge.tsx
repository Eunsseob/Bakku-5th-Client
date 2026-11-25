import { Text, View } from 'react-native';

// 마이페이지 추가 프레임의 작은 상태 배지 (교환 완료 · 자동 · 못 함 · 취소 · 확인 중 · 인정)
// r6 · 안쪽 8×3 · 11 medium. dark: #2b2d36 흰 글씨, light: #f3f4f6 회색 글씨

export function MiniBadge({ tone, children }: { tone: 'dark' | 'light'; children: string }) {
  const dark = tone === 'dark';
  return (
    <View
      className={`rounded-6 px-2 py-[3px] ${dark ? 'bg-surface-inverse-deep' : 'bg-surface-deeper'}`}
    >
      <Text
        className={`font-sans text-label-xs font-medium ${dark ? 'text-object-inverse-boldest' : 'text-object-alternative'}`}
      >
        {children}
      </Text>
    </View>
  );
}
