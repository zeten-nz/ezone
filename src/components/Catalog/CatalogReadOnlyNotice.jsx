import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Small pointer shown on the read-only Products/Brands/Cars pages toward
 * the one shared sync entry point (AdminCatalogSyncModern, /catalog-sync) —
 * without this, an admin landing on e.g. /products would have no way to
 * discover where "Sync EasyGas Catalog" now lives, since the button used to
 * be right there and was consolidated away (see CatalogSyncPanel.jsx).
 */
const CatalogReadOnlyNotice = () => {
  const { t } = useLanguage();
  return (
    <div className="flex items-center gap-2 text-sm text-neutral-500">
      <Info className="w-4 h-4 flex-shrink-0" />
      <span>{t('catalogReadOnlyNotice')}</span>
      <Link to="/catalog-sync" className="text-blue-600 hover:text-blue-700 font-medium">
        {t('catalogSync')}
      </Link>
    </div>
  );
};

export default CatalogReadOnlyNotice;
