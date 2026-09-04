'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { SceneShell } from '../components/SceneShell';
import type { SceneComponentProps } from '../types';

export const DoorScene = memo(function DoorScene({ onNext, isActive }: SceneComponentProps) {
  const [opened, setOpened] = useState(false);
  const [hint, setHint] = useState(true);
  const advancedRef = useRef(false);
  const openTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      setOpened(false);
      setHint(true);
      advancedRef.current = false;
      if (openTimerRef.current != null) {
        window.clearTimeout(openTimerRef.current);
        openTimerRef.current = null;
      }
    }
  }, [isActive]);

  useEffect(() => {
    return () => {
      if (openTimerRef.current != null) {
        window.clearTimeout(openTimerRef.current);
        openTimerRef.current = null;
      }
    };
  }, []);

  const openDoor = useCallback(() => {
    if (opened || advancedRef.current) return;
    setOpened(true);
    setHint(false);
    openTimerRef.current = window.setTimeout(() => {
      openTimerRef.current = null;
      if (advancedRef.current) return;
      advancedRef.current = true;
      onNext();
    }, 1600);
  }, [opened, onNext]);

  if (!isActive) return null;

  return (
    <SceneShell theme="light" id="scene-father-door">
      <span className="fb-chapter">Chapter Two — The Door to Childhood</span>
      <h1 className="fb-title fb-title-light" style={{ fontSize: 'clamp(26px,5.5vw,44px)' }}>
        The House He Built
      </h1>
      <p className={`fb-sub fb-sub-light ${hint ? 'show' : ''}`}>Tap the door to step inside</p>

      <button
        type="button"
        className={`fb-door ${opened ? 'opened' : ''}`}
        onClick={openDoor}
        aria-label="Open the door"
      >
        <div className="fb-door-frame">
          <div className="fb-door-panel left">
            <span className="fb-door-knob" />
            <span className="fb-door-panel-grain" />
          </div>
          <div className="fb-door-panel right">
            <span className="fb-door-knob" />
            <span className="fb-door-panel-grain" />
          </div>
        </div>
        <div className={`fb-door-glow ${opened ? 'on' : ''}`} aria-hidden="true" />
      </button>
    </SceneShell>
  );
});
