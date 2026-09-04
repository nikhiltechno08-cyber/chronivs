'use client';

import { memo } from 'react';

type CuteTeddyProps = {
  className?: string;
  /** Show tiny floating heart above the head */
  withHeart?: boolean;
};

/**
 * Soft illustrated teddy (SVG) — replaces the old flat CSS-div bear.
 */
export const CuteTeddy = memo(function CuteTeddy({ className, withHeart = false }: CuteTeddyProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Ears */}
      <circle cx="28" cy="32" r="18" fill="#C99A6B" />
      <circle cx="92" cy="32" r="18" fill="#C99A6B" />
      <circle cx="28" cy="32" r="10" fill="#E8C9A0" />
      <circle cx="92" cy="32" r="10" fill="#E8C9A0" />

      {/* Head */}
      <circle cx="60" cy="58" r="38" fill="#C99A6B" />

      {/* Face highlight */}
      <ellipse cx="60" cy="62" rx="28" ry="26" fill="#D4A97A" opacity="0.35" />

      {/* Eyes */}
      <circle cx="46" cy="52" r="4.2" fill="#3A2418" />
      <circle cx="74" cy="52" r="4.2" fill="#3A2418" />
      <circle cx="47.4" cy="50.8" r="1.3" fill="#FFF8F0" />
      <circle cx="75.4" cy="50.8" r="1.3" fill="#FFF8F0" />

      {/* Blush */}
      <ellipse cx="36" cy="64" rx="7" ry="4.5" fill="#F0A0A0" opacity="0.55" />
      <ellipse cx="84" cy="64" rx="7" ry="4.5" fill="#F0A0A0" opacity="0.55" />

      {/* Muzzle */}
      <ellipse cx="60" cy="70" rx="14" ry="11" fill="#EED4B3" />
      <ellipse cx="60" cy="68" rx="3.2" ry="2.4" fill="#5A3424" />
      <path
        d="M54 74c3.2 3.2 8.8 3.2 12 0"
        stroke="#5A3424"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />

      {/* Soft paws / arms */}
      <ellipse cx="22" cy="88" rx="12" ry="16" fill="#C99A6B" transform="rotate(-18 22 88)" />
      <ellipse cx="98" cy="88" rx="12" ry="16" fill="#C99A6B" transform="rotate(18 98 88)" />
      <ellipse cx="22" cy="94" rx="7" ry="6" fill="#E8C9A0" transform="rotate(-18 22 94)" />
      <ellipse cx="98" cy="94" rx="7" ry="6" fill="#E8C9A0" transform="rotate(18 98 94)" />

      {withHeart ? (
        <path
          d="M60 10c-2.2-2.6-6.8-2.2-8.2 1.2-1.2 2.8.4 5.4 3.2 7.4L60 22l4.8-3.4c2.8-2 4.4-4.6 3.2-7.4C66.6 7.8 62.2 7.4 60 10z"
          fill="#F3A6B0"
          opacity="0.95"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; 0 -3; 0 0"
            dur="2.2s"
            repeatCount="indefinite"
          />
        </path>
      ) : null}
    </svg>
  );
});
