'use client';

import { memo, useEffect, useState } from 'react';

type TransitionSweepProps = {
  trigger: number;
};

export const TransitionSweep = memo(function TransitionSweep({ trigger }: TransitionSweepProps) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (trigger <= 0) return;
    setActive(false);
    requestAnimationFrame(() => setActive(true));
    const t = window.setTimeout(() => setActive(false), 980);
    return () => clearTimeout(t);
  }, [trigger]);

  return (
    <>
      <div id="sweep" className={active ? 'go' : ''} aria-hidden="true" />
      <div id="transition-dust" aria-hidden="true" />
    </>
  );
});
