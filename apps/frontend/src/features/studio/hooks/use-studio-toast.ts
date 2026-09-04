'use client';

import { useCallback, useRef, useState } from 'react';

type ToastState = {
  message: string;
  visible: boolean;
};

export function useStudioToast() {
  const [toast, setToast] = useState<ToastState>({ message: '', visible: false });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, visible: true });
    timerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2600);
  }, []);

  return { toast, showToast };
}
