'use client';

import { forwardRef, type TextareaHTMLAttributes } from 'react';

import { FloatingTextarea } from '../forms/FloatingField';

/** Raised so full template default messages fit without truncating. */
const MESSAGE_MAX = 1200;

type MessageInputProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'maxLength'> & {
  label: string;
  error?: string;
};

export const MessageInput = forwardRef<HTMLTextAreaElement, MessageInputProps>(function MessageInput(
  { label, error, ...props },
  ref,
) {
  return (
    <FloatingTextarea
      ref={ref}
      label={label}
      error={error}
      maxLength={MESSAGE_MAX}
      showCount
      {...props}
    />
  );
});

export { MESSAGE_MAX };
