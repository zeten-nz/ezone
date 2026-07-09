import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/** Windowed page list: 1 … (current-1) current (current+1) … last — never floods the bar past ~7 buttons. */
function buildPageWindow(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const withGaps = [];
  sorted.forEach((page, i) => {
    if (i > 0 && page - sorted[i - 1] > 1) withGaps.push('gap');
    withGaps.push(page);
  });
  return withGaps;
}

const Pagination = ({ currentPage, totalPages, totalItems, pageSize, hasNext, hasPrevious, onPageChange, itemsLabel }) => {
  const { t } = useLanguage();
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-100 pt-4">
      <p className="text-sm text-neutral-500">
        {start}–{end} <span className="text-neutral-400">/</span> {totalItems} {itemsLabel}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevious}
          aria-label={t('previousPage')}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {buildPageWindow(currentPage, totalPages).map((p, i) =>
          p === 'gap' ? (
            <span key={`gap-${i}`} className="w-8 h-8 flex items-center justify-center text-neutral-400 text-sm">&hellip;</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              aria-current={p === currentPage ? 'page' : undefined}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                p === currentPage ? 'bg-blue-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
          aria-label={t('nextPage')}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
