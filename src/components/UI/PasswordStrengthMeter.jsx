import { useLanguage } from '../../context/LanguageContext';
import { scorePasswordStrength } from '../../utils/passwordStrength';

const LEVELS = [
  { labelKey: 'passwordStrengthWeak', color: 'bg-red-500' },
  { labelKey: 'passwordStrengthWeak', color: 'bg-red-500' },
  { labelKey: 'passwordStrengthFair', color: 'bg-amber-500' },
  { labelKey: 'passwordStrengthGood', color: 'bg-blue-500' },
  { labelKey: 'passwordStrengthStrong', color: 'bg-green-500' },
];

/** Shown under the "new password" field as the user types — see SecurityCard.jsx. */
const PasswordStrengthMeter = ({ password }) => {
  const { t } = useLanguage();
  if (!password) return null;

  const score = scorePasswordStrength(password);
  const level = LEVELS[score];

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${i < score ? level.color : 'bg-neutral-200'}`}
          />
        ))}
      </div>
      <p className="text-xs text-neutral-500">
        {t('passwordStrength')}: <span className="font-medium text-neutral-700">{t(level.labelKey)}</span>
      </p>
    </div>
  );
};

export default PasswordStrengthMeter;
