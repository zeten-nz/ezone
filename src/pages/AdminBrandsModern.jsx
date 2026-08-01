import { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2, Tag, Ban, CheckCircle } from 'lucide-react';
import ModernAdminLayout from '../components/ModernAdminLayout';
import { brandAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Toast from '../components/UI/Toast';
import { Modal, ConfirmModal } from '../components/UI/Modal';
import StatusBadge from '../components/UI/StatusBadge';
import EmptyState from '../components/UI/EmptyState';
import { SkeletonTable } from '../components/UI/Skeleton';
import ErrorState from '../components/UI/ErrorState';
import DataTable from '../components/UI/DataTable';
import Pagination from '../components/UI/Pagination';
import BrandFormModal from '../components/Brands/BrandFormModal';

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

  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [activeConfirm, setActiveConfirm] = useState(null); // { id, action: 'activate'|'deactivate' }
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);

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

  const handleOpenCreate = () => {
    setEditingBrand(null);
    setShowModal(true);
  };

  const handleOpenEdit = (brand) => {
    setEditingBrand(brand);
    setShowModal(true);
  };

  const handleSave = async (data) => {
    try {
      if (editingBrand) {
        await brandAPI.update(editingBrand.id, data);
        setToast({ type: 'success', message: t('brandUpdated') });
      } else {
        await brandAPI.create(data);
        setToast({ type: 'success', message: t('brandCreated') });
      }
      setShowModal(false);
      setEditingBrand(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const handleToggleActive = async () => {
    if (!activeConfirm) return;
    try {
      if (activeConfirm.action === 'activate') {
        await brandAPI.activate(activeConfirm.id);
        setToast({ type: 'success', message: t('brandActivatedToast') });
      } else {
        await brandAPI.deactivate(activeConfirm.id);
        setToast({ type: 'success', message: t('brandDeactivatedToast') });
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
      await brandAPI.delete(deleteConfirm);
      setToast({ type: 'success', message: t('brandDeleted') });
      setDeleteConfirm(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

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

  const renderActions = (b) => (
    <>
      <Button size="sm" variant="outline" icon={Pencil} onClick={() => handleOpenEdit(b)}>{t('editUser')}</Button>
      {b.is_active ? (
        <Button size="sm" variant="secondary" icon={Ban} onClick={() => setActiveConfirm({ id: b.id, action: 'deactivate' })}>{t('deactivateAction')}</Button>
      ) : (
        <Button size="sm" variant="secondary" icon={CheckCircle} onClick={() => setActiveConfirm({ id: b.id, action: 'activate' })}>{t('activateAction')}</Button>
      )}
      <Button size="sm" variant="danger" icon={Trash2} onClick={() => setDeleteConfirm(b.id)}>{t('delete')}</Button>
    </>
  );

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
      <div className="flex flex-wrap gap-2 pt-1">{renderActions(b)}</div>
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
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">{t('brands')}</h1>
            <p className="text-neutral-500 mt-1.5">{t('brandsSubtitle')}</p>
          </div>
          <Button onClick={handleOpenCreate} icon={Plus}>
            {t('createBrand')}
          </Button>
        </div>

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
                description={hasActiveFilters ? t('noBrandsMatchDesc') : t('noBrandsYetDesc')}
                icon={Tag}
                action={hasActiveFilters ? handleClearFilters : handleOpenCreate}
                actionText={hasActiveFilters ? t('clear') : t('createBrand')}
              />
            ) : (
              <div className="space-y-4">
                <DataTable
                  columns={columns}
                  rows={brands}
                  rowKey={(b) => b.id}
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
        title={editingBrand ? t('editBrand') : t('createBrand')}
        size="md"
      >
        {showModal && (
          <BrandFormModal
            editingBrand={editingBrand}
            onSubmit={handleSave}
            onCancel={() => setShowModal(false)}
          />
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!activeConfirm}
        onClose={() => setActiveConfirm(null)}
        onConfirm={handleToggleActive}
        title={activeConfirm?.action === 'activate' ? t('activateBrandTitle') : t('deactivateBrandTitle')}
        message={activeConfirm?.action === 'activate' ? t('activateBrandMessage') : t('deactivateBrandMessage')}
        confirmText={activeConfirm?.action === 'activate' ? t('activateAction') : t('deactivateAction')}
        isDangerous={activeConfirm?.action === 'deactivate'}
      />

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title={t('deleteBrandTitle')}
        message={t('deleteBrandMessage')}
        confirmText={t('delete')}
        isDangerous
      />
    </ModernAdminLayout>
  );
};

export default AdminBrandsModern;
