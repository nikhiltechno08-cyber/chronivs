'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { useReducedMotion } from '@/animations/hooks/use-reduced-motion';
import { useCheckout } from '@/features/checkout';
import { resolveTemplateId } from '@/features/experience-engine/core/template-registry';
import {
  formatPublishErrors,
  runPublishValidationPipeline,
  type PublishValidationIssue,
} from '@/services/publishValidator';

import { OCCASION_CONFIG, OCCASIONS } from '../../constants/occasions';
import { useStudioStore } from '../../store/studio-store';
import { saveSessionMedia } from '../../utils/session-media';
import type { OccasionKey } from '../../types';
import { ContinueButton } from '../ContinueButton';
import { PreviewCard } from '../PreviewCard';

type FinalOverlayProps = {
  visible: boolean;
  onToast: (message: string) => void;
};

export const FinalOverlay = memo(function FinalOverlay({ visible }: FinalOverlayProps) {
  const router = useRouter();
  const { openCheckout } = useCheckout();
  const occasion = useStudioStore((s) => s.occasion) as OccasionKey | null;
  const receiverName = useStudioStore((s) => s.receiverName);
  const templateConfig = useStudioStore((s) => s.templateConfig);
  const generatedExperience = useStudioStore((s) => s.generatedExperience);
  const storePhotos = useStudioStore((s) => s.photos);
  const storeAudio = useStudioStore((s) => s.audio);
  const relationship = useStudioStore((s) => s.relationship);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<PublishValidationIssue[]>([]);

  useEffect(() => {
    if (!visible || prefersReducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const cx = canvas.width / 2;
    const cy = canvas.height * 0.35;
    const particles = Array.from({ length: 90 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        r: Math.random() * 2.5 + 1.5,
        life: 1,
        color: Math.random() > 0.5 ? '230,193,90' : '244,242,238',
      };
    });

    let running = true;
    const stopTimer = setTimeout(() => {
      running = false;
    }, 3200);

    let frameId = 0;
    const loop = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.vy += 0.06;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.008;
        if (p.life <= 0) return;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.life})`;
        ctx.fill();
      });
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(frameId);
      clearTimeout(stopTimer);
      window.removeEventListener('resize', resize);
    };
  }, [visible, prefersReducedMotion]);

  const cfg = occasion ? OCCASION_CONFIG[occasion] : null;
  const title = receiverName ? `For ${receiverName}` : 'For someone special';
  const subtitle = cfg?.summaryLabel ?? 'Chronivs Experience';
  const emoji = cfg?.emoji ?? '🎁';

  const handlePreview = useCallback(() => {
    saveSessionMedia(storePhotos, storeAudio);

    const templateId =
      generatedExperience?.templateId ??
      templateConfig.templateId ??
      resolveTemplateId(occasion, relationship) ??
      'birthday-girlfriend';


    router.push(`/experience/${templateId}`);
  }, [
    generatedExperience?.templateId,
    occasion,
    relationship,
    router,
    storeAudio,
    storePhotos,
    templateConfig.templateId,
  ]);

  const handleCreateExperience = useCallback(async () => {
    const templateId =
      generatedExperience?.templateId ??
      templateConfig.templateId ??
      resolveTemplateId(occasion, relationship) ??
      'birthday-girlfriend';

    const occasionLabel =
      OCCASIONS.find((o) => o.key === occasion)?.label ??
      cfg?.summaryLabel ??
      'Special occasion';

    const relationshipLabel =
      (occasion && relationship
        ? OCCASION_CONFIG[occasion].relationships.find((r) => r.key === relationship)?.label
        : undefined) ??
      relationship ??
      'Someone special';

    const templateName =
      generatedExperience?.previewTitle ??
      cfg?.summaryLabel ??
      templateId
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

    setIsValidating(true);
    setValidationErrors([]);
    try {
      const result = await runPublishValidationPipeline({
        stage: 'pre_publish',
        experienceId: generatedExperience?.id ?? null,
      });
      if (!result.valid) {
        setValidationErrors(result.errors);
        return;
      }

      openCheckout({
        templateId,
        templateName,
        occasion: occasionLabel,
        relationship: relationshipLabel,
        experienceId: result.experienceId ?? generatedExperience?.id ?? null,
      });
    } finally {
      setIsValidating(false);
    }
  }, [
    cfg?.summaryLabel,
    generatedExperience?.id,
    generatedExperience?.previewTitle,
    generatedExperience?.templateId,
    occasion,
    openCheckout,
    relationship,
    templateConfig.templateId,
  ]);

  return (
    <div
      className={`studio-final-overlay ${visible ? 'show' : ''}`}
      {...(visible
        ? { role: 'dialog' as const, 'aria-modal': true, 'aria-label': 'Experience ready' }
        : { 'aria-hidden': true })}
      inert={!visible || undefined}
    >
      {!prefersReducedMotion && (
        <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1]" />
      )}
      <div className="relative z-[2] max-w-[420px] px-6 pt-[120px] pb-[60px] text-center">
        <div className="text-[34px]" aria-hidden="true">
          ✨
        </div>
        <h1 className="studio-serif mt-3.5 text-[clamp(26px,4vw,36px)] font-normal text-[var(--studio-white)] italic">
          Your experience is ready.
        </h1>
        <PreviewCard emoji={emoji} title={title} subtitle={subtitle} reveal={visible} />
        <div className="mt-9 flex flex-col items-center gap-3">
          <ContinueButton onClick={() => void handleCreateExperience()} disabled={isValidating}>
            {isValidating ? 'Checking…' : 'Create My Experience'}
          </ContinueButton>
          {validationErrors.length > 0 && (
            <div className="studio-publish-validation" role="alert">
              {formatPublishErrors(validationErrors)}
            </div>
          )}
          <ContinueButton variant="secondary" onClick={handlePreview}>
            Preview Experience
          </ContinueButton>
          <Link href="/" className="studio-btn-ghost">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
});
