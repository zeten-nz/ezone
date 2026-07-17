import { useState, useEffect } from 'react';
import { Search, Boxes, UploadCloud, ChevronDown, ChevronUp, Settings2, Download } from 'lucide-react';
import ModernAdminLayout from '../components/ModernAdminLayout';
import { inventoryAPI, branchAPI, userAPI, exportCsvAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import Toast from '../components/UI/Toast';
import EmptyState from '../components/UI/EmptyState';
import { Modal } from '../components/UI/Modal';
import { SkeletonTable } from '../components/UI/Skeleton';
import ErrorState from '../components/UI/ErrorState';
import DataTable from '../components/UI/DataTable';
import Pagination from '../components/UI/Pagination';
import StatusBadge from '../components/UI/StatusBadge';
import InventoryImportModal from '../components/Inventory/InventoryImportModal';
import ManualOperationsModal from '../components/Inventory/ManualOperationsModal';
import { downloadBlob, buildCsvFilename } from '../utils/download';

const PAGE_SIZE = 20;

const EMPTY_ADVANCED_FILTERS = {
  installerId: '', branchId: '', importBatchId: '',
  installedFrom: '', installedTo: '', claimedFrom: '', claimedTo: '',
};

const AdminInventoryModern = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isSuperAdmin = !!user?.is_super_admin;

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1, limit: PAGE_SIZE, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [advanced, setAdvanced] = useState(EMPTY_ADVANCED_FILTERS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showImportModal, setShowImportModal] = useState(false);
  const [operationTarget, setOperationTarget] = useState(null); // { item, mode }
  const OPERATION_TITLE_KEYS = { status: 'changeStatusAction', branch: 'transferBranchAction', barcode: 'correctBarcodeAction', merge: 'mergeDuplicateAction' };
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState(null);

  const [branches, setBranches] = useState([]);
  const [installers, setInstallers] = useState([]);

  const statusOptions = [
    { value: '', label: t('allStatuses') },
    { value: 'IN_STOCK', label: t('inventoryStatusInStock') },
    { value: 'RESERVED', label: t('inventoryStatusReserved') },
    { value: 'INSTALLED', label: t('inventoryStatusInstalled') },
    { value: 'RETURNED', label: t('inventoryStatusReturned') },
    { value: 'DAMAGED', label: t('inventoryStatusDamaged') },
    { value: 'LOST', label: t('inventoryStatusLost') },
    { value: 'MERGED', label: t('inventoryStatusMerged') },
  ];

  useEffect(() => {
    branchAPI.getAll().then((response) => setBranches(response.data)).catch(() => setBranches([]));
    userAPI.getAllUsers().then((response) => setInstallers(response.data.filter((u) => u.role === 'EMPLOYEE'))).catch(() => setInstallers([]));
  }, []);

  useEffect(() => {
    setError(null);
    void (async () => {
      try {
        const response = await inventoryAPI.getAll(currentPage, PAGE_SIZE, {
          status: statusFilter || undefined,
          search: search || undefined,
          installerId: advanced.installerId || undefined,
          branchId: advanced.branchId || undefined,
          importBatchId: advanced.importBatchId || undefined,
          installedFrom: advanced.installedFrom || undefined,
          installedTo: advanced.installedTo || undefined,
          claimedFrom: advanced.claimedFrom || undefined,
          claimedTo: advanced.claimedTo || undefined,
        });
        setItems(response.data.data);
        setPagination(response.data.pagination);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [currentPage, search, statusFilter, advanced, refreshKey]);

  const handleRetry = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleAdvancedChange = (key, value) => {
    setAdvanced((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const hasActiveFilters = search !== '' || statusFilter !== ''
    || Object.values(advanced).some((v) => v !== '');

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setAdvanced(EMPTY_ADVANCED_FILTERS);
    setCurrentPage(1);
  };

  const handleImported = () => {
    setToast({ type: 'success', message: t('inventoryImportSuccess') });
    setShowImportModal(false);
    setRefreshKey((k) => k + 1);
  };

  const handleOperationSuccess = () => {
    setToast({ type: 'success', message: t('operationSuccess') });
    setOperationTarget(null);
    setRefreshKey((k) => k + 1);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await exportCsvAPI.inventory();
      downloadBlob(response.data, buildCsvFilename('inventory'));
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setExporting(false);
    }
  };

  const columns = [
    { key: 'barcode', header: t('inventoryBarcode'), render: (i) => <span className="font-mono text-sm">{i.barcode}</span> },
    {
      key: 'product',
      header: t('product'),
      render: (i) => (
        <div className="min-w-0">
          <p className="font-medium text-neutral-900 truncate">{i.brand} {i.model || ''}</p>
        </div>
      ),
    },
    { key: 'status', header: t('status'), render: (i) => <StatusBadge status={i.status} /> },
    { key: 'branch', header: t('warehouseLabel'), render: (i) => i.branch_name || '—' },
    {
      key: 'created_at',
      header: t('date'),
      render: (i) => new Date(i.created_at).toLocaleDateString(),
    },
  ];

  const renderActions = (i) => {
    if (!isSuperAdmin) return null;
    return (
      <>
        <Button size="sm" variant="outline" onClick={() => setOperationTarget({ item: i, mode: 'status' })}>
          {t('changeStatusAction')}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setOperationTarget({ item: i, mode: 'branch' })}>
          {t('transferBranchAction')}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setOperationTarget({ item: i, mode: 'barcode' })}>
          {t('correctBarcodeAction')}
        </Button>
        {i.status === 'IN_STOCK' && (
          <Button size="sm" variant="outline" onClick={() => setOperationTarget({ item: i, mode: 'merge' })}>
            {t('mergeDuplicateAction')}
          </Button>
        )}
      </>
    );
  };

  const renderMobileCard = (i) => (
    <div className="border border-neutral-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-sm text-neutral-900">{i.barcode}</p>
          <p className="text-xs text-neutral-500 mt-0.5">{i.brand} {i.model || ''}</p>
          <p className="text-xs text-neutral-500 mt-0.5">{i.branch_name || '—'}</p>
        </div>
        <StatusBadge status={i.status} />
      </div>
      {isSuperAdmin && <div className="flex flex-wrap gap-2">{renderActions(i)}</div>}
    </div>
  );

  if (loading) {
    return (
      <ModernAdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold text-neutral-900">{t('inventory')}</h1>
          <SkeletonTable />
        </div>
      </ModernAdminLayout>
    );
  }

  if (error) {
    return (
      <ModernAdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold text-neutral-900">{t('inventory')}</h1>
          <ErrorState title={t('unableToLoadInventory')} description={error} onRetry={handleRetry} />
        </div>
      </ModernAdminLayout>
    );
  }

  return (
    <ModernAdminLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">{t('inventory')}</h1>
            <p className="text-neutral-500 mt-1.5">{t('inventorySubtitle')}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" icon={Download} loading={exporting} onClick={handleExport}>
              {exporting ? t('exportingCsv') : t('exportCsvAction')}
            </Button>
            <Button onClick={() => setShowImportModal(true)} icon={UploadCloud}>
              {t('inventoryImportAction')}
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3">
              <Input
                icon={Search}
                placeholder={t('inventorySearchPlaceholder')}
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              <Select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                options={statusOptions}
              />
              <Button variant="secondary" icon={Settings2} onClick={() => setShowAdvanced((v) => !v)}>
                {t('advancedFilters')}
                {showAdvanced ? <ChevronUp className="w-4 h-4 ml-1.5" /> : <ChevronDown className="w-4 h-4 ml-1.5" />}
              </Button>
              {hasActiveFilters && (
                <Button variant="secondary" onClick={handleClearFilters}>{t('clear')}</Button>
              )}
            </div>

            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-neutral-100">
                <Select
                  label={t('filterByInstaller')}
                  value={advanced.installerId}
                  onChange={(e) => handleAdvancedChange('installerId', e.target.value)}
                  options={[{ value: '', label: t('allStatuses') }, ...installers.map((u) => ({ value: String(u.id), label: u.full_name }))]}
                />
                <Select
                  label={t('filterByWarehouse')}
                  value={advanced.branchId}
                  onChange={(e) => handleAdvancedChange('branchId', e.target.value)}
                  options={[{ value: '', label: t('allWarehouses') }, ...branches.map((b) => ({ value: String(b.id), label: b.name }))]}
                />
                <Input
                  label={t('filterByImportBatch')}
                  type="number"
                  value={advanced.importBatchId}
                  onChange={(e) => handleAdvancedChange('importBatchId', e.target.value)}
                />
                <Input
                  label={t('installedFromLabel')}
                  type="date"
                  value={advanced.installedFrom}
                  onChange={(e) => handleAdvancedChange('installedFrom', e.target.value)}
                />
                <Input
                  label={t('installedToLabel')}
                  type="date"
                  value={advanced.installedTo}
                  onChange={(e) => handleAdvancedChange('installedTo', e.target.value)}
                />
                <div />
                <Input
                  label={t('claimedFromLabel')}
                  type="date"
                  value={advanced.claimedFrom}
                  onChange={(e) => handleAdvancedChange('claimedFrom', e.target.value)}
                />
                <Input
                  label={t('claimedToLabel')}
                  type="date"
                  value={advanced.claimedTo}
                  onChange={(e) => handleAdvancedChange('claimedTo', e.target.value)}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-neutral-900">{t('inventory')} ({pagination.totalItems})</h2>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <EmptyState
                title={hasActiveFilters ? t('noInventoryMatch') : t('noInventoryYet')}
                description={hasActiveFilters ? t('noInventoryMatchDesc') : t('noInventoryYetDesc')}
                icon={Boxes}
                action={hasActiveFilters ? handleClearFilters : () => setShowImportModal(true)}
                actionText={hasActiveFilters ? t('clear') : t('inventoryImportAction')}
              />
            ) : (
              <div className="space-y-4">
                <DataTable
                  columns={columns}
                  rows={items}
                  rowKey={(i) => i.id}
                  renderMobileCard={renderMobileCard}
                  renderActions={isSuperAdmin ? renderActions : undefined}
                  actionsHeader={isSuperAdmin ? t('manualOperations') : undefined}
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

      <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)} title={t('inventoryImportAction')} size="md">
        {showImportModal && <InventoryImportModal onImported={handleImported} />}
      </Modal>

      <Modal
        isOpen={!!operationTarget}
        onClose={() => setOperationTarget(null)}
        title={operationTarget ? t(OPERATION_TITLE_KEYS[operationTarget.mode]) : ''}
        size="md"
      >
        {operationTarget && (
          <ManualOperationsModal
            item={operationTarget.item}
            mode={operationTarget.mode}
            branches={branches}
            onClose={() => setOperationTarget(null)}
            onSuccess={handleOperationSuccess}
          />
        )}
      </Modal>
    </ModernAdminLayout>
  );
};

export default AdminInventoryModern;
