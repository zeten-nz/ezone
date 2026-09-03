import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Plus, Pencil, Ban, CheckCircle, Building2, ShieldAlert } from 'lucide-react';
import ModernAdminLayout from '../components/ModernAdminLayout';
import { branchAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import Toast from '../components/UI/Toast';
import { Modal, ConfirmModal } from '../components/UI/Modal';
import StatusBadge from '../components/UI/StatusBadge';
import EmptyState from '../components/UI/EmptyState';
import Skeleton, { SkeletonTable } from '../components/UI/Skeleton';
import ErrorState from '../components/UI/ErrorState';
import DataTable from '../components/UI/DataTable';
import Pagination from '../components/UI/Pagination';
import BranchFormModal from '../components/Branches/BranchFormModal';
import BranchReclassifyModal from '../components/Branches/BranchReclassifyModal';
import { branchTypeFilterOptions } from '../config/branchTypes';

const PAGE_SIZE = 10;

const AdminBranchesModern = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isSuperAdmin = !!user?.is_super_admin; // gates the corrective reclassification action (same pattern as inventory manual ops)
  const [reclassifyTarget, setReclassifyTarget] = useState(null); // branch being corrected
  const [reclassifySubmitting, setReclassifySubmitting] = useState(false);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [toast, setToast] = useState(null);
  const [statusConfirm, setStatusConfirm] = useState(null); // { id, action: 'enable' | 'disable' }
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('ALL'); // Beta-2 business-type filter
  const [currentPage, setCurrentPage] = useState(1);

  const fetchBranches = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
      setError(null);
    }
    try {
      const response = await branchAPI.getAll();
      setBranches(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const handleRetry = () => fetchBranches(true);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return branches.filter((b) => {
      const matchesSearch =
        !q ||
        b.code?.toLowerCase().includes(q) ||
        b.name?.toLowerCase().includes(q) ||
        b.phone?.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === 'all' || (statusFilter === 'active' ? b.is_active : !b.is_active);
      // branch_type filter — UNCLASSIFIED means NULL; independent of the
      // active/inactive status filter above.
      const matchesType =
        typeFilter === 'ALL' ||
        (typeFilter === 'UNCLASSIFIED' ? !b.branch_type : b.branch_type === typeFilter);
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [branches, search, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleTypeChange = (value) => {
    setTypeFilter(value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setTypeFilter('ALL');
    setCurrentPage(1);
  };

  const hasActiveFilters = search !== '' || statusFilter !== 'all' || typeFilter !== 'ALL';

  const handleOpenCreate = () => {
    setEditingBranch(null);
    setShowModal(true);
  };

  const handleOpenEdit = (branch) => {
    setEditingBranch(branch);
    setShowModal(true);
  };

  const handleSave = async (data) => {
    try {
      if (editingBranch) {
        await branchAPI.update(editingBranch.id, data);
        setToast({ type: 'success', message: t('branchUpdated') });
      } else {
        await branchAPI.create(data);
        setToast({ type: 'success', message: t('branchCreated') });
      }
      setShowModal(false);
      setEditingBranch(null);
      await fetchBranches(false);
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const handleToggleStatus = async () => {
    if (!statusConfirm) return;
    const { id, action } = statusConfirm;
    try {
      if (action === 'enable') {
        await branchAPI.enable(id);
        setToast({ type: 'success', message: t('branchEnabled') });
      } else {
        await branchAPI.disable(id);
        setToast({ type: 'success', message: t('branchDisabled') });
      }
      setStatusConfirm(null);
      await fetchBranches(false);
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const columns = [
    {
      key: 'code',
      header: t('branchCode'),
      render: (b) => <span className="font-mono text-neutral-900">{b.code}</span>,
    },
    { key: 'name', header: t('branchName'), render: (b) => b.name },
    { key: 'phone', header: t('phone'), render: (b) => b.phone || '—' },
    {
      key: 'location',
      header: t('region'),
      render: (b) => (
        <div className="min-w-0">
          <p className="text-neutral-900 truncate">{b.region || '—'}</p>
          <p className="text-xs text-neutral-500 truncate">{b.district || ''}{b.city ? ` · ${b.city}` : ''}</p>
        </div>
      ),
    },
    {
      // Persisted business classification (Beta-2) — a TEXT badge, never
      // color-only; NULL renders as "Tayinlanmagan".
      key: 'branchType',
      header: t('branchTypeLabel'),
      render: (b) => <StatusBadge status={`BRANCH_TYPE_${b.branch_type || 'UNCLASSIFIED'}`} />,
    },
    {
      key: 'status',
      header: t('status'),
      render: (b) => <StatusBadge status={b.is_active ? 'ACTIVE' : 'DISABLED'} />,
    },
  ];

  // Beta-2.1: explicit corrective reclassification — Super-Admin only, its
  // own deliberate modal (never part of the ordinary edit form, which keeps
  // classification read-only).
  const handleReclassify = async (targetType) => {
    if (!reclassifyTarget) return;
    setReclassifySubmitting(true);
    try {
      await branchAPI.reclassify(reclassifyTarget.id, targetType);
      setToast({ type: 'success', message: t('branchReclassified') });
      setReclassifyTarget(null);
      await fetchBranches(false);
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setReclassifySubmitting(false);
    }
  };

  const renderActions = (b) => (
    <>
      <Button size="sm" variant="outline" icon={Pencil} onClick={() => handleOpenEdit(b)}>
        {t('editUser')}
      </Button>
      {isSuperAdmin && (
        <Button size="sm" variant="secondary" icon={ShieldAlert} onClick={() => setReclassifyTarget(b)}>
          {t('reclassifyBranchAction')}
        </Button>
      )}
      {b.is_active ? (
        <Button size="sm" variant="danger" icon={Ban} onClick={() => setStatusConfirm({ id: b.id, action: 'disable' })}>
          {t('disableAction')}
        </Button>
      ) : (
        <Button size="sm" variant="success" icon={CheckCircle} onClick={() => setStatusConfirm({ id: b.id, action: 'enable' })}>
          {t('enableAction')}
        </Button>
      )}
    </>
  );

  const renderMobileCard = (b) => (
    <div className="border border-neutral-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-4 h-4 text-blue-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-neutral-900 truncate">{b.name}</p>
          <p className="text-xs text-neutral-500 mt-0.5 font-mono">{b.code}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={b.is_active ? 'ACTIVE' : 'DISABLED'} />
          <StatusBadge status={`BRANCH_TYPE_${b.branch_type || 'UNCLASSIFIED'}`} />
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-2 text-xs">
        <div><dt className="text-neutral-400">{t('phone')}</dt><dd className="text-neutral-700 font-medium truncate">{b.phone || '—'}</dd></div>
        <div><dt className="text-neutral-400">{t('region')}</dt><dd className="text-neutral-700 font-medium truncate">{b.region || '—'}</dd></div>
      </dl>
      <div className="flex flex-wrap gap-2 pt-1">{renderActions(b)}</div>
    </div>
  );

  if (loading) {
    return (
      <ModernAdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton height="h-9" width="w-48" />
              <Skeleton height="h-5" width="w-72" />
            </div>
            <Skeleton height="h-10" width="w-32" />
          </div>
          <Card><CardContent className="p-4"><Skeleton height="h-10" /></CardContent></Card>
          <Card><CardContent className="p-4"><SkeletonTable /></CardContent></Card>
        </div>
      </ModernAdminLayout>
    );
  }

  if (error) {
    return (
      <ModernAdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold text-neutral-900">{t('branches')}</h1>
          <ErrorState title={t('unableToLoadBranches')} description={error} onRetry={handleRetry} />
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
            <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">{t('branches')}</h1>
            <p className="text-neutral-500 mt-1.5">{t('branchesSubtitle')}</p>
          </div>
          <Button onClick={handleOpenCreate} icon={Plus}>
            {t('createBranch')}
          </Button>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3">
              <Input
                icon={Search}
                placeholder={t('searchBranchesPlaceholder')}
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              <Select
                value={typeFilter}
                onChange={(e) => handleTypeChange(e.target.value)}
                options={branchTypeFilterOptions(t)}
              />
              <Select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                options={[
                  { value: 'all', label: t('allStatuses') },
                  { value: 'active', label: t('active') },
                  { value: 'inactive', label: t('inactive') },
                ]}
              />
              {hasActiveFilters && (
                <Button variant="secondary" onClick={handleClearFilters}>{t('clear')}</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-neutral-900">{t('branches')} ({filtered.length})</h2>
          </CardHeader>
          <CardContent>
            {branches.length === 0 ? (
              <EmptyState
                title={t('noBranchesYet')}
                description={t('noBranchesYetDesc')}
                icon={Building2}
                action={handleOpenCreate}
                actionText={t('createBranch')}
              />
            ) : filtered.length === 0 ? (
              <EmptyState
                title={t('noUsersMatch')}
                description={t('noUsersMatchDesc')}
                icon={Building2}
                action={handleClearFilters}
                actionText={t('clear')}
              />
            ) : (
              <div className="space-y-4">
                <DataTable
                  columns={columns}
                  rows={paginated}
                  rowKey={(b) => b.id}
                  renderActions={renderActions}
                  renderMobileCard={renderMobileCard}
                  actionsHeader={t('actions')}
                />
                <Pagination
                  currentPage={pageSafe}
                  totalPages={totalPages}
                  totalItems={filtered.length}
                  pageSize={PAGE_SIZE}
                  hasNext={pageSafe < totalPages}
                  hasPrevious={pageSafe > 1}
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
        title={editingBranch ? t('editBranch') : t('createBranch')}
        size="md"
      >
        {showModal && (
          <BranchFormModal
            editingBranch={editingBranch}
            onSubmit={handleSave}
            onCancel={() => setShowModal(false)}
          />
        )}
      </Modal>

      <Modal
        isOpen={!!reclassifyTarget}
        onClose={() => setReclassifyTarget(null)}
        title={t('reclassifyBranchAction')}
        size="md"
      >
        {reclassifyTarget && (
          <BranchReclassifyModal
            branch={reclassifyTarget}
            onConfirm={handleReclassify}
            onCancel={() => setReclassifyTarget(null)}
            submitting={reclassifySubmitting}
          />
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!statusConfirm}
        onClose={() => setStatusConfirm(null)}
        onConfirm={handleToggleStatus}
        title={statusConfirm?.action === 'enable' ? t('enableBranchTitle') : t('disableBranchTitle')}
        message={statusConfirm?.action === 'enable' ? t('enableBranchMessage') : t('disableBranchMessage')}
        confirmText={statusConfirm?.action === 'enable' ? t('enableAction') : t('disableAction')}
        isDangerous={statusConfirm?.action !== 'enable'}
      />
    </ModernAdminLayout>
  );
};

export default AdminBranchesModern;
