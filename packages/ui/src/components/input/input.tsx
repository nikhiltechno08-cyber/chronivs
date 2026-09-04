import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

import { cn } from '../../lib/cn';

const fieldStyles = cn(
  'w-full rounded-[var(--chronivs-radius-lg)] border border-[var(--chronivs-border-default)]',
  'bg-[var(--chronivs-surface-primary)] px-4 py-3',
  'text-[length:var(--chronivs-text-body-sm)] text-[var(--chronivs-fg-primary)]',
  'placeholder:text-[var(--chronivs-fg-muted)]',
  'transition-[border-color,box-shadow] duration-300',
  'focus-visible:border-[var(--chronivs-primary)] focus-visible:outline-none',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input ref={ref} type={type} className={cn(fieldStyles, className)} {...props} />
  ),
);
Input.displayName = 'Input';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(fieldStyles, 'min-h-[120px] resize-y', className)}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';
