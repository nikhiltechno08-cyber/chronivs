'use client';

import { memo, type ReactNode } from 'react';

type SceneContainerProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  active?: boolean;
};

export const SceneContainer = memo(function SceneContainer({
  children,
  className = '',
  id,
  active = true,
}: SceneContainerProps) {
  return (
    <div
      id={id}
      className={`scene ${active ? 'active' : ''} flex flex-col items-center justify-center text-center ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 5,
        padding: 'clamp(20px, 6vh, 56px) clamp(18px, 6vw, 60px)',
        transformStyle: 'preserve-3d',
        perspective: '1500px',
      }}
    >
      {children}
    </div>
  );
});
