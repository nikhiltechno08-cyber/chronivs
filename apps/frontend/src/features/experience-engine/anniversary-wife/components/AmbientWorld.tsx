'use client';

import { memo, useEffect, useRef, useState } from 'react';

import { THEMES } from '../constants/story';

type AmbientWorldProps = {
  sceneIndex: number;
};

export const AmbientWorld = memo(function AmbientWorld({ sceneIndex }: AmbientWorldProps) {
  const [bgA, setBgA] = useState<string>(THEMES[0]);
  const [bgB, setBgB] = useState<string>(THEMES[0]);
  const [activeLayer, setActiveLayer] = useState<'A' | 'B'>('A');
  const bgFlagRef = useRef(true);
  const isFirst = useRef(true);

  useEffect(() => {
    const g = THEMES[sceneIndex] ?? THEMES[0];
    if (isFirst.current) {
      isFirst.current = false;
      setBgA(g);
      setActiveLayer('A');
      return;
    }
    if (bgFlagRef.current) {
      setBgB(g);
      setActiveLayer('B');
    } else {
      setBgA(g);
      setActiveLayer('A');
    }
    bgFlagRef.current = !bgFlagRef.current;
  }, [sceneIndex]);

  return (
    <>
      <div
        className={`aw-bg-layer ${activeLayer === 'A' ? 'on' : ''}`}
        style={{ background: bgA }}
        aria-hidden="true"
      />
      <div
        className={`aw-bg-layer ${activeLayer === 'B' ? 'on' : ''}`}
        style={{ background: bgB }}
        aria-hidden="true"
      />
      <div className="aw-rays" aria-hidden="true" />
      <div className="aw-fog" aria-hidden="true" />
      <div className="aw-grain" aria-hidden="true" />
      <div className="aw-vignette" aria-hidden="true" />
    </>
  );
});
