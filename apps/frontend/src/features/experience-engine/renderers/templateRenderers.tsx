'use client';

import dynamic from 'next/dynamic';
import { useEffect, type ComponentType } from 'react';

import { StoryLoadingScreen } from '../components/StoryLoadingScreen';
import type { ExperienceRendererProps } from '../renderers';
import type { ExperienceTemplateId } from '../types';

export type ExperienceRendererMountProps = ExperienceRendererProps & {
  /** Fires once the lazy template chunk has mounted (not while loading.tsx shows). */
  onTemplateReady?: () => void;
};

function attachReadyCallback(
  Component: ComponentType<ExperienceRendererProps>,
): ComponentType<ExperienceRendererMountProps> {
  return function TemplateWithReady({ onTemplateReady, ...props }: ExperienceRendererMountProps) {
    useEffect(() => {
      if (!onTemplateReady) return;
      onTemplateReady();
    }, [onTemplateReady]);

    return <Component {...props} />;
  };
}

/* Template CSS is imported inside each template entry so unused templates stay out of the bundle. */

/** Same cinematic loader used by Studio Generate — shown while template chunks load. */
export function ExperienceTemplateLoading() {
  return (
    <StoryLoadingScreen
      message="Weaving your photos into a cinematic story…"
      startProgress={68}
      maxProgress={94}
    />
  );
}

/** Lazy template recipes — only the active template downloads. */
const BirthdayGirlfriendExperience = dynamic(
  () =>
    import('../birthday-girlfriend').then((m) => ({
      default: attachReadyCallback(m.BirthdayGirlfriendExperience),
    })),
  { ssr: false, loading: () => <ExperienceTemplateLoading /> },
);

const BirthdayMotherExperience = dynamic(
  () =>
    import('../birthday-mother').then((m) => ({
      default: attachReadyCallback(m.BirthdayMotherExperience),
    })),
  { ssr: false, loading: () => <ExperienceTemplateLoading /> },
);

const BirthdayFatherExperience = dynamic(
  () =>
    import('../birthday-father').then((m) => ({
      default: attachReadyCallback(m.BirthdayFatherExperience),
    })),
  { ssr: false, loading: () => <ExperienceTemplateLoading /> },
);

const AnniversaryWifeExperience = dynamic(
  () =>
    import('../anniversary-wife').then((m) => ({
      default: attachReadyCallback(m.AnniversaryWifeExperience),
    })),
  { ssr: false, loading: () => <ExperienceTemplateLoading /> },
);

const ProposalGirlfriendExperience = dynamic(
  () =>
    import('../proposal-girlfriend').then((m) => ({
      default: attachReadyCallback(m.ProposalGirlfriendExperience),
    })),
  { ssr: false, loading: () => <ExperienceTemplateLoading /> },
);

export const TEMPLATE_RENDERERS: Record<
  ExperienceTemplateId,
  ComponentType<ExperienceRendererMountProps>
> = {
  'birthday-girlfriend': BirthdayGirlfriendExperience,
  'birthday-mother': BirthdayMotherExperience,
  'birthday-father': BirthdayFatherExperience,
  'anniversary-wife': AnniversaryWifeExperience,
  'proposal-girlfriend': ProposalGirlfriendExperience,
};

export function resolveTemplateRenderer(
  templateId: string,
): ComponentType<ExperienceRendererMountProps> | null {
  return TEMPLATE_RENDERERS[templateId as ExperienceTemplateId] ?? null;
}
