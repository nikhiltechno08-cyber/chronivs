'use client';

import { forwardRef, useCallback, useId, useState, type InputHTMLAttributes, type ChangeEvent } from 'react';

import { FloatingField } from '../forms/FloatingField';

type DatePickerProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string;
  error?: string;
};

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
  { label, error, value, defaultValue, onChange, className = '', ...props },
  ref,
) {
  const [localValue, setLocalValue] = useState(() => String(value ?? defaultValue ?? ''));
  const currentValue = value !== undefined ? String(value) : localValue;
  const filled = Boolean(currentValue);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) setLocalValue(e.target.value);
      onChange?.(e);
    },
    [onChange, value],
  );

  const fieldId = useId();

  return (
    <FloatingField label={label} fieldId={fieldId} filled={filled} error={error}>
      <input
        id={fieldId}
        ref={ref}
        type="date"
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        className={`studio-date-input ${filled ? 'has-value' : ''} ${className}`.trim()}
        {...props}
      />
    </FloatingField>
  );
});
