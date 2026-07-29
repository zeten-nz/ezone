import { useState, useEffect } from 'react';
import { branchAPI } from '../services/api';

const MAX_RESULTS = 20;

/**
 * Backs the branch edit form's EasyGas STAG-code lookup (see
 * BranchFormModal.jsx). Unlike useCarSearch/useProductSearch, this fetches
 * EasyGas's full branch list ONCE (it's a small, real list — ~259 rows, not
 * a per-keystroke server search) and filters client-side by name as the
 * admin types, since there's no natural key linking our branch names to
 * EasyGas's own organization names.
 */
const useEasyGasBranches = (query) => {
  const [all, setAll] = useState(null); // null = not yet fetched
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (all !== null) return;
    setLoading(true);
    branchAPI.getEasyGasBranches()
      .then((response) => setAll(response.data))
      .catch(() => setAll([]))
      .finally(() => setLoading(false));
  }, [all]);

  const trimmed = query?.trim().toLowerCase();
  const results = !trimmed || !all
    ? []
    : all.filter((b) => b.name.toLowerCase().includes(trimmed) || b.stag_code.toLowerCase().includes(trimmed)).slice(0, MAX_RESULTS);

  return { results, loading };
};

export default useEasyGasBranches;
