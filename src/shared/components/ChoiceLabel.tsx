import { Text, View } from 'react-native';

// CheckBox·Radio 옆 레이블 (Checkbox/Elements/Label, Radio/Elements/Label)
type ChoiceLabelProps = {
  label: string;
  helperText?: string;
  size: 'lg' | 'md';
  muted: boolean;
};

export function ChoiceLabel({ label, helperText, size, muted }: ChoiceLabelProps) {
  return (
    <View className="gap-1">
      <Text
        className={`font-sans font-normal ${size === 'lg' ? 'text-label-lg' : 'text-label-md'} ${muted ? 'text-object-subtler' : 'text-object-bolder'}`}
      >
        {label}
      </Text>
      {helperText ? (
        <Text
          className={`font-sans text-label-sm font-normal ${muted ? 'text-object-subtler' : 'text-object-alternative'}`}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
