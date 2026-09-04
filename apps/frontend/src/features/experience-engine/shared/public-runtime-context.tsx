'use client';

import { createContext, useContext, type ReactNode } from 'react';

export type PublicRuntimeConfig = {
  showCreateOwnCta: boolean;
  onCreateOwn?: () => void;
  onReplay?: () => void;
  onExperienceComplete?: () => void;
};

const PublicRuntimeContext = createContext<PublicRuntimeConfig | null>(null);

export function PublicRuntimeProvider({
  value,
  children,
}: {
  value: PublicRuntimeConfig;
  children: ReactNode;
}) {
  return <PublicRuntimeContext.Provider value={value}>{children}</PublicRuntimeContext.Provider>;
}

export function useOptionalPublicRuntimeConfig(): PublicRuntimeConfig | null {
  return useContext(PublicRuntimeContext);
}
