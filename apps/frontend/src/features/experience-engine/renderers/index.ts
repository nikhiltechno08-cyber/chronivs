import type { ComponentType } from 'react';

import type { ExperienceData } from '@/types/experience';

import type { ExperienceViewMode } from '../shared/cinematic-ending';
import type { ExperienceInputData, ExperienceTemplateId } from '../types';

/**
 * Template entry props.
 * `experienceData` is the canonical source of truth.
 * `data` is a derived flat view for existing scenes (always built from experienceData).
 */
export type ExperienceRendererProps = {
  experienceData: ExperienceData;
  data: ExperienceInputData;
  templateId: ExperienceTemplateId;
  mode?: ExperienceViewMode;
  onComplete?: () => void;
};

type RendererEntry = {
  id: ExperienceTemplateId;
  component: ComponentType<ExperienceRendererProps>;
};

const rendererRegistry = new Map<ExperienceTemplateId, ComponentType<ExperienceRendererProps>>();

export function registerExperienceRenderer(entry: RendererEntry): void {
  rendererRegistry.set(entry.id, entry.component);
}

export function getExperienceRenderer(
  id: ExperienceTemplateId,
): ComponentType<ExperienceRendererProps> | undefined {
  return rendererRegistry.get(id);
}

export function hasExperienceRenderer(id: ExperienceTemplateId): boolean {
  return rendererRegistry.has(id);
}
