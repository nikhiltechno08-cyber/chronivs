'use client';

import { memo } from 'react';

type MessageShuffleHintProps = {
  onShuffle: () => void;
  disabled?: boolean;
};

/**
 * Helper copy + subtle Shuffle control above the message textarea.
 * No pills / selectors — keeps Studio chrome unchanged.
 */
export const MessageShuffleHint = memo(function MessageShuffleHint({
  onShuffle,
  disabled = false,
}: MessageShuffleHintProps) {
  return (
    <div className="studio-message-shuffle">
      <p className="studio-message-shuffle-copy">
        We&apos;ve written something to help you get started.
        <br />
        Feel free to edit it or make it completely your own.
      </p>
      <button
        type="button"
        className="studio-message-shuffle-btn"
        onClick={onShuffle}
        disabled={disabled}
        aria-label="Shuffle message"
      >
        ✨ Shuffle
      </button>
    </div>
  );
});
