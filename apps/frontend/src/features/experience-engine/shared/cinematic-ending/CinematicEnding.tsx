'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useReducedMotion } from '@/animations/hooks/use-reduced-motion';
import { useOptionalPublicRuntimeConfig } from '../public-runtime-context';

import { EndingAmbient } from './EndingAmbient';
import { getEndingAmbientConfig, getEndingMessages } from './messages';
import type { CinematicEndingProps } from './types';

import './cinematic-ending.css';

const LINE_STAGGER_MS = 900;
const ACTIONS_DELAY_MS = 2600;
const RESTART_FADE_MS = 850;

export const CinematicEnding = memo(function CinematicEnding({
  visible,
  mode,
  templateId,
  onRestart,
  onCreateExperience,
  onHome,
  isValidating = false,
  validationErrors = [],
  validationMessage = null,
  showCreateOwnCta,
  onCreateOwn,
}: CinematicEndingProps) {
  const prefersReducedMotion = useReducedMotion();
  const publicRuntime = useOptionalPublicRuntimeConfig();
  const messages = useMemo(() => getEndingMessages(templateId), [templateId]);
  const ambientConfig = useMemo(() => getEndingAmbientConfig(templateId), [templateId]);

  const resolvedCreateOwn = onCreateOwn ?? publicRuntime?.onCreateOwn;
  const resolvedShowCreateOwn =
    showCreateOwnCta ?? publicRuntime?.showCreateOwnCta ?? Boolean(resolvedCreateOwn);

  const [visibleLineCount, setVisibleLineCount] = useState(0);
  const [showActions, setShowActions] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!visible) {
      setVisibleLineCount(0);
      setShowActions(false);
      setIsFadingOut(false);
      return;
    }

    if (prefersReducedMotion) {
      setVisibleLineCount(messages.length);
      const t = window.setTimeout(() => setShowActions(true), 400);
      return () => clearTimeout(t);
    }

    const timers: number[] = [];
    messages.forEach((_, index) => {
      timers.push(
        window.setTimeout(() => {
          setVisibleLineCount(index + 1);
        }, 420 + index * LINE_STAGGER_MS),
      );
    });

    const actionsAt = 420 + messages.length * LINE_STAGGER_MS + ACTIONS_DELAY_MS;
    timers.push(window.setTimeout(() => setShowActions(true), actionsAt));

    return () => timers.forEach((id) => clearTimeout(id));
  }, [messages, prefersReducedMotion, visible]);

  const isPreview = mode === 'preview';
  const completedOnce = useRef(false);

  const restartTimerRef = useRef<number | null>(null);

  const handleRestart = useCallback(() => {
    if (isFadingOut) return;
    publicRuntime?.onReplay?.();
    setIsFadingOut(true);
    if (restartTimerRef.current) window.clearTimeout(restartTimerRef.current);
    restartTimerRef.current = window.setTimeout(() => {
      restartTimerRef.current = null;
      onRestart();
    }, RESTART_FADE_MS);
  }, [isFadingOut, onRestart, publicRuntime]);

  useEffect(() => {
    return () => {
      if (restartTimerRef.current) window.clearTimeout(restartTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      completedOnce.current = false;
      return;
    }
    if (isPreview || completedOnce.current) return;
    completedOnce.current = true;
    publicRuntime?.onExperienceComplete?.();
  }, [isPreview, publicRuntime, visible]);

  if (!visible && !isFadingOut) return null;

  return (
    <div
      className={[
        'cine-ending',
        visible ? 'cine-ending--visible' : '',
        isFadingOut ? 'cine-ending--fadeout' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="dialog"
      aria-modal="true"
      aria-label="Experience ending"
    >
      <div className="cine-ending-veil" aria-hidden="true" />
      <EndingAmbient config={ambientConfig} reducedMotion={prefersReducedMotion} />

      <div className="cine-ending-content">
        <p className="cine-ending-message">
          {messages.map((line, index) => (
            <span
              key={line}
              className={`cine-ending-line ${index < visibleLineCount ? 'cine-ending-line--show' : ''}`}
            >
              {line}
            </span>
          ))}
        </p>

        <div
          className={[
            'cine-ending-actions',
            isPreview ? 'cine-ending-actions--preview' : 'cine-ending-actions--published',
            showActions && !isFadingOut ? 'cine-ending-actions--show' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {isPreview ? (
            <>
              <button type="button" className="cine-ending-card" onClick={handleRestart}>
                <span className="cine-ending-card-icon" aria-hidden="true">
                  ↺
                </span>
                <span className="cine-ending-card-copy">
                  <span className="cine-ending-card-title">Rewatch Experience</span>
                  <span className="cine-ending-card-sub">Watch the cinematic story again.</span>
                </span>
              </button>

              <button
                type="button"
                className="cine-ending-card"
                onClick={() => void onCreateExperience?.()}
                disabled={!onCreateExperience || isValidating}
                aria-busy={isValidating}
              >
                <span className="cine-ending-card-icon" aria-hidden="true">
                  ♥
                </span>
                <span className="cine-ending-card-copy">
                  <span className="cine-ending-card-title">
                    {isValidating ? 'Checking…' : 'Create This Experience'}
                  </span>
                  <span className="cine-ending-card-sub">
                    Publish this memory with your own photos.
                  </span>
                </span>
              </button>

              {(validationMessage || validationErrors.length > 0) && (
                <div className="cine-ending-validation" role="alert">
                  {validationErrors.length > 0 ? (
                    <ul className="cine-ending-validation-list">
                      {validationErrors.map((err) => (
                        <li key={`${err.field}:${err.message}`}>{err.message}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="cine-ending-validation-text">{validationMessage}</p>
                  )}
                </div>
              )}

              <button type="button" className="cine-ending-card" onClick={onHome} disabled={!onHome}>
                <span className="cine-ending-card-icon" aria-hidden="true">
                  ⌂
                </span>
                <span className="cine-ending-card-copy">
                  <span className="cine-ending-card-title">Back to Home</span>
                  <span className="cine-ending-card-sub">Explore more Chronivs templates.</span>
                </span>
              </button>
            </>
          ) : (
            <>
              <button type="button" className="cine-ending-card" onClick={handleRestart}>
                <span className="cine-ending-card-icon" aria-hidden="true">
                  ♥
                </span>
                <span className="cine-ending-card-copy">
                  <span className="cine-ending-card-title">Rewatch Experience</span>
                  <span className="cine-ending-card-sub">Relive this beautiful memory once more.</span>
                </span>
              </button>

              {resolvedShowCreateOwn && resolvedCreateOwn && (
                <button
                  type="button"
                  className="cine-ending-card"
                  onClick={() => resolvedCreateOwn()}
                >
                  <span className="cine-ending-card-icon" aria-hidden="true">
                    ✨
                  </span>
                  <span className="cine-ending-card-copy">
                    <span className="cine-ending-card-title">Create Your Own Experience</span>
                    <span className="cine-ending-card-sub">Craft a cinematic story for someone special.</span>
                  </span>
                </button>
              )}
            </>
          )}
        </div>

        <p className={`cine-ending-brand ${showActions ? 'cine-ending-brand--show' : ''}`}>
          {isPreview ? 'Crafted with ❤️ using Chronivs' : '✨ Created with Chronivs'}
        </p>
      </div>
    </div>
  );
});
