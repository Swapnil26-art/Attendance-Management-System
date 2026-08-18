import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ page, totalPages, total, onPageChange, limit }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 sm:flex-row">
      <p className="text-sm text-gray-600">
        Showing{' '}
        <span className="font-medium text-gray-900">
          {(page - 1) * limit + 1}–{Math.min(page * limit, total)}
        </span>{' '}
        of <span className="font-medium text-gray-900">{total}</span> records
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="rounded-lg border border-gray-300 bg-white p-2 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Previous page"
        >
          <FiChevronLeft className="h-4 w-4" />
        </button>

        {start > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                page === 1
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              1
            </button>
            {start > 2 && <span className="px-1 text-gray-400">…</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              p === page
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {p}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-1 text-gray-400">…</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="rounded-lg border border-gray-300 bg-white p-2 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Next page"
        >
          <FiChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;