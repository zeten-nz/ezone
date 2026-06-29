import { forwardRef } from 'react';

const Select = forwardRef(({
  label,
  options = [],
  error,
  required = false,
  className = '',
  ...props
}, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-neutral-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <select
      ref={ref}
      className={`w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
        error
          ? 'border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50'
          : 'border-neutral-300 focus:border-blue-500 focus:ring-blue-100'
      } ${className}`}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
  </div>
));

Select.displayName = 'Select';

export default Select;
