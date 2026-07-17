import { useState, useEffect, useRef } from 'react';
import { inventoryAPI } from '../services/api';

const DEBOUNCE_MS = 400;

/**
 * Debounced, read-only "is this barcode currently usable" check — instant
 * feedback only, never claims anything (the actual claim happens atomically
 * server-side inside warranty create/update, see
 * ezone-server/services/warrantyService.js). Shares its validation rules
 * with that authoritative server-side check (both call
 * inventoryService.validateBarcode), so what the installer sees here always
 * matches what submission will actually enforce.
 */
const useBarcodeValidation = (barcode, productId, equipmentType) => {
  const [status, setStatus] = useState('idle'); // idle | checking | valid | invalid
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!barcode || !barcode.trim() || !productId) {
      setStatus('idle');
      setProduct(null);
      setError(null);
      return undefined;
    }

    setStatus('checking');
    timeoutRef.current = setTimeout(() => {
      inventoryAPI.validateBarcode(barcode.trim(), productId, equipmentType)
        .then((response) => {
          setStatus('valid');
          setProduct(response.data.product);
          setError(null);
        })
        .catch((err) => {
          setStatus('invalid');
          setError(err.message);
          setProduct(null);
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeoutRef.current);
  }, [barcode, productId, equipmentType]);

  return { status, product, error };
};

export default useBarcodeValidation;
