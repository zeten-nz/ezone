import { useState, useEffect, useMemo } from 'react';
import { Search, Package } from 'lucide-react';
import ModernAdminLayout from '../components/ModernAdminLayout';
import { productAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import StatusBadge from '../components/UI/StatusBadge';
import EmptyState from '../components/UI/EmptyState';
import { SkeletonTable } from '../components/UI/Skeleton';
import ErrorState from '../components/UI/ErrorState';
import DataTable from '../components/UI/DataTable';
import Pagination from '../components/UI/Pagination';
import CatalogReadOnlyNotice from '../components/Catalog/CatalogReadOnlyNotice';
import { getProductCategoryLabel, getProductCategoryOptions } from '../config/productCategories';

const PAGE_SIZE = 20;

const AdminProductsModern = () => {
  const { t } = useLanguage();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1, limit: PAGE_SIZE, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const categoryOptions = useMemo(
    () => [{ value: '', label: t('allCategories') }, ...getProductCategoryOptions(t)],
    [t]
  );

  useEffect(() => {
    setError(null);
    void (async () => {
      try {
        const response = await productAPI.getAll(currentPage, PAGE_SIZE, search, categoryFilter);
        setProducts(response.data.data);
        setPagination(response.data.pagination);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [currentPage, search, categoryFilter, refreshKey]);

  const handleRetry = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategoryFilter('');
    setCurrentPage(1);
  };

  const hasActiveFilters = search !== '' || categoryFilter !== '';

  const columns = [
    {
      key: 'product',
      header: t('product'),
      render: (p) => (
        <div className="min-w-0">
          <p className="font-medium text-neutral-900 truncate">{p.brand} {p.model || ''}</p>
          <p className="text-xs text-neutral-500">{getProductCategoryLabel(t, p.category)}{p.fuel_type ? ` · ${p.fuel_type}` : ''}</p>
        </div>
      ),
    },
    { key: 'status', header: t('status'), render: (p) => <StatusBadge status={p.is_active ? 'ACTIVE' : 'DISABLED'} /> },
  ];

  const renderMobileCard = (p) => (
    <div className="border border-neutral-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Package className="w-4 h-4 text-blue-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-neutral-900 truncate">{p.brand} {p.model || ''}</p>
          <p className="text-xs text-neutral-500 mt-0.5">{getProductCategoryLabel(t, p.category)}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={p.is_active ? 'ACTIVE' : 'DISABLED'} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <ModernAdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold text-neutral-900">{t('products')}</h1>
          <SkeletonTable />
        </div>
      </ModernAdminLayout>
    );
  }

  if (error) {
    return (
      <ModernAdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold text-neutral-900">{t('products')}</h1>
          <ErrorState title={t('unableToLoadProducts')} description={error} onRetry={handleRetry} />
        </div>
      </ModernAdminLayout>
    );
  }

  return (
    <ModernAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">{t('products')}</h1>
          <p className="text-neutral-500 mt-1.5">{t('productsSubtitle')}</p>
        </div>

        <CatalogReadOnlyNotice />

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3">
              <Input
                icon={Search}
                placeholder={t('searchProductsPlaceholder')}
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              <Select
                value={categoryFilter}
                onChange={(e) => handleCategoryChange(e.target.value)}
                options={categoryOptions}
              />
              {hasActiveFilters && (
                <Button variant="secondary" onClick={handleClearFilters}>{t('clear')}</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-neutral-900">{t('products')} ({pagination.totalItems})</h2>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <EmptyState
                title={hasActiveFilters ? t('noProductsMatch') : t('noProductsYet')}
                description={hasActiveFilters ? t('noProductsMatchDesc') : t('noProductsYetSyncDesc')}
                icon={Package}
                action={hasActiveFilters ? handleClearFilters : undefined}
                actionText={hasActiveFilters ? t('clear') : undefined}
              />
            ) : (
              <div className="space-y-4">
                <DataTable
                  columns={columns}
                  rows={products}
                  rowKey={(p) => p.id}
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

export default AdminProductsModern;
