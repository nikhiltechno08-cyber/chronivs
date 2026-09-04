'use client';

import { memo, useCallback, useEffect, useState } from 'react';

import { CTAButton } from '../components/CTAButton';
import { CuteTeddy } from '../components/CuteTeddy';
import { LoveLetter } from '../components/LoveLetter';
import { FOREVER_HEART_PATH } from '../components/PerfectHeart';
import { SceneContainer } from '../components/SceneContainer';
import { FINAL_LINES, FINAL_SENTENCES } from '../constants/story';
import type { SceneComponentProps } from '../types';

export const ForeverScene = memo(function ForeverScene({
  data,
  isActive,
  onExperienceEnd,
}: SceneComponentProps & { onExperienceEnd: () => void }) {
  const [letterOpened, setLetterOpened] = useState(false);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [envelopeLanded, setEnvelopeLanded] = useState(false);
  const [showOpenBtn, setShowOpenBtn] = useState(true);
  const [paperOpen, setPaperOpen] = useState(false);
  const [visibleLetterLines, setVisibleLetterLines] = useState(0);
  const [showFlower, setShowFlower] = useState(false);
  const [showSig, setShowSig] = useState(false);
  const [showConstellation, setShowConstellation] = useState(false);
  const [showBear, setShowBear] = useState(false);
  const [finalLines, setFinalLines] = useState<boolean[]>([false, false]);
  const [showCredit, setShowCredit] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setShowSpotlight(false);
      setEnvelopeLanded(false);
      return;
    }

    setShowSpotlight(true);
    const t = window.setTimeout(() => setEnvelopeLanded(true), 700);
    return () => clearTimeout(t);
  }, [isActive]);

  const writeFinalLetter = useCallback(() => {
    let lineIndex = 0;
    const next = () => {
      lineIndex += 1;
      setVisibleLetterLines(lineIndex);
      if (lineIndex < FINAL_SENTENCES.length) {
        window.setTimeout(next, 1450);
      } else {
        window.setTimeout(() => setShowSig(true), 1000);
        window.setTimeout(() => {
          setPaperOpen(false);
          window.setTimeout(() => {
            setShowConstellation(true);
            setShowBear(true);
            window.setTimeout(() => setFinalLines([true, false]), 800);
            window.setTimeout(() => setFinalLines([true, true]), 2500);
            window.setTimeout(() => setShowCredit(true), 3400);
            window.setTimeout(() => onExperienceEnd(), 6600);
          }, 1950);
        }, 2400);
      }
    };
    next();
  }, [onExperienceEnd]);

  const openFinalLetter = useCallback(() => {
    if (letterOpened) return;
    setLetterOpened(true);
    setEnvelopeLanded(false);
    setShowOpenBtn(false);
    setVisibleLetterLines(0);
    window.setTimeout(() => {
      setPaperOpen(true);
      window.setTimeout(() => setShowFlower(true), 450);
      window.setTimeout(writeFinalLetter, 950);
    }, 500);
  }, [letterOpened, writeFinalLetter]);

  if (!isActive) return null;

  return (
    <SceneContainer id="scene-forever" className="forever-scene">
      <div className={`spotlight ${showSpotlight ? 'show' : ''}`} id="spotlight" aria-hidden="true" />
      <svg
        className={`constellation-svg ${showConstellation ? 'show' : ''}`}
        id="constellationSvg"
        viewBox="0 0 400 300"
        aria-hidden="true"
      >
        <path
          d={FOREVER_HEART_PATH}
          pathLength={1}
          fill="none"
          stroke="var(--gold-bright)"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.75"
        />
      </svg>

      <div className="forever-stage">
        <div className="eyebrow">Forever</div>
        <div className={`final-envelope-wrap ${envelopeLanded ? 'landed' : ''}`} id="finalEnvelopeWrap">
          <div className="envelope">
            <div className="env-body" />
            <div className="env-flap" />
            <div className="env-seal left">C</div>
            <div className="env-seal right">C</div>
          </div>
          <div className="final-monogram">for my love</div>
        </div>
        {showOpenBtn && (
          <CTAButton show className="forever-open-btn" onClick={openFinalLetter}>
            ❤️ Open My Letter
          </CTAButton>
        )}
      </div>

      <div className="forever-letter-layer">
        <LoveLetter
          open={paperOpen}
          text=""
          variant="paper"
          senderName={data.senderName}
          showSignature={showSig}
          showFlower={showFlower}
        >
          <div id="finalLetterText">
            {FINAL_SENTENCES.map((line, i) => (
              <span key={line} className={`letter-line ${i < visibleLetterLines ? 'show' : ''}`}>
                {line}
              </span>
            ))}
          </div>
        </LoveLetter>
      </div>

      <div className="forever-closing-layer">
        <div className="final-lines-wrap" id="finalLinesWrap">
          {FINAL_LINES.map((line, i) => (
            <div key={line} className={`final-line serif ${finalLines[i] ? 'show' : ''}`}>
              {line}
            </div>
          ))}
        </div>
        <div className={`bear-cameo ${showBear ? 'show' : ''}`} id="bearCameo2" style={{ width: 72, height: 72 }}>
          <CuteTeddy withHeart />
        </div>
        <div className={`credit-line ${showCredit ? 'show' : ''}`} id="creditLine">
          Made with ❤️ by Chronivs
        </div>
      </div>
      <div id="explosion" aria-hidden="true" />
    </SceneContainer>
  );
});
