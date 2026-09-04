'use client';

import { memo, useEffect, useRef, useState } from 'react';

import { spawnFireflies } from '../components/CelebrationFx';
import { CTAButton } from '../components/CTAButton';
import { SceneShell } from '../components/SceneShell';
import { TREE_LEAVES } from '../constants/story';
import type { SceneComponentProps } from '../types';

export const TreeScene = memo(function TreeScene({ onNext, isActive }: SceneComponentProps) {
  const [litLeaves, setLitLeaves] = useState<boolean[]>(() => TREE_LEAVES.map(() => false));
  const [activeQuote, setActiveQuote] = useState<string | null>(null);
  const [showCard, setShowCard] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const treeRef = useRef<HTMLDivElement>(null);
  const firefliesSpawned = useRef(false);

  useEffect(() => {
    if (!isActive) {
      setLitLeaves(TREE_LEAVES.map(() => false));
      setActiveQuote(null);
      setShowCard(false);
      setShowCta(false);
      firefliesSpawned.current = false;
    }
  }, [isActive]);

  const handleLeafClick = (idx: number) => {
    const next = [...litLeaves];
    if (!next[idx]) next[idx] = true;
    setLitLeaves(next);
    setActiveQuote(TREE_LEAVES[idx]!.quote);
    setShowCard(true);

    if (next.every(Boolean) && !firefliesSpawned.current && treeRef.current) {
      firefliesSpawned.current = true;
      spawnFireflies(treeRef.current);
      window.setTimeout(() => setShowCta(true), 800);
    }
  };

  if (!isActive) return null;

  return (
    <SceneShell id="scene-wife-tree" dark>
      <div className="aw-eyebrow aw-eyebrow-champagne">OUR TREE OF MEMORIES</div>
      <h1 className="aw-title aw-title-sm aw-title-light">
        Every leaf, <em className="aw-em-gold">a memory.</em>
      </h1>
      <div className="aw-tree-wrap" ref={treeRef}>
        <div className="aw-canopy" />
        <div className="aw-trunk" />
        {TREE_LEAVES.map((leaf, i) => (
          <button
            key={leaf.quote}
            type="button"
            className={`aw-leaf ${litLeaves[i] ? 'lit' : ''}`}
            style={{
              left: `${leaf.x}%`,
              top: `${leaf.y}%`,
              animationDelay: `${i * 0.3}s`,
            }}
            onClick={() => handleLeafClick(i)}
            aria-label={leaf.quote}
          />
        ))}
        <div className={`aw-leaf-card ${showCard ? 'show' : ''}`}>
          <div className="aw-leaf-card-q">{activeQuote}</div>
          <button type="button" className="aw-leaf-card-close" onClick={() => setShowCard(false)}>
            Close
          </button>
        </div>
      </div>
      <CTAButton show={showCta} onClick={onNext} small>
        Celebrate With Me
      </CTAButton>
    </SceneShell>
  );
});
