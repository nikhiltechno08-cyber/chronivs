'use client';

import { memo, useCallback, useEffect, useRef } from 'react';

type HoldButtonProps = {
  label: string;
  onComplete: () => void;
  className?: string;
};

export const HoldButton = memo(function HoldButton({
  label,
  onComplete,
  className = '',
}: HoldButtonProps) {
  const progressRef = useRef(0);
  const holdingRef = useRef(false);
  const rafRef = useRef(0);
  const fillRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const onCompleteRef = useRef(onComplete);

  onCompleteRef.current = onComplete;

  const step = useCallback(() => {
    if (!holdingRef.current) return;
    progressRef.current += 2;
    if (fillRef.current) {
      fillRef.current.style.width = `${progressRef.current}%`;
    }
    if (progressRef.current >= 100) {
      holdingRef.current = false;
      onCompleteRef.current();
      return;
    }
    rafRef.current = requestAnimationFrame(step);
  }, []);

  const startHold = useCallback(() => {
    holdingRef.current = true;
    step();
  }, [step]);

  const stopHold = useCallback(() => {
    holdingRef.current = false;
    if (progressRef.current < 100) {
      progressRef.current = 0;
      if (fillRef.current) fillRef.current.style.width = '0%';
    }
    cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      startHold();
    };

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchend', stopHold);
    el.addEventListener('touchcancel', stopHold);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', stopHold);
      el.removeEventListener('touchcancel', stopHold);
      cancelAnimationFrame(rafRef.current);
    };
  }, [startHold, stopHold]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <button
      ref={buttonRef}
      type="button"
      className={`prop-btn prop-hold-btn ${className}`}
      onMouseDown={startHold}
      onMouseUp={stopHold}
      onMouseLeave={stopHold}
    >
      <span>{label}</span>
      <div ref={fillRef} className="prop-fill" />
    </button>
  );
});
