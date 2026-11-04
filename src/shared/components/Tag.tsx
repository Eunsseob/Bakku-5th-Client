import { Text, View } from 'react-native';

export type TagVariant =
  | 'accent'
  | 'primary'
  | 'secondary'
  | 'accentSoft'
  | 'accentOutline'
  | 'primarySoft'
  | 'secondaryOutline';

type TagProps = {
  children: string;
  variant?: TagVariant;
  className?: string;
};

const VARIANT_STYLES: Record<TagVariant, { container: string; text: string }> = {
  accent: { container: 'bg-bp-500', text: 'text-white' },
  primary: { container: 'bg-gray-900', text: 'text-white' },
  secondary: { container: 'bg-gray-100', text: 'text-gray-600' },
  accentSoft: { container: 'bg-bp-500/20', text: 'text-bp-500' },
  accentOutline: { container: 'border border-bp-400 bg-white', text: 'text-bp-400' },
  primarySoft: { container: 'bg-gray-900/20', text: 'text-gray-900' },
  secondaryOutline: { container: 'border border-gray-600 bg-white', text: 'text-gray-600' },
};

export function Tag({ children, variant = 'accent', className }: TagProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <View className={`self-start rounded px-1.5 py-0.5 ${styles.container} ${className ?? ''}`}>
      <Text className={`font-sans text-label-xs font-medium ${styles.text}`}>{children}</Text>
    </View>
  );
}
