import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Pencil, Trash2, Package, Ban, CheckCircle } from 'lucide-react';
import ModernAdminLayout from '../components/ModernAdminLayout';
import { productAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import Toast from '../components/UI/Toast';
import { Modal, ConfirmModal } from '../components/UI/Modal';
import StatusBadge from '../components/UI/StatusBadge';
import EmptyState from '../components/UI/EmptyState';
import { SkeletonTable } from '../components/UI/Skeleton';
import ErrorState from '../components/UI/ErrorState';
import DataTable from '../components/UI/DataTable';
import Pagination from '../components/UI/Pagination';
import ProductFormModal from '../components/Products/ProductFormModal';
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

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeConfirm, setActiveConfirm] = useState(null); // { id, action: 'activate'|'deactivate' }
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);

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

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleSave = async (data) => {
    try {
      if (editingProduct) {
        await productAPI.update(editingProduct.id, data);
        setToast({ type: 'success', message: t('productUpdated') });
      } else {
        await productAPI.create(data);
        setToast({ type: 'success', message: t('productCreated') });
      }
      setShowModal(false);
      setEditingProduct(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const handleToggleActive = async () => {
    if (!activeConfirm) return;
    try {
      if (activeConfirm.action === 'activate') {
        await productAPI.activate(activeConfirm.id);
        setToast({ type: 'success', message: t('productActivatedToast') });
      } else {
        await productAPI.deactivate(activeConfirm.id);
        setToast({ type: 'success', message: t('productDeactivatedToast') });
      }
      setActiveConfirm(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await productAPI.delete(deleteConfirm);
      setToast({ type: 'success', message: t('productDeleted') });
      setDeleteConfirm(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

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

  const renderActions = (p) => (
    <>
      <Button size="sm" variant="outline" icon={Pencil} onClick={() => handleOpenEdit(p)}>{t('editUser')}</Button>
      {p.is_active ? (
        <Button size="sm" variant="secondary" icon={Ban} onClick={() => setActiveConfirm({ id: p.id, action: 'deactivate' })}>{t('deactivateAction')}</Button>
      ) : (
        <Button size="sm" variant="secondary" icon={CheckCircle} onClick={() => setActiveConfirm({ id: p.id, action: 'activate' })}>{t('activateAction')}</Button>
      )}
      <Button size="sm" variant="danger" icon={Trash2} onClick={() => setDeleteConfirm(p.id)}>{t('delete')}</Button>
    </>
  );

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
        <StatusBadge status={p.is_active ? 'ACTIVE' : 'DISABLED'} />
      </div>
      <div className="flex flex-wrap gap-2 pt-1">{renderActions(p)}</div>
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
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">{t('products')}</h1>
            <p className="text-neutral-500 mt-1.5">{t('productsSubtitle')}</p>
          </div>
          <Button onClick={handleOpenCreate} icon={Plus}>
            {t('createProduct')}
          </Button>
        </div>

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
                description={hasActiveFilters ? t('noProductsMatchDesc') : t('noProductsYetDesc')}
                icon={Package}
                action={hasActiveFilters ? handleClearFilters : handleOpenCreate}
                actionText={hasActiveFilters ? t('clear') : t('createProduct')}
              />
            ) : (
              <div className="space-y-4">
                <DataTable
                  columns={columns}
                  rows={products}
                  rowKey={(p) => p.id}
                  renderActions={renderActions}
                  renderMobileCard={renderMobileCard}
                  actionsHeader={t('actions')}
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

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingProduct ? t('editProduct') : t('createProduct')}
        size="md"
      >
        {showModal && (
          <ProductFormModal
            editingProduct={editingProduct}
            onSubmit={handleSave}
            onCancel={() => setShowModal(false)}
          />
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!activeConfirm}
        onClose={() => setActiveConfirm(null)}
        onConfirm={handleToggleActive}
        title={activeConfirm?.action === 'activate' ? t('activateProductTitle') : t('deactivateProductTitle')}
        message={activeConfirm?.action === 'activate' ? t('activateProductMessage') : t('deactivateProductMessage')}
        confirmText={activeConfirm?.action === 'activate' ? t('activateAction') : t('deactivateAction')}
        isDangerous={activeConfirm?.action === 'deactivate'}
      />

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title={t('deleteProductTitle')}
        message={t('deleteProductMessage')}
        confirmText={t('delete')}
        isDangerous
      />
    </ModernAdminLayout>
  );
};

export default AdminProductsModern;
