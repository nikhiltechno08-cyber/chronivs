import type { ReactNode } from 'react';

export default function PublicExperienceLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh w-full bg-[#090909]">{children}</div>;
}
