import { useState, useEffect } from 'react';
import { Search, Car, History, Clock } from 'lucide-react';
import ModernEmployeeLayout from '../components/ModernEmployeeLayout';
import { warrantyAPI } from '../services/api';
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
import WarrantyDetailModal from '../components/Warranty/WarrantyDetailModal';
import WarrantyFormFields, { validateWarrantyForm } from '../components/WarrantyFormFields';
import { toEditableEquipment } from '../config/equipmentCategories';

const EDIT_WINDOW_HOURS = 24;

// Employees can only edit within 24 hours of submission.
const hoursRemaining = (createdAt) =>
  EDIT_WINDOW_HOURS - (Date.now() - new Date(createdAt).getTime()) / 3_600_000;

// MySQL DATE/DATETIME → YYYY-MM-DD for <input type="date">
const toInputDate = (val) => {
  if (!val) return '';
  const d = new Date(val);
  return isNaN(d) ? '' : d.toISOString().split('T')[0];
};

const EmployeeWarrantyHistoryModern = () => {
  const { t, language } = useLanguage();

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
  const [toast, setToast] = useState(null);

  // ── Detail modal state ───────────────────────────────────────────────────────
  const [selectedForm, setSelectedForm] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

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
        const response = await warrantyAPI.getMyForms(currentPage, pageSize, search);
        setForms(response.data.data);
        setPagination(response.data.pagination);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [currentPage, pageSize, search, refreshKey]);

  const handleRetry = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  // ── List handlers ────────────────────────────────────────────────────────────
  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleViewDetail = (formId) => {
    const form = forms.find((f) => f.id === formId);
    if (form) { setSelectedForm(form); setShowDetail(true); }
  };

  // ── Edit handlers ────────────────────────────────────────────────────────────
  const handleEditOpen = (form) => {
    setEditFormId(form.id);
    setEditFormData({
      warranty_book_number:         form.warranty_book_number         ?? '',
      submission_uuid:              form.submission_uuid,
      installation_date:            toInputDate(form.installation_date),
      fuel_type:                    form.fuel_type                    ?? null,
      vehicle_name:                 form.vehicle_name                 ?? '',
      car_id:                       form.car_id                       ?? null,
      vehicle_production_year:      form.vehicle_production_year      ?? new Date().getFullYear(),
      vehicle_plate_number:         form.vehicle_plate_number         ?? '',
      vehicle_vin:                  form.vehicle_vin                  ?? '',
      vehicle_mileage:              form.vehicle_mileage              ?? '',
      owner_full_name:              form.owner_full_name              ?? '',
      owner_phone:                  form.owner_phone                  ?? '',
      equipment:                    toEditableEquipment(form.equipment),
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
    { key: 'owner', header: t('ownerName'), render: (f) => f.owner_full_name },
    {
      key: 'installDate',
      header: t('installationDate'),
      render: (f) => (f.installation_date ? new Date(f.installation_date).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'),
    },
    {
      key: 'editWindow',
      header: t('editExpiresIn'),
      render: (f) => {
        const remaining = hoursRemaining(f.created_at);
        if (remaining <= 0) return <span className="text-neutral-400 text-xs">—</span>;
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
            <Clock className="w-3 h-3" />
            {Math.ceil(remaining)}{t('hoursShort')}
          </span>
        );
      },
    },
  ];

  const renderActions = (form) => {
    const canEdit = hoursRemaining(form.created_at) > 0;
    return (
      <>
        <Button size="sm" variant="outline" onClick={() => handleViewDetail(form.id)}>{t('view')}</Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => handleEditOpen(form)}
          disabled={!canEdit}
          title={!canEdit ? t('editExpired') : undefined}
        >
          {t('editWarranty')}
        </Button>
      </>
    );
  };

  const renderMobileCard = (form) => {
    const remaining = hoursRemaining(form.created_at);
    return (
      <div className="border border-neutral-200 rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Car className="w-4 h-4 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-neutral-900">{form.vehicle_name}</p>
            <p className="font-mono text-xs text-neutral-500 mt-0.5">{form.vehicle_plate_number || '—'}</p>
          </div>
          {remaining > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md flex-shrink-0">
              <Clock className="w-3 h-3" />{Math.ceil(remaining)}{t('hoursShort')}
            </span>
          )}
        </div>
        <p className="text-xs text-neutral-500">{form.owner_full_name}</p>
        <div className="flex gap-2 pt-1">{renderActions(form)}</div>
      </div>
    );
  };

  // ── Skeleton (first load only) ───────────────────────────────────────────────
  if (loading) {
    return (
      <ModernEmployeeLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold text-neutral-900">{t('myWarrantyHistory')}</h1>
          <SkeletonTable />
        </div>
      </ModernEmployeeLayout>
    );
  }

  if (error) {
    return (
      <ModernEmployeeLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold text-neutral-900">{t('myWarrantyHistory')}</h1>
          <ErrorState title={t('unableToLoadHistory')} description={error} onRetry={handleRetry} />
        </div>
      </ModernEmployeeLayout>
    );
  }

  return (
    <ModernEmployeeLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">{t('myWarrantyHistory')}</h1>
          <p className="text-neutral-500 mt-1.5">{t('myWarrantyHistoryDesc')}</p>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3">
              <Input
                icon={Search}
                placeholder={t('searchHistoryPlaceholder')}
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <Select
                value={pageSize}
                onChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setCurrentPage(1); }}
                options={[10, 20, 50].map((n) => ({ value: n, label: `${n} ${t('perPage')}` }))}
              />
              {search && (
                <Button variant="secondary" onClick={() => handleSearch('')}>{t('clear')}</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-neutral-900">{t('myWarrantyHistory')} ({pagination.totalItems})</h2>
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
                title={t('noWarrantyHistory')}
                description={t('noWarrantyHistoryDesc')}
                icon={History}
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
    </ModernEmployeeLayout>
  );
};

export default EmployeeWarrantyHistoryModern;
