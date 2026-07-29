import Autocomplete from '../UI/Autocomplete';
import useEasyGasBranches from '../../hooks/useEasyGasBranches';
import { useLanguage } from '../../context/LanguageContext';

/**
 * EasyGas STAG code — free text with a live-search fallback, same
 * catalog-first-with-free-text-fallback shape as VehicleNameField.jsx.
 * Unlike that field, the search matches on EasyGas's organization NAME (an
 * admin is far more likely to recognize "01/1 EASY GAS SERVICE MCHJ" than
 * the bare code), but the value actually stored is always the real
 * stag_code, per EasyGas's own instruction to match on stag_code, never the
 * free-text branch name. An admin who already knows the code can also just
 * type/paste it directly — nothing blocks on a suggestion being picked.
 */
const EasyGasStagCodeField = ({ value, onChange, error }) => {
  const { t } = useLanguage();
  const { results, loading } = useEasyGasBranches(value);

  return (
    <Autocomplete
      label={t('easygasStagCode')}
      placeholder={t('easygasStagCodePlaceholder')}
      query={value || ''}
      onQueryChange={onChange}
      results={results}
      loading={loading}
      onSelect={(branch) => onChange(branch.stag_code)}
      getOptionLabel={(b) => `${b.stag_code} — ${b.name}`}
      error={error}
      noResultsText={t('stagCodeNotFoundHint')}
    />
  );
};

export default EasyGasStagCodeField;
