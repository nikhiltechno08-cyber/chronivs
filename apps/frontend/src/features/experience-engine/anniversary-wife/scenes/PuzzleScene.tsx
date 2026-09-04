'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { CelebrationFx } from '../components/CelebrationFx';
import { CTAButton } from '../components/CTAButton';
import { SceneShell } from '../components/SceneShell';
import { ART_SVG, resolveWifePhotos } from '../constants/story';
import type { SceneComponentProps } from '../types';

function shuffleOrder(): number[] {
  const order = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  for (let s = order.length - 1; s > 0; s--) {
    const r = Math.floor(Math.random() * (s + 1));
    const tmp = order[s]!;
    order[s] = order[r]!;
    order[r] = tmp;
  }
  if (order.every((v, idx) => v === idx)) {
    order[0] = 1;
    order[1] = 0;
  }
  return order;
}

const SOLVED_ORDER = [0, 1, 2, 3, 4, 5, 6, 7, 8];

export const PuzzleScene = memo(function PuzzleScene({ data, onNext, isActive }: SceneComponentProps) {
  const photos = resolveWifePhotos(data.photos);
  const artUrl = photos[0] || ART_SVG;
  const [order, setOrder] = useState<number[]>(() => shuffleOrder());
  const [solved, setSolved] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [tileSize, setTileSize] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!isActive) {
      setOrder(shuffleOrder());
      setSolved(false);
      setShowCta(false);
      setCelebrate(false);
      setDragging(null);
      initialized.current = false;
      return;
    }
    if (!initialized.current) {
      setOrder(shuffleOrder());
      initialized.current = true;
    }
  }, [isActive]);

  const checkSolved = useCallback((current: number[]) => {
    const isSolved = current.every((v, idx) => v === idx);
    if (isSolved) {
      setSolved(true);
      setCelebrate(true);
      window.setTimeout(() => setShowCta(true), 900);
    }
  }, []);

  const getSlotFromPoint = useCallback((clientX: number, clientY: number) => {
    const grid = gridRef.current;
    if (!grid) return null;
    const rect = grid.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;
    const col = Math.min(2, Math.floor(x / (rect.width / 3)));
    const row = Math.min(2, Math.floor(y / (rect.height / 3)));
    return row * 3 + col;
  }, []);

  const finishSolve = useCallback(() => {
    setSolved(true);
    setCelebrate(true);
    setDragging(null);
    window.setTimeout(() => setShowCta(true), 900);
  }, []);

  const handleAutoSolve = useCallback(() => {
    if (solved) return;
    setOrder(SOLVED_ORDER);
    finishSolve();
  }, [solved, finishSolve]);

  const dragSlotRef = useRef<number | null>(null);

  useEffect(() => {
    if (dragging === null) return;
    dragSlotRef.current = dragging;

    const onMove = (e: PointerEvent) => {
      setDragPos({ x: e.clientX, y: e.clientY });
    };

    const onUp = (e: PointerEvent) => {
      const fromSlot = dragSlotRef.current;
      if (fromSlot === null) return;
      const targetSlot = getSlotFromPoint(e.clientX, e.clientY);
      if (targetSlot !== null && targetSlot !== fromSlot) {
        setOrder((prev) => {
          const next = [...prev];
          const a = next[fromSlot]!;
          const b = next[targetSlot]!;
          next[fromSlot] = b;
          next[targetSlot] = a;
          checkSolved(next);
          return next;
        });
      }
      dragSlotRef.current = null;
      setDragging(null);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [dragging, getSlotFromPoint, checkSolved]);

  const handlePointerDown = useCallback(
    (slot: number, e: React.PointerEvent<HTMLButtonElement>) => {
      if (solved) return;
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      setTileSize(rect.width);
      setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setDragPos({ x: e.clientX, y: e.clientY });
      setDragging(slot);
    },
    [solved],
  );

  const draggingHomeIdx = dragging !== null ? order[dragging] : null;

  if (!isActive) return null;

  const ghostHomeIdx = draggingHomeIdx ?? null;

  return (
    <SceneShell id="scene-wife-puzzle">
      <CelebrationFx active={celebrate} light />
      <div className="aw-eyebrow">OUR LOVE, PIECE BY PIECE</div>
      <h1 className="aw-title aw-title-sm">
        Put us back <em>together.</em>
      </h1>
      <div className="aw-puzzle-outer">
        <div className={`aw-puzzle-frame ${solved ? 'solved' : ''}`}>
          <div className="aw-puzzle-grid" ref={gridRef}>
            {order.map((homeIdx, slot) => {
              const col = homeIdx % 3;
              const row = Math.floor(homeIdx / 3);
              const isDragging = dragging === slot;
              return (
                <button
                  key={`tile-${slot}`}
                  type="button"
                  className={`aw-tile ${isDragging ? 'aw-tile-dragging' : ''}`}
                  style={{
                    backgroundImage: `url("${artUrl}")`,
                    backgroundPosition: `-${col * 100}px -${row * 100}px`,
                  }}
                  onPointerDown={(e) => handlePointerDown(slot, e)}
                  aria-label={`Puzzle piece ${slot + 1}`}
                />
              );
            })}
          </div>
        </div>
        <div className={`aw-puzzle-glow ${solved ? 'on' : ''}`} />
        {ghostHomeIdx !== null && dragging !== null && tileSize > 0 && (
          <div
            className="aw-tile-ghost"
            style={{
              width: tileSize,
              height: tileSize,
              left: dragPos.x - dragOffset.x,
              top: dragPos.y - dragOffset.y,
              backgroundImage: `url("${artUrl}")`,
              backgroundPosition: `-${(ghostHomeIdx % 3) * 100}px -${Math.floor(ghostHomeIdx / 3) * 100}px`,
              backgroundSize: `${tileSize * 3}px ${tileSize * 3}px`,
            }}
          />
        )}
      </div>
      {!solved && (
        <CTAButton show onClick={handleAutoSolve} small className="aw-puzzle-solve-btn">
          Complete Puzzle for Me
        </CTAButton>
      )}
      <CTAButton show={showCta} onClick={onNext} small>
        Our Story Continues
      </CTAButton>
    </SceneShell>
  );
});
