'use client';

import { memo, type ReactNode } from 'react';

type SceneShellProps = {
  children: ReactNode;
  theme?: 'dark' | 'light' | 'dusk' | 'night';
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
    <div id={id} className={`fb-scene theme-${theme} ${className}`}>
      <div className="fb-scene-inner">{children}</div>
    </div>
  );
});
