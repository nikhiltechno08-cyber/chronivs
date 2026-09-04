import type { OccasionKey, RelationshipKey } from '@/features/studio/types';

import type { ExperienceTemplateId, TemplateDefinition } from '../types';

export const TEMPLATE_REGISTRY: TemplateDefinition[] = [
  {
    id: 'birthday-girlfriend',
    label: 'Birthday · Girlfriend',
    occasion: 'birthday',
    relationships: ['girlfriend'],
  },
  {
    id: 'birthday-mother',
    label: 'Birthday · Mother',
    occasion: 'birthday',
    relationships: ['mother'],
  },
  {
    id: 'birthday-father',
    label: 'Birthday · Father',
    occasion: 'birthday',
    relationships: ['father'],
  },
  {
    id: 'anniversary-wife',
    label: 'Anniversary · Wife',
    occasion: 'anniversary',
    relationships: ['wife'],
  },
  {
    id: 'proposal-girlfriend',
    label: 'Proposal · Girlfriend',
    occasion: 'proposal',
    relationships: ['girlfriend', 'boyfriend', 'partner'],
  },
];

const registryMap = new Map<ExperienceTemplateId, TemplateDefinition>(
  TEMPLATE_REGISTRY.map((t) => [t.id, t]),
);

export function getTemplateDefinition(id: ExperienceTemplateId): TemplateDefinition | undefined {
  return registryMap.get(id);
}

export function isRegisteredTemplateId(id: string): id is ExperienceTemplateId {
  return registryMap.has(id as ExperienceTemplateId);
}

export function resolveTemplateId(
  occasion: OccasionKey | null,
  relationship: RelationshipKey | null,
): ExperienceTemplateId | null {
  if (!occasion || !relationship) return null;

  const match = TEMPLATE_REGISTRY.find(
    (t) => t.occasion === occasion && t.relationships.includes(relationship),
  );

  return match?.id ?? null;
}

export function listTemplatesForOccasion(occasion: OccasionKey): TemplateDefinition[] {
  return TEMPLATE_REGISTRY.filter((t) => t.occasion === occasion);
}
