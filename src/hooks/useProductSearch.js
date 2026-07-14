import { useState, useEffect, useRef } from 'react';
import { productAPI } from '../services/api';

const DEBOUNCE_MS = 250;

/**
 * Debounced product-catalog search scoped to one equipment slot's allowed
 * categories (see ezone-server/config/equipmentCategories.js), the
 * installer's chosen Brand, and the warranty's single installation-wide
 * fuel type. Backs the warranty form's Product autocomplete — see
 * components/Warranty/EquipmentSection.jsx. Requires `brand` — search is
 * meaningless before a Brand is chosen (mirrors the empty-query no-op
 * below), so the Product field stays effectively empty/disabled until then.
 */
const useProductSearch = (equipmentType, brand, fuelType) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!query.trim() || !brand) {
      setResults([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    timeoutRef.current = setTimeout(() => {
      productAPI.search(query.trim(), equipmentType, brand, fuelType)
        .then((response) => setResults(response.data))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeoutRef.current);
  }, [query, equipmentType, brand, fuelType]);

  return { query, setQuery, results, loading };
};

export default useProductSearch;
