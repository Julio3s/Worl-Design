import { ChevronLeft, ChevronRight } from 'lucide-react';

function PageButton({ active, children, ...props }) {
  return (
    <button
      type="button"
      className={[
        'inline-flex min-w-10 items-center justify-center rounded-full border px-3 py-2 text-sm font-semibold transition active:scale-[0.98]',
        active
          ? 'border-accent bg-accent text-white'
          : 'border-[#E0DBD5] bg-white text-text-dark hover:border-accent hover:text-accent',
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}

export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = [];
  for (let page = 1; page <= totalPages; page += 1) {
    pages.push(page);
  }

  return (
    <nav className="flex flex-wrap items-center gap-2" aria-label="Pagination">
      <PageButton
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </PageButton>

      {pages.map((page) => (
        <PageButton
          key={page}
          active={page === currentPage}
          onClick={() => onPageChange(page)}
        >
          {page}
        </PageButton>
      ))}

      <PageButton
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </PageButton>
    </nav>
  );
}
