import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Car, FileSearch, RefreshCw, Download, X } from 'lucide-react';
import ModernAdminLayout from '../components/ModernAdminLayout';
import { warrantyAPI, exportCsvAPI } from '../services/api';
import { downloadBlob, buildCsvFilename } from '../utils/download';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import Toast from '../components/UI/Toast';
import EmptyState from '../components/UI/EmptyState';
import { ConfirmModal, Modal } from '../components/UI/Modal';
import { SkeletonTable } from '../components/UI/Skeleton';
import ErrorState from '../components/UI/ErrorState';
import DataTable from '../components/UI/DataTable';
import Pagination from '../components/UI/Pagination';
import StatusBadge from '../components/UI/StatusBadge';
import WarrantyDetailModal from '../components/Warranty/WarrantyDetailModal';
import WarrantyFormFields, { validateWarrantyForm } from '../components/WarrantyFormFields';
import { toEditableEquipment } from '../config/equipmentCategories';
import { getErrorMessage } from '../config/errorCodes';
import { extractSyncErrorCode } from '../utils/syncErrorCode';

// MySQL DATE/DATETIME → YYYY-MM-DD for <input type="date">
const toInputDate = (val) => {
  if (!val) return '';
  const d = new Date(val);
  return isNaN(d) ? '' : d.toISOString().split('T')[0];
};

