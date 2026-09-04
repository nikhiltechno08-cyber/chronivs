'use client';

import { memo, useEffect, useRef, useState } from 'react';

type TypewriterTextProps = {
  lines: string[];
  active: boolean;
  charMs?: number;
  linePauseMs?: number;
  onComplete?: () => void;
};

export const TypewriterText = memo(function TypewriterText({
  lines,
  active,
  charMs = 34,
  linePauseMs = 650,
  onComplete,
}: TypewriterTextProps) {
  const [visibleChars, setVisibleChars] = useState<number[]>(() => lines.map(() => 0));
  const [activeLine, setActiveLine] = useState(0);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!active) {
      setVisibleChars(lines.map(() => 0));
      setActiveLine(0);
      doneRef.current = false;
      return;
    }

    if (doneRef.current) return;

    let cancelled = false;
    let line = 0;
    let char = 0;
    setVisibleChars(lines.map(() => 0));
    setActiveLine(0);

    let timeoutId = 0;

    const tick = () => {
      if (cancelled) return;
      const current = lines[line] ?? '';
      if (char < current.length) {
        char += 1;
        setVisibleChars((prev) => {
          const next = [...prev];
          next[line] = char;
          return next;
        });
        timeoutId = window.setTimeout(tick, charMs);
        return;
      }

      if (line < lines.length - 1) {
        line += 1;
        char = 0;
        setActiveLine(line);
        timeoutId = window.setTimeout(tick, linePauseMs);
        return;
      }

      if (!doneRef.current) {
        doneRef.current = true;
        onCompleteRef.current?.();
      }
    };

    timeoutId = window.setTimeout(tick, 200);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [active, charMs, linePauseMs, lines]);

  return (
    <div className="aw-letter-body">
      {lines.map((line, i) => {
        const count = visibleChars[i] ?? 0;
        const shown = line.slice(0, count);
        const isActive = active && i === activeLine && count < line.length;
        return (
          <div key={`line-${i}`} className="aw-letter-line">
            <span className="aw-letter-line-measure" aria-hidden="true">
              {line || '\u00a0'}
            </span>
            <span className="aw-letter-line-text">
              {shown}
              {isActive && <span className="aw-cursor-blink" aria-hidden="true" />}
            </span>
          </div>
        );
      })}
    </div>
  );
});
