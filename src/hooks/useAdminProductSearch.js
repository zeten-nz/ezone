import { useState, useEffect, useRef } from 'react';
import { productAPI } from '../services/api';

const DEBOUNCE_MS = 250;

/**
 * Debounced search over the full admin product list (any category, not
 * scoped to one warranty equipment slot like useProductSearch) — backs the
 * Inventory CSV import picker, where any active catalog product is valid.
 */
const useAdminProductSearch = (query) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!query || !query.trim()) {
      setResults([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    timeoutRef.current = setTimeout(() => {
      productAPI.getAll(1, 10, query.trim())
        .then((response) => setResults(response.data.data))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeoutRef.current);
  }, [query]);

  return { results, loading };
};

export default useAdminProductSearch;
