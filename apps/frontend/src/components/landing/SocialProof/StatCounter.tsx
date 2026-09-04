'use client';

import { useCounter } from '@/components/landing/hooks';
import type { SOCIAL_PROOF_STATS } from '@/components/landing/data/content';

type Stat = (typeof SOCIAL_PROOF_STATS)[number];

type StatCounterProps = {
  stat: Stat;
};

export function StatCounter({ stat }: StatCounterProps) {
  const { ref, display } = useCounter({
    value: 'value' in stat ? stat.value : undefined,
    decimal: 'decimal' in stat ? stat.decimal : undefined,
    suffix: stat.suffix,
  });

  return (
    <div ref={ref} className="num" aria-label={`${stat.label}: ${display}`}>
      {display}
    </div>
  );
}
