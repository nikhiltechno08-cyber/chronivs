'use client';

import { memo, useCallback, useEffect, useState } from 'react';

import { SceneShell } from '../components/SceneShell';
import type { SceneComponentProps } from '../types';

export const EndingScene = memo(function EndingScene({
  data,
  isActive,
  onExperienceEnd,
}: SceneComponentProps & { onExperienceEnd: () => void }) {
  const [opened, setOpened] = useState(false);
  const [showFl1, setShowFl1] = useState(false);
  const [showFl2, setShowFl2] = useState(false);
  const [showFl3, setShowFl3] = useState(false);
  const [showFl4, setShowFl4] = useState(false);
  const [signature, setSignature] = useState('');

  useEffect(() => {
    if (!isActive) {
      setOpened(false);
      setShowFl1(false);
      setShowFl2(false);
      setShowFl3(false);
      setShowFl4(false);
      setSignature('');
    }
  }, [isActive]);

  const sender = data.senderName || 'your husband';
  const fullSignature = `Love, ${sender}`;

  const openBox = useCallback(() => {
    if (opened) return;
    setOpened(true);
    window.setTimeout(() => setShowFl1(true), 1800);
    window.setTimeout(() => setShowFl2(true), 3000);
    window.setTimeout(() => setShowFl3(true), 4200);
    window.setTimeout(() => setShowFl4(true), 5800);
    window.setTimeout(() => {
      let idx = 0;
      const iv = window.setInterval(() => {
        setSignature(fullSignature.slice(0, idx + 1));
        idx++;
        if (idx >= fullSignature.length) clearInterval(iv);
      }, 65);
    }, 6600);
    window.setTimeout(() => {
      onExperienceEnd();
    }, 8400);
  }, [opened, fullSignature, onExperienceEnd]);

  if (!isActive) return null;

  return (
    <SceneShell id="scene-wife-ending">
      <div className="aw-eyebrow">OUR FOREVER</div>
      <button
        type="button"
        className={`aw-box-wrap ${opened ? 'open' : ''}`}
        onClick={openBox}
        aria-label="Open the ring box"
        disabled={opened}
      >
        <div className="aw-box-lid" />
        <div className="aw-box-base">
          <div className="aw-box-ribbon" />
        </div>
        <svg className="aw-box-bow" viewBox="0 0 40 26" aria-hidden="true">
          <circle cx="12" cy="13" r="10" fill="#E8C39E" />
          <circle cx="28" cy="13" r="10" fill="#E8C39E" />
          <circle cx="20" cy="13" r="6" fill="#7B2D3E" />
        </svg>
        <div className="aw-crystal">💎</div>
      </button>
      <div className="aw-final-lines">
        <div className={`aw-fl ${showFl1 ? 'show' : ''}`}>&ldquo;Forever isn&apos;t a promise.</div>
        <div className={`aw-fl ${showFl2 ? 'show' : ''}`}>It&apos;s every ordinary day</div>
        <div className={`aw-fl ${showFl3 ? 'show' : ''}`}>we choose each other.&rdquo;</div>
      </div>
      <div className={`aw-fl aw-fl-anniv ${showFl4 ? 'show' : ''}`}>Happy Anniversary ❤️</div>
      <div className="aw-signature2">{signature}</div>
    </SceneShell>
  );
});
