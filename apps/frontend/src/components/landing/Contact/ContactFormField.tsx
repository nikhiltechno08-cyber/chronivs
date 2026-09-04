import { type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';

import { cn } from '@chronivs/ui';

type ContactFieldBaseProps = {
  id: string;
  label: string;
  error?: string;
  className?: string;
};

type ContactInputFieldProps = ContactFieldBaseProps &
  InputHTMLAttributes<HTMLInputElement> & {
    multiline?: false;
  };

type ContactTextareaFieldProps = ContactFieldBaseProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    multiline: true;
  };

export type ContactFormFieldProps = ContactInputFieldProps | ContactTextareaFieldProps;

export function ContactFormField(props: ContactFormFieldProps) {
  const { id, label, error, className, multiline, ...rest } = props;
  const describedBy = error ? `${id}-error` : undefined;
  const inputClassName = cn('contact-field-input', error && 'has-error');

  let control: ReactNode;

  if (multiline) {
    const textareaProps = rest as TextareaHTMLAttributes<HTMLTextAreaElement>;
    control = (
      <textarea
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={cn(inputClassName, 'contact-field-textarea')}
        rows={5}
        {...textareaProps}
      />
    );
  } else {
    const inputProps = rest as InputHTMLAttributes<HTMLInputElement>;
    control = (
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={inputClassName}
        {...inputProps}
      />
    );
  }

  return (
    <div className={cn('contact-field', className)}>
      <label htmlFor={id} className="contact-field-label">
        {label}
      </label>
      {control}
      {error ? (
        <p id={`${id}-error`} className="contact-field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
