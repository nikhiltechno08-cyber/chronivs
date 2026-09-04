'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

import { buildSearchResultHref } from '../build-search-href';
import { useGlobalSearch } from '../hooks/use-global-search';
import type { AdminSearchResultItem } from '../types';
import { flattenSearchResults } from './SearchResultCard';
import { SearchModal } from './SearchModal';

const SEARCH_DEBOUNCE_MS = 300;

export function GlobalSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const { data, isLoading, isError } = useGlobalSearch(debouncedQuery, open);
  const flatResults = useMemo(() => flattenSearchResults(data?.groups ?? []), [data?.groups]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(draft);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [draft]);

  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery, data?.total]);

  const closeSearch = useCallback(() => {
    setOpen(false);
  }, []);

  const openSearch = useCallback(() => {
    setOpen(true);
  }, []);

  const navigateToResult = useCallback(
    (item: AdminSearchResultItem) => {
      closeSearch();
      setDraft('');
      setDebouncedQuery('');
      router.push(buildSearchResultHref(item));
    },
    [closeSearch, router],
  );

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeSearch();
        inputRef.current?.blur();
        return;
      }

      if (!open) {
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (flatResults.length === 0) {
          return;
        }
        setActiveIndex((current) => (current + 1) % flatResults.length);
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (flatResults.length === 0) {
          return;
        }
        setActiveIndex((current) => (current - 1 + flatResults.length) % flatResults.length);
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        const selected = flatResults[activeIndex];
        if (selected) {
          navigateToResult(selected);
        }
      }
    },
    [activeIndex, closeSearch, flatResults, navigateToResult, open],
  );

  useEffect(() => {
    const handleShortcut = (event: globalThis.KeyboardEvent) => {
      const isModifier = event.metaKey || event.ctrlKey;
      if (isModifier && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        openSearch();
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [openSearch]);

  return (
    <div className="admin-global-search">
      <label className="admin-global-search-field">
        <Search aria-hidden="true" className="admin-global-search-icon" />
        <span className="sr-only">Search orders, customers, experiences, and payments</span>
        <input
          ref={inputRef}
          type="search"
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            openSearch();
          }}
          onFocus={openSearch}
          onKeyDown={handleKeyDown}
          placeholder="Search orders, customers, experiences..."
          autoComplete="off"
          spellCheck={false}
        />
        <span className="admin-global-search-shortcut" aria-hidden="true">
          Ctrl K
        </span>
      </label>

      <SearchModal
        open={open}
        query={debouncedQuery}
        activeIndex={activeIndex}
        data={data}
        isLoading={isLoading}
        isError={isError}
        onClose={closeSearch}
        onSelect={navigateToResult}
        onActiveIndexChange={setActiveIndex}
      />
    </div>
  );
}