const AdminWarrantyFormsModern = () => {
  const { t, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // Optional installer drill-down via ?employeeId=… (e.g. the "View
  // warranties" link from Installer Statistics) — reuses this same admin
  // list/search/pagination/export UI scoped to one installer, rather than a
  // separate page or table.
  const employeeIdParam = searchParams.get('employeeId');
  const employeeId = employeeIdParam ? parseInt(employeeIdParam, 10) : undefined;

  // ── List state ──────────────────────────────────────────────────────────────
  const [forms, setForms] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1, limit: 20, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedForm, setSelectedForm] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [retrySyncConfirm, setRetrySyncConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await exportCsvAPI.warranty(employeeId);
      downloadBlob(response.data, buildCsvFilename('warranty'));
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setExporting(false);
    }
  };

  // ── Edit modal state ─────────────────────────────────────────────────────────
  const [editFormData, setEditFormData] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editScannerOpen, setEditScannerOpen] = useState(false);
  const [editFormId, setEditFormId] = useState(null);
  const [editLegacyEquipment, setEditLegacyEquipment] = useState(null);

  // ── Data fetch ───────────────────────────────────────────────────────────────
  useEffect(() => {
    setError(null);
    void (async () => {
      try {
        const response = await warrantyAPI.getAllForms(currentPage, pageSize, search, employeeId);
        setForms(response.data.data);
        setPagination(response.data.pagination);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [currentPage, pageSize, search, employeeId, refreshKey]);

  const handleClearInstallerFilter = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('employeeId');
      return next;
    });
    setCurrentPage(1);
  };

  // employee_name comes back on every row already (no extra request needed)
  // — falls back to the raw id only for the brief window before the first
  // response lands, or if the installer has zero warranties to read a name from.
  const filteredInstallerName = employeeId ? forms.find((f) => f.installer?.id === employeeId)?.employee_name : null;

  const handleRetry = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  // ── List handlers ────────────────────────────────────────────────────────────
  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await warrantyAPI.deleteForm(deleteConfirm);
      setToast({ type: 'success', message: t('formDeleted') });
      setDeleteConfirm(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const handleRetrySync = async () => {
    if (!retrySyncConfirm) return;
    try {
      await warrantyAPI.retrySync(retrySyncConfirm);
      setToast({ type: 'success', message: t('retrySyncSuccess') });
      setRetrySyncConfirm(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const handleViewDetail = async (formId) => {
    try {
      const response = await warrantyAPI.getFormDetail(formId);
      setSelectedForm(response.data);
      setShowDetail(true);
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  // ── Edit handlers ────────────────────────────────────────────────────────────
  const handleEditOpen = (form) => {
    setEditFormId(form.id);
    setEditFormData({
      warranty_book_number:          form.warranty_book_number          ?? '',
      submission_uuid:               form.submission_uuid,
      installation_date:             toInputDate(form.installation_date),
      fuel_type:                     form.fuel_type                     ?? null,
      vehicle_name:                  form.vehicle_name                  ?? '',
      car_id:                        form.car_id                        ?? null,
      vehicle_production_year:       form.vehicle_production_year       ?? new Date().getFullYear(),
      vehicle_plate_number:          form.vehicle_plate_number          ?? '',
      vehicle_vin:                   form.vehicle_vin                   ?? '',
      vehicle_mileage:               form.vehicle_mileage               ?? '',
      owner_full_name:               form.owner_full_name               ?? '',
      owner_phone:                   form.owner_phone                   ?? '',
      equipment:                     toEditableEquipment(form.equipment),
    });
    setEditErrors({});

    // A historical row recorded before either equipment redesign existed
    // has no `equipment` rows but still has the original free-text fields
    // populated — show them read-only rather than making them silently
    // vanish (see warrantyDTO.js's legacy_equipment).
    setEditLegacyEquipment(!form.equipment?.length ? form.legacy_equipment : null);
  };

  const handleEditClose = () => {
    setEditFormId(null);
    setEditFormData(null);
    setEditErrors({});
    setEditLegacyEquipment(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
    if (editErrors[name]) setEditErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    const newErrors = validateWarrantyForm(editFormData, t);
    if (Object.keys(newErrors).length > 0) {
      setEditErrors(newErrors);
      setToast({ type: 'error', message: t('fillRequiredFields') });
      return;
    }

    setEditLoading(true);
    try {
      await warrantyAPI.updateForm(editFormId, editFormData);
      setToast({ type: 'success', message: t('formUpdated') });
      handleEditClose();
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setEditLoading(false);
    }
  };

  // ── Table config ─────────────────────────────────────────────────────────────
  const columns = [
    { key: 'id', header: 'ID', render: (f) => <span className="font-medium text-neutral-900">{f.id}</span> },
    {
      key: 'vehicle',
      header: t('vehicle'),
      render: (f) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Car className="w-4 h-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-neutral-900 truncate">{f.vehicle_name}</p>
            <p className="font-mono text-xs text-neutral-500">{f.vehicle_plate_number || '—'}</p>
          </div>
        </div>
      ),
    },
    { key: 'owner', header: t('owner'), render: (f) => f.owner_full_name },
    { key: 'employee', header: t('employee'), render: (f) => f.employee_name },
    {
      key: 'date',
      header: t('date'),
      render: (f) => new Date(f.created_at).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' }),
    },
    {
      key: 'syncStatus',
      header: t('syncStatus'),
      render: (f) => {
        const code = extractSyncErrorCode(f.easygas_last_error);
        const reason = f.easygas_sync_status === 'FAILED' && code ? getErrorMessage(code, null, language) : null;
        return (
          <div className="max-w-[200px]">
            <StatusBadge status={`SYNC_${f.easygas_sync_status}`} />
            {reason && (
              <p className="text-xs text-neutral-500 mt-1 truncate" title={f.easygas_last_error}>{reason}</p>
            )}
          </div>
        );
      },
    },
  ];

  const renderActions = (form) => (
    <>
      <Button size="sm" variant="outline" onClick={() => handleViewDetail(form.id)}>{t('view')}</Button>
      <Button size="sm" variant="secondary" onClick={() => handleEditOpen(form)}>{t('editWarranty')}</Button>
      {form.easygas_sync_status === 'FAILED' && (
        <Button size="sm" variant="outline" icon={RefreshCw} onClick={() => setRetrySyncConfirm(form.id)}>
          {t('retrySync')}
        </Button>
      )}
      <Button size="sm" variant="danger" onClick={() => setDeleteConfirm(form.id)}>{t('delete')}</Button>
    </>
  );

  const renderMobileCard = (form) => (
    <div className="border border-neutral-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Car className="w-4 h-4 text-blue-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-neutral-900">{form.vehicle_name}</p>
          <p className="font-mono text-xs text-neutral-500 mt-0.5">{form.vehicle_plate_number || '—'}</p>
        </div>
        <span className="text-xs text-neutral-400">#{form.id}</span>
      </div>
      <dl className="grid grid-cols-2 gap-2 text-xs">
        <div><dt className="text-neutral-400">{t('owner')}</dt><dd className="text-neutral-700 font-medium truncate">{form.owner_full_name}</dd></div>
        <div><dt className="text-neutral-400">{t('employee')}</dt><dd className="text-neutral-700 font-medium truncate">{form.employee_name}</dd></div>
      </dl>
      <div className="flex gap-2 pt-1">{renderActions(form)}</div>
    </div>
  );

  // ── Skeleton (first load only) ───────────────────────────────────────────────
  if (loading) {
    return (
      <ModernAdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold text-neutral-900">{t('warrantyForms')}</h1>
          <SkeletonTable />
        </div>
      </ModernAdminLayout>
    );
  }

  if (error) {
    return (
      <ModernAdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold text-neutral-900">{t('warrantyForms')}</h1>
          <ErrorState title={t('unableToLoadForms')} description={error} onRetry={handleRetry} />
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
            <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">{t('warrantyForms')}</h1>
            <p className="text-neutral-500 mt-1.5">{t('adminWarrantySubtitle')}</p>
          </div>
          <Button variant="outline" icon={Download} loading={exporting} onClick={handleExport}>
            {exporting ? t('exportingCsv') : t('exportCsvAction')}
          </Button>
        </div>

        {employeeId && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-sm text-blue-900">
              <span className="font-medium">{t('filteredByInstallerLabel')}:</span>{' '}
              {filteredInstallerName || `#${employeeId}`}
            </p>
            <Button size="sm" variant="outline" icon={X} onClick={handleClearInstallerFilter}>
              {t('clearInstallerFilter')}
            </Button>
          </div>
        )}

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3">
              <Input
                icon={Search}
                placeholder={t('searchFormsPlaceholder')}
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <Select
                value={pageSize}
                onChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setCurrentPage(1); }}
                options={[10, 20, 50, 100].map((n) => ({ value: n, label: `${n} ${t('perPage')}` }))}
              />
              {search && (
                <Button variant="secondary" onClick={() => handleSearch('')}>{t('clear')}</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-neutral-900">{t('allForms')} ({pagination.totalItems})</h2>
          </CardHeader>
          <CardContent>
            {forms.length > 0 ? (
              <div className="space-y-4">
                <DataTable
                  columns={columns}
                  rows={forms}
                  rowKey={(f) => f.id}
                  renderActions={renderActions}
                  renderMobileCard={renderMobileCard}
                  actionsHeader={t('actions')}
                />
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.totalItems}
                  pageSize={pageSize}
                  hasNext={pagination.hasNext}
                  hasPrevious={pagination.hasPrevious}
                  onPageChange={setCurrentPage}
                  itemsLabel={t('submissionsUnit')}
                />
              </div>
            ) : (
              <EmptyState
                title={t('noFormsFound')}
                description={t('noFormsFoundDesc')}
                icon={FileSearch}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <WarrantyDetailModal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        form={selectedForm}
        t={t}
        language={language}
      />

      {/* ── Edit modal ────────────────────────────────────────────────────────── */}
      <Modal isOpen={!!editFormData} onClose={handleEditClose} title={t('editWarrantyTitle')} size="2xl">
        {editFormData && (
          <form onSubmit={handleEditSave} className="space-y-6">
            <WarrantyFormFields
              formData={editFormData}
              onChange={handleEditInputChange}
              onEquipmentChange={(equipment) => setEditFormData((prev) => ({ ...prev, equipment }))}
              errors={editErrors}
              scannerOpen={editScannerOpen}
              setScannerOpen={setEditScannerOpen}
              onScannerComplete={(data) => setEditFormData((prev) => ({ ...prev, ...data }))}
              legacyEquipment={editLegacyEquipment}
            />
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="secondary" type="button" onClick={handleEditClose}>
                {t('cancel')}
              </Button>
              <Button type="submit" loading={editLoading}>
                {t('saveChanges')}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── Delete confirmation ───────────────────────────────────────────────── */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title={t('deleteFormTitle')}
        message={t('deleteFormMessage')}
        confirmText={t('delete')}
        isDangerous
      />

      {/* ── Retry sync confirmation ──────────────────────────────────────────── */}
      <ConfirmModal
        isOpen={!!retrySyncConfirm}
        onClose={() => setRetrySyncConfirm(null)}
        onConfirm={handleRetrySync}
        title={t('retrySyncConfirmTitle')}
        message={t('retrySyncConfirmMessage')}
        confirmText={t('retrySync')}
      />
    </ModernAdminLayout>
  );
};

export default AdminWarrantyFormsModern;
