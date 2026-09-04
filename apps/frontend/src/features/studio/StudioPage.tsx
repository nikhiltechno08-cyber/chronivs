'use client';

import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { memo, useCallback, type ReactNode } from 'react';

import { useReducedMotion } from '@/animations/hooks/use-reduced-motion';
import { completeExperiencePublish } from '@/services/publish.service';

const panelEase = [0.22, 0.61, 0.36, 1] as const;

import { CheckoutProvider, CheckoutSheet } from '@/features/checkout';

import { OccasionSelector } from './components/OccasionSelector';
import { RelationshipSelector } from './components/RelationshipSelector';
import { StudioNav } from './components/ProgressIndicator';
import { StudioAmbientBackground } from './components/Hero';
import { StudioToast } from './components/StudioToast';
import { LoadingOverlay } from './components/overlays/LoadingOverlay';
import { StudioExperienceSync } from './components/StudioExperienceSync';
import { StudioPersistenceBoot } from './components/StudioPersistenceBoot';
import { useGenerateStub } from './hooks/use-generate-stub';
import { useStudioNavigation } from './hooks/use-studio-navigation';
import { useStudioToast } from './hooks/use-studio-toast';
import { useStudioStore } from './store/studio-store';
import './studio.css';

const DetailsForm = dynamic(() => import('./components/DetailsForm').then((m) => m.DetailsForm), {
  loading: () => null,
});
const MediaUploader = dynamic(() => import('./components/MediaUploader').then((m) => m.MediaUploader), {
  loading: () => null,
});
const AudioRecorder = dynamic(() => import('./components/AudioRecorder').then((m) => m.AudioRecorder), {
  loading: () => null,
});
const ExperienceSummary = dynamic(
  () => import('./components/ExperienceSummary').then((m) => m.ExperienceSummary),
  { loading: () => null },
);

function StepMotion({ stepKey, children }: { stepKey: string; children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className="w-full max-w-[760px]">{children}</div>;
  }

  return (
    <motion.div
      key={stepKey}
      className="w-full max-w-[760px]"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{
        hidden: { opacity: 0, y: 22, filter: 'blur(6px)' },
        visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
        exit: { opacity: 0, y: -12, filter: 'blur(4px)' },
      }}
      transition={{ duration: 0.7, ease: panelEase }}
    >
      {children}
    </motion.div>
  );
}

export const StudioPage = memo(function StudioPage() {
  const { step, goNext, goBack } = useStudioNavigation();
  const phase = useStudioStore((s) => s.phase);
  const router = useRouter();
  const setPhase = useStudioStore((s) => s.setPhase);
  const setStep = useStudioStore((s) => s.setStep);
  const { toast, showToast } = useStudioToast();
  const { runGenerate, loadingMessage, loadingProgress } = useGenerateStub();

  const handleContinueEditing = () => {
    setPhase('flow');
    setStep(6);
  };

  const handlePaymentReady = useCallback(
    async (experienceUuid: string) => {
      try {
        showToast('Publishing your experience…');
        await completeExperiencePublish(experienceUuid, router);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Publish failed. Please try again.';
        showToast(message);
      }
    },
    [router, showToast],
  );

  const handleGenerate = () => {
    const photos = useStudioStore.getState().photos;
    const busy = photos.some(
      (p) => p.uploadStatus === 'queued' || p.uploadStatus === 'uploading',
    );
    if (busy) {
      showToast('Please wait for photos to finish uploading');
      return;
    }
    runGenerate();
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <OccasionSelector onContinue={goNext} />;
      case 2:
        return <RelationshipSelector onContinue={goNext} />;
      case 3:
        return <DetailsForm onContinue={goNext} />;
      case 4:
        return <MediaUploader onContinue={goNext} onSkip={goNext} onToast={showToast} />;
      case 5:
        return <AudioRecorder onContinue={goNext} onSkip={goNext} onToast={showToast} />;
      case 6:
        return <ExperienceSummary onGenerate={handleGenerate} />;
      default:
        return null;
    }
  };

  return (
    <CheckoutProvider>
      <StudioExperienceSync>
        <div className="studio-page">
          <StudioAmbientBackground />
          {phase === 'flow' && <StudioNav onBack={goBack} />}
          <StudioPersistenceBoot />

          <main className="relative z-[2] flex min-h-dvh items-center justify-center px-6 pt-[max(130px,calc(110px+env(safe-area-inset-top)))] pb-[max(80px,calc(70px+env(safe-area-inset-bottom)))] max-[768px]:px-[18px] max-[430px]:px-4">
            <AnimatePresence mode="wait">
              <StepMotion stepKey={`step-${step}`}>{renderStep()}</StepMotion>
            </AnimatePresence>
          </main>

          <LoadingOverlay visible={phase === 'loading'} message={loadingMessage} progress={loadingProgress} />
          <CheckoutSheet
            onContinueEditing={handleContinueEditing}
            onToast={showToast}
            onPaymentReady={(id) => void handlePaymentReady(id)}
          />
          <StudioToast message={toast.message} visible={toast.visible} />
        </div>
      </StudioExperienceSync>
    </CheckoutProvider>
  );
});
