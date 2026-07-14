import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Generic searchable-select — Google-autocomplete-style. The caller owns
 * fetching (via `onQueryChange` + `results`/`loading`), so this component
 * has no knowledge of any particular API; it's reused for the warranty
 * form's product picker today and can back any future "type to search,
 * only pick from what's returned" field.
 */
const Autocomplete = ({
  label,
  placeholder,
  query,
  onQueryChange,
  results = [],
  loading = false,
  onSelect,
  getOptionLabel = (item) => item.label,
  renderOption,
  error,
  noResultsText,
  disabled = false,
}) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlighted >= 0 && results[highlighted]) {
        onSelect(results[highlighted]);
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="w-full relative" ref={containerRef}>
      {label && <label className="block text-sm font-medium text-neutral-700 mb-2">{label}</label>}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={query}
          disabled={disabled}
          onChange={(e) => {
            onQueryChange(e.target.value);
            setOpen(true);
            setHighlighted(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full pl-9 pr-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-neutral-100 disabled:cursor-not-allowed ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50'
              : 'border-neutral-300 focus:border-blue-500 focus:ring-blue-100'
          }`}
        />
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}

      {open && !disabled && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-3 text-sm text-neutral-500">{t('loadingResults')}</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-neutral-500">{noResultsText || t('noResultsFound')}</div>
          ) : (
            results.map((item, i) => (
              <button
                type="button"
                key={item.id ?? i}
                onClick={() => { onSelect(item); setOpen(false); }}
                onMouseEnter={() => setHighlighted(i)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  highlighted === i ? 'bg-blue-50 text-blue-700' : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                {renderOption ? renderOption(item) : getOptionLabel(item)}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Autocomplete;
