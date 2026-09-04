import type { ReactNode } from 'react';

export default function ExperienceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="experience-route fixed inset-0 z-[100] h-dvh w-full overflow-hidden bg-[#090909]">
      {children}
    </div>
  );
}
