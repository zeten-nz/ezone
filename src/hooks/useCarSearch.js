import { useState, useEffect, useRef } from 'react';
import { carAPI } from '../services/api';

const DEBOUNCE_MS = 250;

/**
 * Debounced vehicle-catalog search backing the Vehicle Name field's
 * catalog-first-with-free-text-fallback autocomplete (see
 * WarrantyFormFields.jsx). Unlike useProductSearch, there's no gating field
 * (brand) — any non-empty typed text searches immediately, and picking a
 * suggestion is never required: the caller keeps whatever was typed as
 * vehicle_name regardless of whether a catalog match was selected.
 */
const useCarSearch = (query) => {
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
      carAPI.search(query.trim())
        .then((response) => setResults(response.data))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeoutRef.current);
  }, [query]);

  return { results, loading };
};

export default useCarSearch;
