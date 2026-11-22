import { useRef, type ComponentRef } from 'react';
import {
  AccessibilityInfo,
  type LayoutChangeEvent,
  type ScrollView,
  type TextInput,
} from 'react-native';

export function useValidationScroll<Field extends string>() {
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const offsets = useRef<Partial<Record<Field, number>>>({});

  return {
    scrollRef,
    fieldLayout: (field: Field) => (event: LayoutChangeEvent) => {
      offsets.current[field] = event.nativeEvent.layout.y;
    },
    focusError: (field: Field, message: string, input?: ComponentRef<typeof TextInput> | null) => {
      const offset = offsets.current[field];
      if (offset !== undefined) {
        scrollRef.current?.scrollTo({ y: Math.max(0, offset - 16), animated: true });
      }
      if (input) input.focus();
      else AccessibilityInfo.announceForAccessibility(message);
    },
  };
}
