'use client';

import { memo, type ReactNode } from 'react';

type SceneShellProps = {
  children: ReactNode;
  theme?: 'dark' | 'light';
  className?: string;
  id?: string;
};

export const SceneShell = memo(function SceneShell({
  children,
  theme = 'dark',
  className = '',
  id,
}: SceneShellProps) {
  return (
    <div id={id} className={`mb-scene theme-${theme} ${className}`}>
      <div className="mb-scene-inner">{children}</div>
    </div>
  );
});
