'use client';

import { memo, useEffect, useRef } from 'react';

type TransitionSweepProps = {
  trigger: number;
};

export const TransitionSweep = memo(function TransitionSweep({ trigger }: TransitionSweepProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trigger) return;
    const el = ref.current;
    if (!el) return;
    el.classList.remove('run');
    void el.offsetWidth;
    el.classList.add('run');
  }, [trigger]);

  return <div ref={ref} className="mb-sweep" aria-hidden="true" />;
});
