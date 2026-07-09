import { useEffect, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const DEFAULT_ACCEPT = 'image/jpeg,image/png,image/webp';

/**
 * Generic file-to-preview image picker. Emits the raw File (or null) via
 * onChange — driven through react-hook-form's <Controller>, same pattern as
 * PhoneInput. Actual type/size validation lives in the Zod schema (see
 * validation/authSchemas.js) so the rule stays in one place; this component
 * only renders whatever file was picked and lets the caller show the error.
 */
const ImageUploader = ({ label, error, required = false, value, onChange, accept = DEFAULT_ACCEPT }) => {
  const { t } = useLanguage();
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    onChange?.(file);
    e.target.value = '';
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="flex items-center gap-4">
        {previewUrl ? (
          <div className="relative w-24 h-24 shrink-0">
            <img src={previewUrl} alt="" className="w-24 h-24 rounded-lg object-cover border border-neutral-300" />
            <button
              type="button"
              onClick={() => onChange?.(null)}
              className="absolute -top-2 -right-2 bg-white rounded-full border border-neutral-300 p-1 shadow-sm hover:bg-neutral-50"
              aria-label={t('removePhoto')}
            >
              <X className="w-3.5 h-3.5 text-neutral-600" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={`w-24 h-24 shrink-0 flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed transition-colors ${
              error
                ? 'border-red-300 bg-red-50'
                : 'border-neutral-300 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            <Camera className="w-5 h-5 text-neutral-400" />
            <span className="text-[11px] text-neutral-500 text-center px-1 leading-tight">{t('uploadPhoto')}</span>
          </button>
        )}
        {previewUrl && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            {t('changePhoto')}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default ImageUploader;
