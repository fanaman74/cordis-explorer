interface PaginationProps {
  page: number;
  pageSize: number;
  resultCount: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, pageSize, resultCount, onPageChange }: PaginationProps) {
  const hasMore = resultCount === pageSize;

  return (
    <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
      <span className="text-sm text-[var(--color-text-muted)]">
        Page {page}
        {resultCount > 0 && ` \u00B7 Showing ${(page - 1) * pageSize + 1}\u2013${(page - 1) * pageSize + resultCount}`}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 text-sm rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-light)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Prev
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasMore}
          className="px-3 py-1.5 text-sm rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-light)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
}
