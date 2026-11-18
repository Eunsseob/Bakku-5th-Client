import { Text, View } from 'react-native';

// F-1 토스트. Figma UI-Flow '추가화면' 의 토스트 값 그대로
// 가운데 정렬 알약 모양, #2e2e33 92%, r10, 안쪽 10·16, 12 Regular 흰 글자

export function CompletionToast({ message }: { message: string }) {
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      className="self-center rounded-10 bg-[#2e2e33eb] px-4 py-2.5"
    >
      <Text className="font-sans text-[12px] font-normal leading-[14px] text-white">{message}</Text>
    </View>
  );
}
