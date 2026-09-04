'use client';

import { memo, useEffect, useRef, useState } from 'react';

import { CTAButton } from '../components/CTAButton';
import { SceneContainer } from '../components/SceneContainer';
import { StarTraitModal } from '../components/StarTraitModal';
import { STAR_TRAITS } from '../constants/story';
import type { SceneComponentProps } from '../types';

export const LoveScene = memo(function LoveScene({ onNext, isActive }: SceneComponentProps) {
  const [litStars, setLitStars] = useState<Set<number>>(new Set());
  const [activeTrait, setActiveTrait] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const lastLitRef = useRef<{ x: number; y: number } | null>(null);
  const linksRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!isActive) {
      setLitStars(new Set());
      setActiveTrait(null);
      setShowHint(false);
      setShowCta(false);
      lastLitRef.current = null;
      if (linksRef.current) linksRef.current.innerHTML = '';
      return;
    }
    const hintTimer = window.setTimeout(() => setShowHint(true), 300);
    const fallbackTimer = window.setTimeout(() => setShowCta(true), 7000);
    return () => {
      clearTimeout(hintTimer);
      clearTimeout(fallbackTimer);
    };
  }, [isActive]);

  useEffect(() => {
    if (litStars.size >= 4) setShowCta(true);
  }, [litStars.size]);

  const lightStar = (index: number) => {
    const trait = STAR_TRAITS[index];
    if (!trait) return;

    setActiveTrait(index);

    if (litStars.has(index)) return;

    const x = parseFloat(trait.left);
    const y = parseFloat(trait.top);

    if (lastLitRef.current && linksRef.current) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(lastLitRef.current.x));
      line.setAttribute('y1', String(lastLitRef.current.y));
      line.setAttribute('x2', String(x));
      line.setAttribute('y2', String(y));
      linksRef.current.appendChild(line);
      requestAnimationFrame(() => line.classList.add('show'));
    }

    lastLitRef.current = { x, y };
    setLitStars((prev) => new Set(prev).add(index));
  };

  const closeModal = () => setActiveTrait(null);
  const activeTraitData = activeTrait !== null ? STAR_TRAITS[activeTrait] : null;

  if (!isActive) return null;

  return (
    <SceneContainer id="scene-love">
      <div className="eyebrow love-eyebrow">Everything I Love About You</div>
      <div className="sky-wrap" id="skyWrap">
        <svg ref={linksRef} className="star-links" id="starLinks" viewBox="0 0 100 100" preserveAspectRatio="none" />
        {STAR_TRAITS.map((trait, i) => (
          <button
            key={trait.label}
            type="button"
            className={`star-node ${litStars.has(i) ? 'lit' : ''}`}
            style={{ left: trait.left, top: trait.top, fontSize: trait.size }}
            onClick={() => lightStar(i)}
            aria-label={`Reveal ${trait.label}`}
          >
            ✦
            <span className="star-label">{trait.label}</span>
          </button>
        ))}
      </div>
      <p className={`hint love-hint ${showHint ? 'show' : ''}`} id="starHint">
        Tap each star to reveal what I love about you.
      </p>
      <CTAButton show={showCta} onClick={onNext}>
        Keep Holding My Hand
      </CTAButton>

      {activeTraitData && (
        <StarTraitModal
          label={activeTraitData.label}
          note={activeTraitData.note}
          visible={activeTrait !== null}
          onClose={closeModal}
        />
      )}
    </SceneContainer>
  );
});
