export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const windowSize = 5;
  let firstPage = Math.max(1, page - Math.floor(windowSize / 2));
  const lastPage = Math.min(totalPages, firstPage + windowSize - 1);
  firstPage = Math.max(1, lastPage - windowSize + 1);

  const pages: number[] = [];

  for (let p = firstPage; p <= lastPage; p += 1) {
    pages.push(p);
  }

  const buttonClass =
    'min-w-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm transition-colors hover:border-indigo-600 hover:text-indigo-600 disabled:opacity-45 disabled:hover:border-slate-200 disabled:hover:text-slate-900';

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-1"
      aria-label="Pagination"
    >
      <button
        type="button"
        className={buttonClass}
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        ‹ Prev
      </button>

      {firstPage > 1 && (
        <span className="px-1 text-slate-400">…</span>
      )}

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={`${buttonClass} ${
            p === page
              ? 'border-indigo-600 bg-indigo-600 text-white hover:text-white'
              : ''
          }`}
          onClick={() => onPageChange(p)}
          aria-current={p === page ? 'page' : undefined}
        >
          {p}
        </button>
      ))}

      {lastPage < totalPages && (
        <span className="px-1 text-slate-400">…</span>
      )}

      <button
        type="button"
        className={buttonClass}
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        Next ›
      </button>
    </nav>
  );
}