'use client';

import { useEffect, useState } from 'react';

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
};

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search by customer, email, or order ID…',
  debounceMs = 350,
}: SearchBarProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (draft !== value) {
        onChange(draft);
      }
    }, debounceMs);
    return () => window.clearTimeout(timer);
  }, [draft, debounceMs, onChange, value]);

  return (
    <label className="admin-search-bar">
      <span className="sr-only">Search orders</span>
      <input
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
    </label>
  );
}
