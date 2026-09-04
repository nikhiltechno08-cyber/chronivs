'use client';

import { memo, useMemo } from 'react';

import { OCCASION_CONFIG, OCCASIONS } from '../../constants/occasions';
import { useStudioStore } from '../../store/studio-store';
import { VOICE_STEP_ENABLED, type OccasionKey } from '../../types';
import { formatDurationMinutes } from '../../utils';
import { ContinueButton, PanelActions } from '../ContinueButton';
import { PanelHead } from '../Hero';

type ExperienceSummaryProps = {
  onGenerate: () => void;
};

export const ExperienceSummary = memo(function ExperienceSummary({ onGenerate }: ExperienceSummaryProps) {
  const occasion = useStudioStore((s) => s.occasion) as OccasionKey | null;
  const receiverName = useStudioStore((s) => s.receiverName);
  const photos = useStudioStore((s) => s.photos);
  const audio = useStudioStore((s) => s.audio);

  const summary = useMemo(() => {
    if (!occasion) return null;
    const cfg = OCCASION_CONFIG[occasion];
    const occasionLabel = OCCASIONS.find((o) => o.key === occasion)?.label ?? '—';
    const photoLabel = `${photos.length} ${photos.length === 1 ? 'photo added' : 'photos added'}`;
    const audioLabel = audio ? (audio.source === 'recorded' ? 'Recorded' : 'Uploaded') : 'Not added';
    const duration = formatDurationMinutes(photos.length, Boolean(audio));

    return {
      emoji: cfg.emoji,
      title: cfg.summaryLabel,
      subtitle: receiverName ? `For ${receiverName}` : 'Crafted with care',
      rows: [
        { key: 'Occasion', value: occasionLabel },
        { key: 'Recipient', value: receiverName || '—' },
        { key: 'Photos', value: photoLabel },
        ...(VOICE_STEP_ENABLED ? [{ key: 'Voice Message', value: audioLabel }] : []),
        { key: 'Estimated Duration', value: duration },
      ],
    };
  }, [audio, occasion, photos.length, receiverName]);

  if (!summary) return null;

  return (
    <>
      <PanelHead
        eyebrow="Almost there"
        title="Everything looks perfect."
        description="Here's the experience you've created."
      />

      <div className="studio-summary-card">
        <div className="studio-summary-icon" aria-hidden="true">
          {summary.emoji}
        </div>
        <div className="studio-summary-title">{summary.title}</div>
        <div className="studio-summary-sub">{summary.subtitle}</div>
        <dl className="studio-summary-rows">
          {summary.rows.map((row) => (
            <div key={row.key} className="studio-summary-row">
              <dt className="k">{row.key}</dt>
              <dd className="v">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <PanelActions>
        <ContinueButton onClick={onGenerate}>✨ Generate Experience</ContinueButton>
      </PanelActions>
    </>
  );
});
