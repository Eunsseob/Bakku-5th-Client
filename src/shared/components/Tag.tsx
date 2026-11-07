import { Text, View } from 'react-native';

// BDS Tag (Figma 문서 작업 중 📝 — 디자인이 바뀌면 같이 수정)
export type TagHierarchy = 'accent' | 'primary' | 'secondary';
export type TagVariant = 'solid' | 'outlined';
export type TagSize = 'sm' | 'md';

type TagProps = {
  children: string;
  hierarchy?: TagHierarchy;
  /** outlined 는 sm 에서만 정의되어 있다 */
  variant?: TagVariant;
  size?: TagSize;
  className?: string;
};

const SOLID: Record<TagHierarchy, Record<TagSize, { container: string; text: string }>> = {
  accent: {
    sm: { container: 'bg-violet-500', text: 'text-white' },
    md: { container: 'bg-violet-400', text: 'text-white' },
  },
  primary: {
    sm: { container: 'bg-gray-900', text: 'text-white' },
    md: { container: 'bg-gray-900', text: 'text-white' },
  },
  secondary: {
    sm: { container: 'bg-gray-50', text: 'text-gray-600' },
    md: { container: 'bg-gray-50', text: 'text-gray-600' },
  },
};

const OUTLINED: Record<TagHierarchy, { container: string; text: string }> = {
  accent: { container: 'border border-gray-100 bg-white', text: 'text-violet-500' },
  primary: { container: 'border border-gray-100 bg-white', text: 'text-gray-800' },
  secondary: { container: 'border border-gray-75 bg-white', text: 'text-gray-300' },
};

const SIZES: Record<TagSize, { container: string; text: string }> = {
  sm: { container: 'px-1.5 py-0.5', text: 'text-label-xs tracking-normal' },
  md: { container: 'px-2.5 py-1.5', text: 'text-label-md' },
};

export function Tag({
  children,
  hierarchy = 'accent',
  variant = 'solid',
  size = 'sm',
  className,
}: TagProps) {
  const colors = variant === 'outlined' ? OUTLINED[hierarchy] : SOLID[hierarchy][size];
  const sizes = SIZES[variant === 'outlined' ? 'sm' : size];

  return (
    <View
      className={`items-center justify-center self-start rounded-lg ${sizes.container} ${colors.container} ${className ?? ''}`}
    >
      <Text className={`font-sans font-medium ${sizes.text} ${colors.text}`}>{children}</Text>
    </View>
  );
}
