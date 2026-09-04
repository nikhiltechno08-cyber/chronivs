'use client';

import { memo, type ReactNode } from 'react';

type SceneShellProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  dark?: boolean;
};

export const SceneShell = memo(function SceneShell({
  children,
  className = '',
  id,
  dark = false,
}: SceneShellProps) {
  return (
    <div id={id} className={`aw-scene ${dark ? 'aw-scene-dark' : ''} ${className}`}>
      {children}
    </div>
  );
});
