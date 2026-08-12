import { useState, useEffect } from 'react';
import { Search, Tag } from 'lucide-react';
import ModernAdminLayout from '../components/ModernAdminLayout';
import { brandAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import StatusBadge from '../components/UI/StatusBadge';
import EmptyState from '../components/UI/EmptyState';
import { SkeletonTable } from '../components/UI/Skeleton';
import ErrorState from '../components/UI/ErrorState';
import DataTable from '../components/UI/DataTable';
import Pagination from '../components/UI/Pagination';
import CatalogReadOnlyNotice from '../components/Catalog/CatalogReadOnlyNotice';

const PAGE_SIZE = 20;

const AdminBrandsModern = () => {
  const { t } = useLanguage();

  const [brands, setBrands] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1, limit: PAGE_SIZE, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setError(null);
    void (async () => {
      try {
        const response = await brandAPI.getAll(currentPage, PAGE_SIZE, search);
        setBrands(response.data.data);
        setPagination(response.data.pagination);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [currentPage, search, refreshKey]);

  const handleRetry = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setCurrentPage(1);
  };

  const hasActiveFilters = search !== '';

  const columns = [
    {
      key: 'brand',
      header: t('brand'),
      render: (b) => (
        <div className="min-w-0">
          <p className="font-medium text-neutral-900 truncate">{b.name}</p>
          {(b.full_name || b.country) && (
            <p className="text-xs text-neutral-500 truncate">{b.full_name || ''}{b.full_name && b.country ? ' · ' : ''}{b.country || ''}</p>
          )}
        </div>
      ),
    },
    { key: 'status', header: t('status'), render: (b) => <StatusBadge status={b.is_active ? 'ACTIVE' : 'DISABLED'} /> },
  ];

  const renderMobileCard = (b) => (
    <div className="border border-neutral-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Tag className="w-4 h-4 text-blue-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-neutral-900 truncate">{b.name}</p>
          <p className="text-xs text-neutral-500 mt-0.5 truncate">{b.full_name || ''}{b.full_name && b.country ? ' · ' : ''}{b.country || ''}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={b.is_active ? 'ACTIVE' : 'DISABLED'} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <ModernAdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold text-neutral-900">{t('brands')}</h1>
          <SkeletonTable />
        </div>
      </ModernAdminLayout>
    );
  }

  if (error) {
    return (
      <ModernAdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold text-neutral-900">{t('brands')}</h1>
          <ErrorState title={t('unableToLoadBrands')} description={error} onRetry={handleRetry} />
        </div>
      </ModernAdminLayout>
    );
  }

  return (
    <ModernAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">{t('brands')}</h1>
          <p className="text-neutral-500 mt-1.5">{t('brandsSubtitle')}</p>
        </div>

        <CatalogReadOnlyNotice />

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
              <Input
                icon={Search}
                placeholder={t('searchBrandsPlaceholder')}
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              {hasActiveFilters && (
                <Button variant="secondary" onClick={handleClearFilters}>{t('clear')}</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-neutral-900">{t('brands')} ({pagination.totalItems})</h2>
          </CardHeader>
          <CardContent>
            {brands.length === 0 ? (
              <EmptyState
                title={hasActiveFilters ? t('noBrandsMatch') : t('noBrandsYet')}
                description={hasActiveFilters ? t('noBrandsMatchDesc') : t('noBrandsYetSyncDesc')}
                icon={Tag}
                action={hasActiveFilters ? handleClearFilters : undefined}
                actionText={hasActiveFilters ? t('clear') : undefined}
              />
            ) : (
              <div className="space-y-4">
                <DataTable
                  columns={columns}
                  rows={brands}
                  rowKey={(b) => b.id}
                  renderMobileCard={renderMobileCard}
                />
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.totalItems}
                  pageSize={PAGE_SIZE}
                  hasNext={pagination.hasNext}
                  hasPrevious={pagination.hasPrevious}
                  onPageChange={setCurrentPage}
                  itemsLabel={t('submissionsUnit')}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ModernAdminLayout>
  );
};

export default AdminBrandsModern;
