import { MdErrorOutline, MdRefresh } from 'react-icons/md';
import Button from './Button';
import { useLanguage } from '../../context/LanguageContext';

/**
 * ErrorState — page-level API failure UI.
 *
 * Use this when a data-fetch fails so pages show a friendly message
 * with a Retry button instead of crashing or showing stale/empty content.
 *
 * Do NOT use ErrorBoundary for API errors — use this component instead.
 * ErrorBoundary is reserved for unexpected React rendering errors.
 */
const ErrorState = ({
  title,
  description,
  onRetry,
}) => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
        <MdErrorOutline className="w-8 h-8 text-red-500" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-neutral-900">{title || t('unableToLoadData')}</h3>
        {description && (
          <p className="text-sm text-neutral-500 max-w-sm">{description}</p>
        )}
      </div>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="gap-1.5">
          <MdRefresh className="w-4 h-4" />
          {t('tryAgain')}
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
