import { useMemo, useState } from 'react';
import Autocomplete from './Autocomplete';
import { useLanguage } from '../../context/LanguageContext';
import { filterBranches } from '../../utils/branchSearch';
import { getBranchTypeLabel } from '../../config/branchTypes';

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
 *
 * Beta-2: `typeFilter` ('ALL' | 'EASYGAS' | 'STAG_SERVICE' |
 * 'OTHER_SERVICE' | 'UNCLASSIFIED') narrows results by the persisted
 * branch_type and combines with the text search; each result row shows a
 * TEXT type label (never color-only). branch_type NULL is a valid,
 * selectable state — completely independent of is_active.
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
  typeFilter = 'ALL',
  placeholder,
  error,
}) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');

  const results = useMemo(
    () => filterBranches(branches, query, { includeInactive, type: typeFilter }),
    [branches, query, includeInactive, typeFilter]
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
          <span className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs font-semibold text-blue-700">{b.code}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${b.branch_type ? 'bg-neutral-100 text-neutral-600' : 'bg-neutral-50 text-neutral-400'}`}>
              {getBranchTypeLabel(t, b.branch_type)}
            </span>
          </span>
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
