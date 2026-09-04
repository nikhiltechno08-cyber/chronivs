'use client';

import {
  forwardRef,
  memo,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';

type FloatingFieldProps = {
  label: string;
  fieldId: string;
  filled?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
};

export const FloatingField = memo(function FloatingField({
  label,
  fieldId,
  filled = false,
  error,
  hint,
  children,
}: FloatingFieldProps) {
  return (
    <div className={`studio-floating-field relative ${filled ? 'filled' : ''}`}>
      {children}
      <label htmlFor={fieldId}>{label}</label>
      {hint && !error && (
        <p className="mt-2 pl-0.5 text-xs text-[var(--studio-gray-faint)]">{hint}</p>
      )}
      {error && (
        <p className="mt-2 pl-0.5 text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

type FloatingInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(function FloatingInput(
  { label, error, value, defaultValue, onChange, placeholder = ' ', ...props },
  ref,
) {
  const [filled, setFilled] = useState(() => Boolean(value ?? defaultValue));

  useEffect(() => {
    if (value !== undefined) setFilled(Boolean(String(value)));
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilled(Boolean(e.target.value));
    onChange?.(e);
  };

  const fieldId = useId();

  return (
    <FloatingField label={label} fieldId={fieldId} filled={filled} error={error}>
      <input
        {...props}
        id={fieldId}
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        onChange={handleChange}
      />
    </FloatingField>
  );
});

type FloatingTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  maxLength?: number;
  showCount?: boolean;
};

export const FloatingTextarea = forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
  function FloatingTextarea({
    label,
    error,
    value,
    defaultValue,
    onChange,
    maxLength,
    showCount,
    placeholder = ' ',
    ...props
  }, ref) {
    const initial = String(value ?? defaultValue ?? '');
    const [filled, setFilled] = useState(() => Boolean(initial));
    const [count, setCount] = useState(() => initial.length);
    const localRef = useRef<HTMLTextAreaElement | null>(null);

    const setRefs = (node: HTMLTextAreaElement | null) => {
      localRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    useEffect(() => {
      if (value !== undefined) {
        const next = String(value);
        setFilled(Boolean(next));
        setCount(next.length);
        return;
      }
      const el = localRef.current;
      if (!el) return;
      const sync = () => {
        setFilled(Boolean(el.value));
        setCount(el.value.length);
      };
      sync();
      el.addEventListener('input', sync);
      return () => el.removeEventListener('input', sync);
    }, [value, defaultValue]);

    // Lenis captures wheel on the document — keep nested scroll inside the textarea.
    useEffect(() => {
      const el = localRef.current;
      if (!el) return;

      const onWheel = (event: WheelEvent) => {
        const canScroll = el.scrollHeight > el.clientHeight + 1;
        if (!canScroll) return;

        const delta = event.deltaY;
        const atTop = el.scrollTop <= 0;
        const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;

        if ((delta < 0 && atTop) || (delta > 0 && atBottom)) {
          // Let Lenis/page take over at the edges only.
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        el.scrollTop += delta;
      };

      el.addEventListener('wheel', onWheel, { passive: false });
      return () => el.removeEventListener('wheel', onWheel);
    }, []);

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      setFilled(Boolean(e.target.value));
      setCount(e.target.value.length);
      onChange?.(e);
    };

    const fieldId = useId();

    return (
      <FloatingField label={label} fieldId={fieldId} filled={filled} error={error}>
        <textarea
          {...props}
          id={fieldId}
          ref={setRefs}
          value={value}
          defaultValue={defaultValue}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={handleChange}
          data-lenis-prevent
          data-lenis-prevent-wheel
        />
        {showCount && maxLength != null && (
          <span className="studio-mono studio-char-count" aria-live="polite">
            {count}/{maxLength}
          </span>
        )}
      </FloatingField>
    );
  },
);
