import { useMemo, useState } from 'react';
import Autocomplete from './Autocomplete';
import { useLanguage } from '../../context/LanguageContext';
import { filterBranches } from '../../utils/branchSearch';

/**
 * Reusable searchable branch selector (Beta-1) — replaces the unusable
 * ~260-option native <select>. Built on the existing UI/Autocomplete
 * (keyboard nav, Enter to select, Escape/click-outside to close); filtering
 * is CLIENT-SIDE (utils/branchSearch.js: code/name/region/district,
 * case-insensitive) — no backend search needed at this branch count.
 *
 * `value` is the selected branch OBJECT (or null = none/unassigned);
 * `onChange` receives the branch object or null. Editing the text after a
 * selection deselects (same convention as the product Autocomplete).
 *
 * `includeInactive` (default false): new assignments/imports/transfers are
 * active-only; pass true where existing semantics legitimately include
 * inactive branches (e.g. editing a user already assigned to one).
 * `allowUnassigned` only affects the placeholder — the empty state IS
 * "unassigned"; callers that require a branch validate `value` themselves.
 */
const BranchSelect = ({
  label,
  branches = [],
  value = null,
  onChange,
  loading = false,
  disabled = false,
  includeInactive = false,
  allowUnassigned = false,
  placeholder,
  error,
}) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');

  const results = useMemo(
    () => filterBranches(branches, query, { includeInactive }),
    [branches, query, includeInactive]
  );

  const handleQueryChange = (q) => {
    setQuery(q);
    if (value) onChange?.(null); // typing over a selection deselects it
  };

  return (
    <Autocomplete
      label={label}
      placeholder={placeholder || (allowUnassigned ? t('branchSearchOptionalPlaceholder') : t('branchSearchPlaceholder'))}
      query={value ? `${value.code} — ${value.name}` : query}
      onQueryChange={handleQueryChange}
      results={results}
      loading={loading}
      onSelect={(branch) => {
        onChange?.(branch);
        setQuery('');
      }}
      getOptionLabel={(b) => `${b.code} ${b.name}`}
      renderOption={(b) => (
        <span className="block min-w-0">
          <span className="font-mono text-xs font-semibold text-blue-700">{b.code}</span>
          <span className="block truncate font-medium">{b.name}</span>
          {(b.region || b.district) && (
            <span className="block text-xs text-neutral-400 truncate">
              {[b.region, b.district].filter(Boolean).join(' • ')}
            </span>
          )}
        </span>
      )}
      error={error}
      disabled={disabled}
      noResultsText={t('noBranchesFound')}
    />
  );
};

export default BranchSelect;
