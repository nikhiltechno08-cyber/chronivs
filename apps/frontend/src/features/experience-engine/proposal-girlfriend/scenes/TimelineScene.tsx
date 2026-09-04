'use client';

import { memo, useState } from 'react';

import { DEFAULT_CONFIG } from '../constants/story';
import { SceneShell } from '../components/SceneShell';
import type { SceneComponentProps } from '../types';

export const TimelineScene = memo(function TimelineScene({ onNext, isActive }: SceneComponentProps) {
  const [milestone, setMilestone] = useState<{ title: string; quote: string }>({
    title: 'Tap a moment above',
    quote: 'Each one led to this one.',
  });
  const [cardOpacity, setCardOpacity] = useState(1);

  const selectMilestone = (m: (typeof DEFAULT_CONFIG.milestones)[0]) => {
    setCardOpacity(0);
    window.setTimeout(() => {
      setMilestone({ title: m.title, quote: m.quote });
      setCardOpacity(1);
    }, 250);
  };

  if (!isActive) return null;

  return (
    <SceneShell id="scene-prop-timeline">
      <p className="prop-eyebrow prop-reveal">Our Journey</p>
      <div className="prop-ribbon-wrap">
        <div className="prop-ribbon-line" />
        <div className="prop-ribbon-points">
          {DEFAULT_CONFIG.milestones.map((m, i) => (
            <div
              key={i}
              className="prop-ribbon-pt"
              onClick={() => selectMilestone(m)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') selectMilestone(m);
              }}
              role="button"
              tabIndex={0}
            >
              <div className="prop-ribbon-dot" />
              <div className="prop-ribbon-label">{m.label}</div>
            </div>
          ))}
        </div>
        <div className="prop-milestone-card" style={{ opacity: cardOpacity }}>
          <div className="prop-m-title">{milestone.title}</div>
          <div className="prop-m-quote">{milestone.quote}</div>
        </div>
      </div>
      <button type="button" className="prop-btn" style={{ marginTop: 6 }} onClick={onNext}>
        Let&apos;s Keep Walking
      </button>
    </SceneShell>
  );
});
