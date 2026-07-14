import Select from '../UI/Select';
import Autocomplete from '../UI/Autocomplete';
import Input from '../UI/Input';
import useProductSearch from '../../hooks/useProductSearch';
import useBrandOptions from '../../hooks/useBrandOptions';
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
        <Input
          label={t('serialVinNumber')}
          value={row.serial_number}
          onChange={(e) => onChange({ ...row, serial_number: e.target.value })}
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
