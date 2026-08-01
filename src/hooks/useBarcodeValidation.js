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
 *
 * `originalSerialNumber`/`originalProductId` (only ever set when editing an
 * existing warranty — see config/equipmentCategories.js's toEditableEquipment)
 * let this hook recognize "this row is exactly what's already saved" and
 * skip the live availability check entirely, instead of asking the server
 * whether an already-installed-by-THIS-warranty barcode is "available" —
 * which it correctly isn't, but that's not a question this row needs
 * answered. This mirrors the same unchanged-row distinction
 * warrantyService.updateWarrantyForm already makes before ever touching
 * inventory; nothing about the authoritative server-side check changes.
 */
const useBarcodeValidation = (barcode, productId, equipmentType, originalSerialNumber, originalProductId) => {
  const [status, setStatus] = useState('idle'); // idle | checking | valid | invalid
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  // Manual Verification workflow: EquipmentRow needs the precise reason this
  // barcode failed, not just a display message — the "Enable manual
  // verification" option only makes sense for BARCODE_NOT_FOUND specifically,
  // never for BARCODE_WRONG_PRODUCT/BARCODE_WRONG_CATEGORY/
  // BARCODE_PRODUCT_INACTIVE/BARCODE_NOT_AVAILABLE, which must keep blocking
  // submission exactly as before. AppError already carries this — it just
  // wasn't surfaced by this hook until now.
  const [errorCode, setErrorCode] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!barcode || !barcode.trim() || !productId) {
      setStatus('idle');
      setProduct(null);
      setError(null);
      setErrorCode(null);
      return undefined;
    }

    const isUnchangedFromSaved =
      originalSerialNumber != null && barcode.trim() === originalSerialNumber && productId === originalProductId;
    if (isUnchangedFromSaved) {
      setStatus('idle');
      setProduct(null);
      setError(null);
      setErrorCode(null);
      return undefined;
    }

    setStatus('checking');
    timeoutRef.current = setTimeout(() => {
      inventoryAPI.validateBarcode(barcode.trim(), productId, equipmentType)
        .then((response) => {
          setStatus('valid');
          setProduct(response.data.product);
          setError(null);
          setErrorCode(null);
        })
        .catch((err) => {
          setStatus('invalid');
          setError(err.message);
          setErrorCode(err.errorCode);
          setProduct(null);
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeoutRef.current);
  }, [barcode, productId, equipmentType, originalSerialNumber, originalProductId]);

  return { status, product, error, errorCode };
};

export default useBarcodeValidation;
