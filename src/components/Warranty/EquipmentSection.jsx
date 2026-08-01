import { useState } from 'react';
import { CheckCircle2, XCircle, Loader2, AlertTriangle, Camera, X } from 'lucide-react';
import Select from '../UI/Select';
import Autocomplete from '../UI/Autocomplete';
import Input from '../UI/Input';
import useProductSearch from '../../hooks/useProductSearch';
import useBrandOptions from '../../hooks/useBrandOptions';
import useBarcodeValidation from '../../hooks/useBarcodeValidation';
import { useLanguage } from '../../context/LanguageContext';
import { getEquipmentTypeLabel } from '../../config/equipmentCategories';
import { warrantyAPI } from '../../services/api';

const fuelTypeOptions = (t) => [
  { value: '', label: t('selectOption') },
  { value: 'LPG', label: 'LPG' },
  { value: 'CNG', label: 'CNG' },
];

// row.product is always normalized to { id, name } regardless of source —
// a fresh selection from productAPI.search ({id, category, brand, model,
// fuel_type}) or an existing warranty being edited (product_id/product_name
// from the DTO) both collapse to this one shape so the rest of this
// component never needs to know which case it's looking at.
const EquipmentRow = ({ row, fuelType, onChange, error, onApplySellerToAll, canApplySellerToAll, suggestedSeller, onUseSuggestedSeller, onDismissSuggestion }) => {
  const { t } = useLanguage();
  const { brands, loading: brandsLoading } = useBrandOptions(row.equipment_type);
  const { query, setQuery, results, loading } = useProductSearch(row.equipment_type, row.brand, fuelType);
  // Instant, read-only feedback only — the atomic claim that actually
  // enforces this happens server-side at submission time (see
  // ezone-server/services/warrantyService.js). Nothing here blocks typing.
  const barcodeCheck = useBarcodeValidation(
    row.serial_number, row.product?.id, row.equipment_type,
    row.original_serial_number, row.original_product_id
  );
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState(null);

  const brandOptions = [
    { value: '', label: brandsLoading ? t('loadingResults') : t('selectOption') },
    ...brands.map((b) => ({ value: b, label: b })),
  ];

  const handleBrandChange = (value) => {
    // Changing brand invalidates whatever product was already picked under
    // the old brand — never leave a stale product silently attached to a
    // different brand than the one now shown.
    onChange({ ...row, brand: value, product: null });
    setQuery('');
  };

  const handleSelectProduct = (product) => {
    // A different product invalidates any Manual Verification state that
    // was attached to the previous product/barcode combination too — it's
    // no longer the same claim.
    onChange({
      ...row,
      product: { id: product.id, name: `${product.brand} ${product.model || ''}`.trim() },
      manual_verification: false, seller_name: '', seller_phone: '', comment: '', manual_verification_photo_filename: null,
    });
  };

  const handleQueryChange = (value) => {
    setQuery(value);
    if (row.product) onChange({ ...row, product: null });
  };

  // Manual Verification workflow — only offered for the one failure it's
  // meant to cover. Wrong product/wrong category/inactive/not-available all
  // continue to block submission with no way around them, exactly as before.
  const canOfferManualVerification = barcodeCheck.status === 'invalid' && barcodeCheck.errorCode === 'BARCODE_NOT_FOUND';

  const handleEnableManualVerification = () => onChange({ ...row, manual_verification: true });
  const handleDisableManualVerification = () => onChange({
    ...row, manual_verification: false, seller_name: '', seller_phone: '', comment: '', manual_verification_photo_filename: null,
  });

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // always reset so re-selecting the same file re-fires onChange
    if (!file) return;
    setUploadingPhoto(true);
    setPhotoError(null);
    try {
      const response = await warrantyAPI.uploadEquipmentPhoto(file);
      onChange({ ...row, manual_verification_photo_filename: response.data.filename });
    } catch (err) {
      setPhotoError(err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <div className="p-4 rounded-lg border border-neutral-200 space-y-4">
      <p className="text-sm font-semibold text-neutral-900">{getEquipmentTypeLabel(t, row.equipment_type)}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <Select
          label={t('brand')}
          value={row.brand}
          onChange={(e) => handleBrandChange(e.target.value)}
          options={brandOptions}
        />
        <Autocomplete
          label={t('product')}
          placeholder={row.brand ? t('productSearchPlaceholder') : t('selectBrandFirst')}
          query={row.product ? row.product.name : query}
          onQueryChange={handleQueryChange}
          results={results}
          loading={loading}
          onSelect={handleSelectProduct}
          getOptionLabel={(p) => `${p.brand} ${p.model || ''}`.trim()}
          // Manual Verification workflow: once enabled, a product is always
          // already selected (see canOfferManualVerification below), so a
          // validation error at this point is never "product missing" — it's
          // "seller info missing," shown near the seller fields instead (see
          // valSellerInfoRequired below) rather than misleadingly under Product.
          error={row.manual_verification ? undefined : error}
          disabled={!row.brand}
        />
        <div>
          <Input
            label={t('serialVinNumber')}
            placeholder={row.product ? t('barcodeScanOrType') : t('selectProductFirst')}
            value={row.serial_number}
            onChange={(e) => onChange({ ...row, serial_number: e.target.value })}
            disabled={!row.product}
          />
          {!row.manual_verification && (
            <>
              {barcodeCheck.status === 'checking' && (
                <p className="flex items-center gap-1 text-xs text-neutral-500 mt-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> {t('barcodeChecking')}
                </p>
              )}
              {barcodeCheck.status === 'valid' && barcodeCheck.product && (
                <p className="flex items-center gap-1 text-xs text-green-600 mt-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {barcodeCheck.product.brand} {barcodeCheck.product.model || ''}
                </p>
              )}
              {barcodeCheck.status === 'invalid' && (
                <>
                  <p className="flex items-center gap-1 text-xs text-red-600 mt-1.5">
                    <XCircle className="w-3.5 h-3.5" /> {barcodeCheck.error}
                  </p>
                  {canOfferManualVerification && (
                    <button
                      type="button"
                      onClick={handleEnableManualVerification}
                      className="text-xs text-blue-600 hover:text-blue-700 underline underline-offset-2 mt-1.5"
                    >
                      {t('enableManualVerification')}
                    </button>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {row.manual_verification && (
        <div className="pt-4 border-t border-neutral-100 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <p className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> {t('manualVerificationModeLabel')}
            </p>
            <button
              type="button"
              onClick={handleDisableManualVerification}
              className="text-xs text-neutral-500 hover:text-neutral-700 underline underline-offset-2 flex-shrink-0"
            >
              {t('disableManualVerification')}
            </button>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          {suggestedSeller && (
            <div className="p-3 rounded-lg border border-blue-200 bg-blue-50 space-y-2">
              <p className="text-sm font-medium text-blue-900">{t('reuseSellerSuggestionTitle')}</p>
              <div className="text-xs text-blue-800 space-y-0.5">
                <p>{t('sellerName')}: {suggestedSeller.seller_name}</p>
                <p>{t('sellerPhone')}: {suggestedSeller.seller_phone}</p>
                {suggestedSeller.comment && <p>{t('verificationComment')}: {suggestedSeller.comment}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onUseSuggestedSeller}
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  {t('useSameSellerAction')}
                </button>
                <button
                  type="button"
                  onClick={onDismissSuggestion}
                  className="px-3 py-1.5 text-xs font-medium rounded-md border border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  {t('enterDifferentSellerAction')}
                </button>
              </div>
            </div>
          )}
          {canApplySellerToAll && (row.seller_name || row.seller_phone || row.comment) && (
            <button
              type="button"
              onClick={onApplySellerToAll}
              className="text-xs text-blue-600 hover:text-blue-700 underline underline-offset-2"
            >
              {t('applySellerToAllLabel')}
            </button>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label={t('sellerName')}
              value={row.seller_name}
              onChange={(e) => onChange({ ...row, seller_name: e.target.value })}
              required
            />
            <Input
              label={t('sellerPhone')}
              type="tel"
              value={row.seller_phone}
              onChange={(e) => onChange({ ...row, seller_phone: e.target.value })}
              required
            />
            <Input
              label={t('verificationComment')}
              value={row.comment}
              onChange={(e) => onChange({ ...row, comment: e.target.value })}
              required
            />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-700 mb-2">{t('verificationPhotoOptional')}</p>
            {row.manual_verification_photo_filename ? (
              <div className="flex items-center gap-2 text-xs text-green-600">
                <CheckCircle2 className="w-3.5 h-3.5" /> {t('photoAttached')}
                <button
                  type="button"
                  onClick={() => onChange({ ...row, manual_verification_photo_filename: null })}
                  className="text-neutral-400 hover:text-red-600"
                  title={t('removePhoto')}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer">
                {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                {uploadingPhoto ? t('uploadingPhoto') : t('attachPhoto')}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoSelect} disabled={uploadingPhoto} />
              </label>
            )}
            {photoError && <p className="text-xs text-red-600 mt-1.5">{photoError}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * The Equipment section: one shared Fuel Type for the whole installation
 * (not one per row — a vehicle conversion has exactly one fuel type), above
 * the 4 fixed equipment slots (Reducer/Cylinder/Controller/Injector Rail).
 * Each row is Brand -> Product -> Serial/VIN; Product is a catalog
 * autocomplete scoped by both the row's Brand and the shared Fuel Type.
 * `equipment` is always exactly 4 rows (see config/equipmentCategories.js's
 * EMPTY_EQUIPMENT_ROWS); `onChange` replaces the whole array.
 */
const EquipmentSection = ({ fuelType, onFuelTypeChange, equipment, onChange, errors = {}, fuelTypeError }) => {
  const { t } = useLanguage();

  // "Reuse last seller information" — separate from, and coexists with,
  // "Apply to all" below. lastUsedSeller is a live mirror of whichever
  // Manual Verification row's seller fields were most recently touched
  // (never the photo), so a suggestion always reflects the actual most
  // recent seller regardless of which of the 4 fixed rows it came from.
  // dismissedSuggestions (keyed by the row's own equipment_type, already a
  // stable unique id) tracks "never show again for this row" once the
  // installer picks either button — permanent for the rest of this form
  // session, not reset by later edits to that row.
  const [lastUsedSeller, setLastUsedSeller] = useState(null);
  const [dismissedSuggestions, setDismissedSuggestions] = useState({});

  const handleRowChange = (index, updatedRow) => {
    onChange(equipment.map((row, i) => (i === index ? updatedRow : row)));
    if (updatedRow.manual_verification && (updatedRow.seller_name || updatedRow.seller_phone || updatedRow.comment)) {
      setLastUsedSeller({
        seller_name: updatedRow.seller_name,
        seller_phone: updatedRow.seller_phone,
        comment: updatedRow.comment,
      });
    }
  };

  const handleUseSuggestedSeller = (index) => {
    handleRowChange(index, { ...equipment[index], ...lastUsedSeller });
    setDismissedSuggestions((prev) => ({ ...prev, [equipment[index].equipment_type]: true }));
  };

  const handleDismissSuggestion = (index) => {
    setDismissedSuggestions((prev) => ({ ...prev, [equipment[index].equipment_type]: true }));
  };

  // Manual Verification workflow — lets one seller's info (name/phone/
  // comment, never the photo — a photo documents one specific item/receipt,
  // not interchangeable across rows) be copied from the row the installer
  // just filled in onto every OTHER row still open for manual verification,
  // instead of retyping it per equipment type. Every row stays independently
  // editable afterwards — this only seeds the fields, it doesn't link them.
  const manualVerificationCount = equipment.filter((row) => row.manual_verification).length;
  const handleApplySellerToAll = (sourceIndex) => {
    const source = equipment[sourceIndex];
    onChange(equipment.map((row, i) => (
      i !== sourceIndex && row.manual_verification
        ? { ...row, seller_name: source.seller_name, seller_phone: source.seller_phone, comment: source.comment }
        : row
    )));
  };

  return (
    <div className="space-y-4">
      <Select
        label={t('fuelType')}
        value={fuelType || ''}
        onChange={(e) => onFuelTypeChange(e.target.value || null)}
        options={fuelTypeOptions(t)}
        error={fuelTypeError}
        required
      />
      {equipment.map((row, index) => (
        <EquipmentRow
          key={row.equipment_type}
          row={row}
          fuelType={fuelType}
          onChange={(updatedRow) => handleRowChange(index, updatedRow)}
          error={errors[row.equipment_type]}
          canApplySellerToAll={manualVerificationCount > 1}
          onApplySellerToAll={() => handleApplySellerToAll(index)}
          suggestedSeller={
            row.manual_verification &&
            !row.seller_name && !row.seller_phone && !row.comment &&
            lastUsedSeller &&
            !dismissedSuggestions[row.equipment_type]
              ? lastUsedSeller
              : null
          }
          onUseSuggestedSeller={() => handleUseSuggestedSeller(index)}
          onDismissSuggestion={() => handleDismissSuggestion(index)}
        />
      ))}
    </div>
  );
};

export default EquipmentSection;
