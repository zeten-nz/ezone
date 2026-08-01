import Autocomplete from '../UI/Autocomplete';
import useCarSearch from '../../hooks/useCarSearch';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Vehicle Name — catalog-first with free-text fallback. Backed by the local
 * car catalog (see ezone-server/config/database.js's `cars` table, admin-
 * managed via carRepository.js): typing searches it, but nothing ever blocks
 * on a match — whatever text is typed is saved as vehicle_name regardless of
 * whether a suggestion was picked. Picking one additionally sets car_id
 * (normalizing vehicle_name to the catalog's own "brand model" string);
 * editing the text afterward clears car_id again, since the typed value may
 * no longer match what was picked.
 */
const VehicleNameField = ({ value, onChange, error }) => {
  const { t } = useLanguage();
  const { results, loading } = useCarSearch(value);

  const handleQueryChange = (text) => {
    onChange({ vehicle_name: text, car_id: null });
  };

  const handleSelect = (car) => {
    onChange({ vehicle_name: `${car.brand} ${car.model}`.trim(), car_id: car.id });
  };

  return (
    <Autocomplete
      label={t('vehicleName')}
      placeholder={t('vehicleNamePlaceholder')}
      query={value}
      onQueryChange={handleQueryChange}
      results={results}
      loading={loading}
      onSelect={handleSelect}
      getOptionLabel={(c) => `${c.brand} ${c.model}`.trim()}
      error={error}
      noResultsText={t('vehicleNotInCatalogHint')}
    />
  );
};

export default VehicleNameField;
