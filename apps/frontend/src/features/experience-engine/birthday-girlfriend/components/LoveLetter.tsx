'use client';

import { memo } from 'react';

type LoveLetterProps = {
  text: string;
  open: boolean;
  variant?: 'card' | 'paper';
  senderName?: string;
  showSignature?: boolean;
  showFlower?: boolean;
  children?: React.ReactNode;
};

export const LoveLetter = memo(function LoveLetter({
  text,
  open,
  variant = 'card',
  senderName,
  showSignature = false,
  showFlower = false,
  children,
}: LoveLetterProps) {
  if (variant === 'paper') {
    return (
      <div className={`letter-paper-wrap ${open ? 'open' : ''}`}>
        <div className="letter-paper">
          {showFlower && <div className={`letter-flower ${open ? 'show' : ''}`}>✿</div>}
          {children ?? <p>{text}</p>}
          {showSignature && senderName && (
            <div className={`sig-line ${open ? 'show' : ''}`}>
              Forever Yours,
              <br />
              <span className="sig-name-final">{senderName}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`letter-card ${open ? 'open' : ''}`}>
      <div className="letter-card-inner">{children ?? <p>{text}</p>}</div>
    </div>
  );
});
