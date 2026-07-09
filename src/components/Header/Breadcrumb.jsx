import { Link } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Routes here are flat (no nested resource paths), so this is a genuine
 * two-level trail — Home shortcut back to the role's landing page, then the
 * current page — rather than a padded-out fake hierarchy.
 */
const Breadcrumb = ({ homePath, currentLabel }) => {
  const { t } = useLanguage();
  return (
    <nav className="flex items-center gap-1.5 text-sm min-w-0" aria-label={t('breadcrumbAria')}>
      <Link to={homePath} className="text-neutral-400 hover:text-neutral-600 transition-colors flex-shrink-0" aria-label={t('home')}>
        <Home className="w-4 h-4" />
      </Link>
      <ChevronRight className="w-3.5 h-3.5 text-neutral-300 flex-shrink-0" />
      <span className="font-semibold text-neutral-900 truncate">{currentLabel}</span>
    </nav>
  );
};

export default Breadcrumb;
