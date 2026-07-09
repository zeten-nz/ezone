import { forwardRef, useEffect, useState } from 'react';

const COUNTRY_CODE = '+998';

const formatDigits = (digits) => {
  const parts = [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)];
  return parts.filter(Boolean).join(' ');
};

const digitsFromValue = (value) => (value || '').replace(/^\+998/, '').replace(/\D/g, '').slice(0, 9);

/**
 * Uzbekistan-only phone input — always prefixed with +998, formats the
 * remaining 9 digits as the user types, and emits a normalized `+998XXXXXXXXX`
 * string via onChange (matching PHONE_REGEX in src/config/phone.js and
 * ezone-server/config/validation.js). Designed to be driven through
 * react-hook-form's <Controller>, not `register()` — see Register.jsx and
 * UserFormModal.jsx for usage.
 */
const PhoneInput = forwardRef(({ label, error, required = false, value, onChange, onBlur, name, className = '' }, ref) => {
  const [displayDigits, setDisplayDigits] = useState(() => digitsFromValue(value));

  useEffect(() => {
    setDisplayDigits(digitsFromValue(value));
  }, [value]);

  const handleChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
    setDisplayDigits(digits);
    onChange?.(digits.length > 0 ? `${COUNTRY_CODE}${digits}` : '');
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div
        className={`flex items-center rounded-lg border transition-all duration-200 focus-within:ring-2 focus-within:ring-offset-0 ${
          error
            ? 'border-red-300 focus-within:border-red-500 focus-within:ring-red-100 bg-red-50'
            : 'border-neutral-300 focus-within:border-blue-500 focus-within:ring-blue-100'
        } ${className}`}
      >
        <span className="pl-4 pr-1 py-2.5 text-neutral-500 select-none">{COUNTRY_CODE}</span>
        <input
          ref={ref}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          name={name}
          value={formatDigits(displayDigits)}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder="90 123 45 67"
          className="w-full py-2.5 pr-4 bg-transparent focus:outline-none"
        />
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
});

PhoneInput.displayName = 'PhoneInput';

export default PhoneInput;
