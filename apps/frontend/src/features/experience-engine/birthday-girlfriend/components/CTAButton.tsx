'use client';

import { memo, useCallback } from 'react';

type CTAButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  show?: boolean;
  className?: string;
  ariaLabel?: string;
};

export const CTAButton = memo(function CTAButton({
  children,
  onClick,
  show = true,
  className = '',
  ariaLabel,
}: CTAButtonProps) {
  const spawnSparks = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    for (let i = 0; i < 4; i++) {
      const s = document.createElement('div');
      s.className = 'btn-spark';
      const x = rect.left + Math.random() * rect.width;
      const y = rect.top + Math.random() * rect.height;
      s.style.left = `${x}px`;
      s.style.top = `${y}px`;
      document.body.appendChild(s);
      s.animate(
        [
          { transform: 'translate(0,0)', opacity: '1' },
          {
            transform: `translate(${Math.random() * 32 - 16}px, ${Math.random() * -26 - 10}px)`,
            opacity: '0',
          },
        ],
        { duration: 700 + Math.random() * 300, easing: 'ease-out' },
      );
      window.setTimeout(() => s.remove(), 1050);
    }
  }, []);

  return (
    <button
      type="button"
      className={`cta ${show ? 'show' : ''} ${className}`}
      onClick={onClick}
      onPointerEnter={spawnSparks}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
});
