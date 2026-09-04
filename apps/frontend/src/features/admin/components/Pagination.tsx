'use client';

type PaginationProps = {
  page: number;
  pages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, pages, total, pageSize, onPageChange }: PaginationProps) {
  if (pages <= 1) {
    return (
      <div className="admin-pagination admin-pagination-compact">
        <span>
          Showing {total} order{total === 1 ? '' : 's'}
        </span>
      </div>
    );
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <nav className="admin-pagination" aria-label="Orders pagination">
      <span className="admin-pagination-summary">
        Showing {start}–{end} of {total}
      </span>
      <div className="admin-pagination-controls">
        <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </button>
        <span className="admin-pagination-page">
          Page {page} of {pages}
        </span>
        <button type="button" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
          Next
        </button>
      </div>
    </nav>
  );
}
