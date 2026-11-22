import { View } from 'react-native';

export type ExchangeProgressValue = { current: number; total: number };

export default function ExchangeProgress({
  current,
  total,
  className = 'mt-[22px]',
}: ExchangeProgressValue & { className?: string }) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="교환글 작성 단계"
      accessibilityValue={{ min: 1, max: total, now: current }}
      className={`flex-row gap-1 ${className}`}
    >
      {Array.from({ length: total }, (_, index) => (
        <View
          key={index}
          className={`h-0.5 flex-1 rounded-full ${index < current ? 'bg-[#9C43FF]' : 'bg-[#000D4B25]'}`}
        />
      ))}
    </View>
  );
}
