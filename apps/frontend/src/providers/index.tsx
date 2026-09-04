'use client';

import { type ReactNode } from 'react';

import { AnimationProvider } from './animation-provider';
import { MotionConfigProvider } from './motion-config-provider';
import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';
import { ToastProvider } from './toast-provider';

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AnimationProvider>
          <MotionConfigProvider>
            <ToastProvider>{children}</ToastProvider>
          </MotionConfigProvider>
        </AnimationProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}

export { useThemeContext } from './theme-provider';
export { useAnimationContext } from './animation-provider';
export { useToast } from './toast-provider';
