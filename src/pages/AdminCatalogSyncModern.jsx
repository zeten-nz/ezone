import ModernAdminLayout from '../components/ModernAdminLayout';
import { useLanguage } from '../context/LanguageContext';
import CatalogSyncPanel from '../components/Catalog/CatalogSyncPanel';

/**
 * The ONE shared EasyGas catalog sync entry point — replaces what used to be
 * three separate, identical "Sync EasyGas Catalog" panels duplicated across
 * AdminProductsModern/AdminBrandsModern/AdminCarsModern (all three trigger
 * the exact same combined brands+products+cars job, so having three buttons
 * for it was three UI experiences for one action). Those pages now link here
 * instead of embedding the panel themselves.
 */
const AdminCatalogSyncModern = () => {
  const { t } = useLanguage();

  return (
    <ModernAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">{t('catalogSync')}</h1>
          <p className="text-neutral-500 mt-1.5">{t('catalogSyncSubtitle')}</p>
        </div>

        <CatalogSyncPanel />
      </div>
    </ModernAdminLayout>
  );
};

export default AdminCatalogSyncModern;
