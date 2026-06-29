import { useState, forwardRef } from 'react';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';

const Input = forwardRef(({
  label,
  error,
  hint,
  type = 'text',
  icon: Icon,
  showPasswordToggle = false,
  required = false,
  className = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = showPassword ? 'text' : type;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />}
        <input
          ref={ref}
          type={inputType}
          className={`w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
            Icon ? 'pl-10' : ''
          } ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50'
              : 'border-neutral-300 focus:border-blue-500 focus:ring-blue-100'
          } ${className}`}
          {...props}
        />
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword
              ? <MdVisibilityOff className="w-5 h-5" />
              : <MdVisibility className="w-5 h-5" />
            }
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      {hint && !error && <p className="text-sm text-neutral-500 mt-1">{hint}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
