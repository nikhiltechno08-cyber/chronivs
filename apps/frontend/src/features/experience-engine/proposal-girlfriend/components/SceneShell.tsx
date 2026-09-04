'use client';

import { memo, type ReactNode } from 'react';

type SceneShellProps = {
  children: ReactNode;
  id?: string;
};

export const SceneShell = memo(function SceneShell({ children, id }: SceneShellProps) {
  return (
    <div id={id} className="prop-scene">
      <div className="prop-scene-inner">{children}</div>
    </div>
  );
});
