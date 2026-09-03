import { Plus } from 'lucide-react';
import Select from '../UI/Select';
import Autocomplete from '../UI/Autocomplete';
import Input from '../UI/Input';
import Button from '../UI/Button';
import useProductSearch from '../../hooks/useProductSearch';
import useBrandOptions from '../../hooks/useBrandOptions';
import { useLanguage } from '../../context/LanguageContext';
import { getEquipmentTypeLabel, isTypedCylinderRow } from '../../config/equipmentCategories';

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
//
// NOTE (temporary product decision): the serial number is a plain input —
// it is no longer checked against the local inventory/barcode system, and
// the Manual Verification fallback UI is removed from the active workflow.
// The value is still required server-side for catalog products and is sent
// to EasyGas as the component's serial_number.
const EquipmentRow = ({ row, fuelType, onChange, error }) => {
  const { t } = useLanguage();
  const { brands, loading: brandsLoading } = useBrandOptions(row.equipment_type);
  const { query, setQuery, results, loading } = useProductSearch(row.equipment_type, row.brand, fuelType);
  const isCylinder = row.equipment_type === 'CYLINDER';

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
    // Picking a catalog product replaces any existing typed-cylinder identity.
    onChange({
      ...row,
      product: { id: product.id, name: `${product.brand} ${product.model || ''}`.trim() },
      brand_name: null,
      model: null,
    });
  };

  const handleQueryChange = (value) => {
    setQuery(value);
    if (row.product) onChange({ ...row, product: null });
  };

  // ── Optional cylinder, OFF state (Beta-3): a quiet dashed card with an
  // explicit add action — no validation errors, nothing submitted. ──
  if (isCylinder && row.enabled === false) {
    return (
      <div className="p-4 rounded-lg border border-dashed border-neutral-300 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-neutral-900">
            {getEquipmentTypeLabel(t, row.equipment_type)}
            <span className="ml-2 text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500">{t('optionalLabel')}</span>
          </p>
          <p className="text-xs text-neutral-500 mt-0.5">{t('cylinderNotAdded')}</p>
        </div>
        <Button type="button" size="sm" variant="outline" icon={Plus} onClick={() => onChange({ ...row, enabled: true })}>
          {t('addCylinderAction')}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg border border-neutral-200 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-neutral-900">
          {getEquipmentTypeLabel(t, row.equipment_type)}
          {isCylinder && (
            <span className="ml-2 text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500">{t('optionalLabel')}</span>
          )}
        </p>
        {isCylinder && (
          // Removal intent is explicit: turning the cylinder OFF clears any
          // entered/typed data immediately (re-enabling starts fresh), and
          // saving the form then deletes the stored row server-side.
          <button
            type="button"
            onClick={() => onChange({ ...row, enabled: false, product: null, serial_number: '', brand: '', brand_name: null, model: null })}
            className="text-xs text-neutral-500 hover:text-red-600 underline underline-offset-2 flex-shrink-0"
          >
            {t('removeCylinderAction')}
          </button>
        )}
      </div>
      {isTypedCylinderRow(row) && (
        // An existing typed/manual cylinder round-trips unchanged — shown
        // here so the admin knows what is kept; picking a catalog product
        // replaces it, removing the cylinder deletes it.
        <p className="text-xs text-neutral-500 -mt-2">
          {t('typedCylinderInfo')}: <span className="font-medium text-neutral-700">{[row.brand_name, row.model].filter(Boolean).join(' ')}</span>
        </p>
      )}
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
        <Input
          label={t('serialVinNumber')}
          placeholder={row.product ? t('barcodeScanOrType') : t('selectProductFirst')}
          value={row.serial_number}
          onChange={(e) => onChange({ ...row, serial_number: e.target.value })}
          disabled={!row.product}
        />
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
