'use client';

import { memo } from 'react';

import type { SaveStatus } from '@/features/experience-engine/persistence/useExperiencePersistence';

const LABELS: Record<SaveStatus, string> = {
  idle: '',
  saving: 'Saving…',
  saved: 'Saved',
  error: 'Save failed — retrying',
  offline: 'Offline — kept locally',
};

type SaveStatusIndicatorProps = {
  status: SaveStatus;
};

/** Tiny non-intrusive persistence status — no toasts, no layout redesign. */
export const SaveStatusIndicator = memo(function SaveStatusIndicator({
  status,
}: SaveStatusIndicatorProps) {
  const label = LABELS[status];
  if (!label) return null;

  return (
    <div className="studio-save-status" role="status" aria-live="polite">
      <span
        className={`studio-save-status-dot studio-save-status-dot--${status}`}
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
});
