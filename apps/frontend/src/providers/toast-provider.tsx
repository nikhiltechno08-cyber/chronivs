'use client';

import * as Toast from '@radix-ui/react-toast';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { ToastPayload, ToastVariant } from '@/types';
import { cn } from '@chronivs/ui';

type ToastContextValue = {
  toast: (payload: ToastPayload) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION = 5000;

const variantStyles: Record<ToastVariant, string> = {
  default: 'border-[var(--color-border-default)] bg-[var(--color-bg-secondary)]',
  success: 'border-[var(--color-status-success)] bg-[var(--color-bg-secondary)]',
  error: 'border-[var(--color-status-error)] bg-[var(--color-bg-secondary)]',
  warning: 'border-[var(--color-status-warning)] bg-[var(--color-bg-secondary)]',
  info: 'border-[var(--color-status-info)] bg-[var(--color-bg-secondary)]',
};

type ActiveToast = ToastPayload & { id: string; open: boolean };

type ToastProviderProps = {
  children: ReactNode;
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);

  const toast = useCallback((payload: ToastPayload) => {
    const id = payload.id ?? crypto.randomUUID();
    setToasts((prev) => [...prev, { ...payload, id, open: true }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      <Toast.Provider swipeDirection="right" duration={TOAST_DURATION}>
        {children}
        {toasts.map((item) => (
          <Toast.Root
            key={item.id}
            open={item.open}
            onOpenChange={(open) => {
              if (!open) dismiss(item.id);
            }}
            className={cn(
              'fixed bottom-4 right-4 z-[var(--z-toast)] w-full max-w-sm rounded-lg border p-4 shadow-lg transition-opacity',
              'data-[state=open]:opacity-100 data-[state=closed]:opacity-0',
              variantStyles[item.variant ?? 'default'],
            )}
          >
            <Toast.Title className="text-sm font-semibold text-[var(--color-fg-primary)]">
              {item.title}
            </Toast.Title>
            {item.description && (
              <Toast.Description className="mt-1 text-sm text-[var(--color-fg-secondary)]">
                {item.description}
              </Toast.Description>
            )}
            <Toast.Close className="absolute right-2 top-2 text-[var(--color-fg-muted)]" aria-label="Dismiss notification">
              ×
            </Toast.Close>
          </Toast.Root>
        ))}
        <Toast.Viewport className="fixed bottom-0 right-0 z-[var(--z-toast)] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-md" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
