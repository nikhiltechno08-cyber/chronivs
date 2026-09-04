'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Loader2 } from 'lucide-react';

import { detectSearchIntent, getSearchIntentHint } from '../detect-search-intent';
import type { AdminSearchResponse, AdminSearchResultItem } from '../types';
import { flattenSearchResults, SearchResultCard } from './SearchResultCard';

type SearchModalProps = {
  open: boolean;
  query: string;
  activeIndex: number;
  data?: AdminSearchResponse;
  isLoading: boolean;
  isError: boolean;
  onClose: () => void;
  onSelect: (item: AdminSearchResultItem) => void;
  onActiveIndexChange: (index: number) => void;
};

export function SearchModal({
  open,
  query,
  activeIndex,
  data,
  isLoading,
  isError,
  onClose,
  onSelect,
  onActiveIndexChange,
}: SearchModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const trimmed = query.trim();
  const intent = detectSearchIntent(trimmed);
  const intentHint = getSearchIntentHint(intent);
  const flatResults = useMemo(() => flattenSearchResults(data?.groups ?? []), [data?.groups]);
  const showEmpty = trimmed.length >= 2 && !isLoading && !isError && flatResults.length === 0;
  const showPrompt = trimmed.length < 2;

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || flatResults.length === 0) {
      return;
    }

    const activeItem = flatResults[activeIndex];
    if (!activeItem) {
      return;
    }

    const node = panelRef.current?.querySelector(`[data-search-index="${activeIndex}"]`);
    node?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, flatResults, open]);

  if (!open) {
    return null;
  }

  let resultIndex = -1;

  return (
    <div className="admin-search-modal-backdrop" role="presentation">
      <div
        ref={panelRef}
        className="admin-search-modal"
        role="listbox"
        aria-label="Global admin search results"
      >
        <div className="admin-search-modal-header">
          <div>
            <p className="admin-search-modal-kicker">Global search</p>
            {intentHint ? <p className="admin-search-modal-hint">{intentHint}</p> : null}
          </div>
          <div className="admin-search-modal-meta">
            {isLoading ? (
              <span className="admin-search-modal-loading">
                <Loader2 aria-hidden="true" className="is-spinning" />
                Searching…
              </span>
            ) : null}
            {!isLoading && data ? <span>{data.total} result{data.total === 1 ? '' : 's'}</span> : null}
          </div>
        </div>

        {showPrompt ? (
          <div className="admin-search-modal-empty">
            <p>Type at least 2 characters to search orders, customers, experiences, and payments.</p>
          </div>
        ) : null}

        {isError ? (
          <div className="admin-search-modal-empty" role="alert">
            <p>Unable to load search results. Please try again.</p>
          </div>
        ) : null}

        {showEmpty ? (
          <div className="admin-search-modal-empty">
            <p>No matching results.</p>
          </div>
        ) : null}

        {!showPrompt && !showEmpty && !isError && data?.groups.length ? (
          <div className="admin-search-modal-groups">
            {data.groups.map((group) =>
              group.items.length ? (
                <section key={group.entityType} className="admin-search-modal-group">
                  <h3>{group.label}</h3>
                  <div className="admin-search-modal-group-list">
                    {group.items.map((item) => {
                      resultIndex += 1;
                      const currentIndex = resultIndex;
                      return (
                        <div key={`${item.entityType}-${item.referenceId}`} data-search-index={currentIndex}>
                          <SearchResultCard
                            item={item}
                            active={currentIndex === activeIndex}
                            onSelect={onSelect}
                            onHover={() => onActiveIndexChange(currentIndex)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </section>
              ) : null,
            )}
          </div>
        ) : null}

        <div className="admin-search-modal-footer">
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> navigate
          </span>
          <span>
            <kbd>Enter</kbd> open
          </span>
          <span>
            <kbd>Esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
}
