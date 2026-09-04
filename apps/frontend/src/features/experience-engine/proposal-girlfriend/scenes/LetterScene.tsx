'use client';

import { memo } from 'react';

import { resolveProposalConfig } from '../constants/story';
import { SceneShell } from '../components/SceneShell';
import type { SceneComponentProps } from '../types';

export const LetterScene = memo(function LetterScene({ data, onNext, isActive }: SceneComponentProps) {
  const config = resolveProposalConfig(data);

  if (!isActive) return null;

  return (
    <SceneShell id="scene-prop-letter">
      <p className="prop-eyebrow prop-reveal">Before I Ask You Anything</p>
      <div className="prop-letter prop-reveal">
        {config.letterParagraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <p className="prop-signature">{config.signature}</p>
      </div>
      <button
        type="button"
        className="prop-btn prop-reveal"
        style={{ animationDelay: '0.6s' }}
        onClick={onNext}
      >
        I&apos;m Ready
      </button>
    </SceneShell>
  );
});
