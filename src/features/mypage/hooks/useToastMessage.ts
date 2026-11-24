import { useEffect, useState } from 'react';

const TOAST_MS = 3000;

/** 잠깐 보였다 사라지는 토스트 문구 */
export function useToastMessage() {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  return [toast, setToast] as const;
}
