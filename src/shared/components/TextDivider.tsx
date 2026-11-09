import { View } from 'react-native';

// BDS Text Divider: 한 줄 텍스트 사이를 나누는 2px 점 (예: 3분 전 · 서울 마포구)
type TextDividerProps = {
  className?: string;
};

export function TextDivider({ className }: TextDividerProps) {
  return (
    <View
      accessible={false}
      className={`h-[18px] w-0.5 items-center justify-center ${className ?? ''}`}
    >
      <View className="size-0.5 rounded-full bg-object-assistive" />
    </View>
  );
}
