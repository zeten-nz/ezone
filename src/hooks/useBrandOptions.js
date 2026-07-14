import { useState, useEffect } from 'react';
import { productAPI } from '../services/api';

/**
 * Fetches the distinct Brand list for one equipment slot — populates the
 * Brand `Select` that gates the Product autocomplete (see
 * components/Warranty/EquipmentSection.jsx). Fetched once per equipment
 * type per mount; the list is small and changes rarely, so no debouncing
 * or refetch-on-every-keystroke is needed here (unlike useProductSearch).
 */
const useBrandOptions = (equipmentType) => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    productAPI.getBrands(equipmentType)
      .then((response) => setBrands(response.data))
      .catch(() => setBrands([]))
      .finally(() => setLoading(false));
  }, [equipmentType]);

  return { brands, loading };
};

export default useBrandOptions;
