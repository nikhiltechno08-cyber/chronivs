'use client';

import { memo, useCallback, useState } from 'react';

import { CTAButton } from '../components/CTAButton';
import { SceneContainer } from '../components/SceneContainer';
import type { SceneComponentProps } from '../types';

export const SurpriseScene = memo(function SurpriseScene({ onNext, isActive }: SceneComponentProps) {
  const [opened, setOpened] = useState(false);
  const [burst, setBurst] = useState(false);

  const openEnvelope = useCallback(() => {
    if (opened) {
      onNext();
      return;
    }
    setOpened(true);
    window.setTimeout(() => setBurst(true), 350);
    window.setTimeout(() => {
      setBurst(false);
      onNext();
    }, 1250);
  }, [onNext, opened]);

  if (!isActive) return null;

  return (
    <SceneContainer id="scene-surprise">
      <div className="stage1 flex flex-col items-center">
        <div className="eyebrow">Chronivs · A Private Letter</div>
        <h1 className="serif">
          Someone wrote something…
          <br />
          <em>just for you.</em>
        </h1>
        <div
          className={`envelope-wrap ${opened ? 'opened' : ''}`}
          onClick={openEnvelope}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') openEnvelope();
          }}
          role="button"
          tabIndex={0}
          aria-label="Open envelope"
        >
          <div className="envelope">
            <div className="env-body" />
            <div className="env-flap" />
            <div className="env-seal left">C</div>
            <div className="env-seal right">C</div>
          </div>
        </div>
        <CTAButton show onClick={openEnvelope}>
          Open My Letter ❤️
        </CTAButton>
      </div>
      <div id="goldBurst" className={burst ? 'burst' : ''} aria-hidden="true" />
    </SceneContainer>
  );
});
