import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Select from '../UI/Select';
import Autocomplete from '../UI/Autocomplete';
import Input from '../UI/Input';
import useProductSearch from '../../hooks/useProductSearch';
import useBrandOptions from '../../hooks/useBrandOptions';
import useBarcodeValidation from '../../hooks/useBarcodeValidation';
import { useLanguage } from '../../context/LanguageContext';
import { getEquipmentTypeLabel } from '../../config/equipmentCategories';

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
const EquipmentRow = ({ row, fuelType, onChange, error }) => {
  const { t } = useLanguage();
  const { brands, loading: brandsLoading } = useBrandOptions(row.equipment_type);
  const { query, setQuery, results, loading } = useProductSearch(row.equipment_type, row.brand, fuelType);
  // Instant, read-only feedback only — the atomic claim that actually
  // enforces this happens server-side at submission time (see
  // ezone-server/services/warrantyService.js). Nothing here blocks typing.
  const barcodeCheck = useBarcodeValidation(row.serial_number, row.product?.id, row.equipment_type);

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
    onChange({ ...row, product: { id: product.id, name: `${product.brand} ${product.model || ''}`.trim() } });
  };

  const handleQueryChange = (value) => {
    setQuery(value);
    if (row.product) onChange({ ...row, product: null });
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
          error={error}
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
            <p className="flex items-center gap-1 text-xs text-red-600 mt-1.5">
              <XCircle className="w-3.5 h-3.5" /> {barcodeCheck.error}
            </p>
          )}
        </div>
      </div>
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

  const handleRowChange = (index, updatedRow) => {
    onChange(equipment.map((row, i) => (i === index ? updatedRow : row)));
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
        />
      ))}
    </div>
  );
};

export default EquipmentSection;
