import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ExperiencePlayer } from '@/features/experience-engine/components/ExperiencePlayer';
import { isRegisteredTemplateId } from '@/features/experience-engine/core/template-registry';
import type { ExperienceViewMode } from '@/features/experience-engine/shared/cinematic-ending';
import type { ExperienceTemplateId } from '@/features/experience-engine/types';

export const metadata: Metadata = {
  title: 'Chronivs Experience',
  description: 'A cinematic personal experience, crafted just for you.',
};

type ExperiencePageProps = {
  params: Promise<{ templateId: string }>;
  searchParams: Promise<{ mode?: string }>;
};

export default async function ExperiencePage({ params, searchParams }: ExperiencePageProps) {
  const { templateId } = await params;
  const query = await searchParams;

  if (!isRegisteredTemplateId(templateId)) {
    notFound();
  }

  const mode: ExperienceViewMode = query.mode === 'published' ? 'published' : 'preview';

  return <ExperiencePlayer templateId={templateId as ExperienceTemplateId} mode={mode} />;
}
