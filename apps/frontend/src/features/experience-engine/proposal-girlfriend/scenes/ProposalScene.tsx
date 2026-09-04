'use client';

import { memo, useEffect, useState } from 'react';

import { DEFAULT_CONFIG } from '../constants/story';
import { SceneShell } from '../components/SceneShell';
import type { SceneComponentProps } from '../types';

type ProposalSceneProps = SceneComponentProps & {
  onEnter?: () => void;
  onAnswer?: () => void;
};

export const ProposalScene = memo(function ProposalScene({
  onNext,
  isActive,
  onEnter,
  onAnswer,
}: ProposalSceneProps) {
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setShowAnswers(false);
      return;
    }
    onEnter?.();
    const t = window.setTimeout(() => setShowAnswers(true), 2000);
    return () => clearTimeout(t);
  }, [isActive, onEnter]);

  const handleAnswer = () => {
    onAnswer?.();
    onNext();
  };

  if (!isActive) return null;

  return (
    <SceneShell id="scene-prop-proposal">
      <h1 className="prop-proposal-title prop-reveal" style={{ animationDelay: '0.4s' }}>
        {DEFAULT_CONFIG.proposalQuestion}
      </h1>
      <div className={`prop-answer-row${showAnswers ? ' shown' : ' hidden'}`}>
        <button type="button" className="prop-btn prop-btn-yes" onClick={handleAnswer}>
          YES ❤️
        </button>
        <button type="button" className="prop-btn prop-btn-of-course" onClick={handleAnswer}>
          OF COURSE ❤️
        </button>
      </div>
    </SceneShell>
  );
});
