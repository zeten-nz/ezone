import { Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { EQUIPMENT_SERIAL_RULES, SERIAL_MAX_LENGTH } from '../../config/equipmentSerialRules';
import { addSerial, removeSerial } from '../../utils/equipmentSerials';

const SerialInputs = ({ type, serials, onChange, disabled }) => {
  const { t } = useLanguage();
  const rule = EQUIPMENT_SERIAL_RULES[type];
  const multiple = rule.max !== 1;
  const atMax = rule.max != null && serials.length >= rule.max;
  return (
    <div className="space-y-2 min-w-0">
      <p className="text-sm font-medium text-neutral-700">{t(multiple ? 'serialNumbers' : 'serialVinNumber')}</p>
      {serials.map((serial, index) => (
        <div key={index} className="flex items-center gap-2 min-w-0">
          <label className="flex items-center gap-2 flex-1 min-w-0">
            <span className={multiple ? 'text-xs text-neutral-500' : 'sr-only'}>{index + 1}.</span>
            <input
              aria-label={`${t('serialVinNumber')} ${index + 1}`}
              className="w-full min-w-0 rounded-lg border border-neutral-300 px-3 py-2.5 text-sm disabled:bg-neutral-50"
              value={serial}
              maxLength={SERIAL_MAX_LENGTH}
              disabled={disabled}
              onChange={(event) => onChange(serials.map((value, i) => i === index ? event.target.value : value))}
            />
          </label>
          {multiple && <button type="button" aria-label={`${t('removeSerial')} ${index + 1}`} disabled={disabled || serials.length <= 1}
            className="p-3 rounded-lg text-neutral-500 hover:text-red-600 disabled:opacity-30 shrink-0"
            onClick={() => onChange(removeSerial(serials, index))}><Trash2 className="w-4 h-4" /></button>}
        </div>
      ))}
      {multiple && <button type="button" disabled={disabled || atMax} onClick={() => onChange(addSerial(type, serials))}
        className="inline-flex items-center gap-2 min-h-11 px-3 py-2 rounded-lg border border-neutral-300 text-sm disabled:opacity-40">
        <Plus className="w-4 h-4" />{t('addSerial')}
      </button>}
      {multiple && atMax && <p className="text-xs text-neutral-500">{t('serialInjectorMax').replace('{max}', rule.max)}</p>}
    </div>
  );
};
export default SerialInputs;
