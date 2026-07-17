import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Award, Eye, PlusCircle, Download } from 'lucide-react';
import ModernAdminLayout from '../components/ModernAdminLayout';
import { userAPI, pointsAPI, exportCsvAPI } from '../services/api';
import { downloadBlob, buildCsvFilename } from '../utils/download';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { initialsOf } from '../utils/initials';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import Toast from '../components/UI/Toast';
import { Modal } from '../components/UI/Modal';
import EmptyState from '../components/UI/EmptyState';
import Skeleton, { SkeletonTable } from '../components/UI/Skeleton';
import ErrorState from '../components/UI/ErrorState';
import DataTable from '../components/UI/DataTable';
import Pagination from '../components/UI/Pagination';
import StatusBadge from '../components/UI/StatusBadge';

const PAGE_SIZE = 10;
const LEDGER_PAGE_SIZE = 10;

// Super Admin only — inline form for a manual bonus/penalty/adjustment,
// shown inside the installer's ledger modal.
const AdjustmentForm = ({ installer, onCreated }) => {
  const { t } = useLanguage();
  const [type, setType] = useState('MANUAL_BONUS');
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const typeOptions = [
    { value: 'MANUAL_BONUS', label: t('bonusLabel') },
    { value: 'MANUAL_PENALTY', label: t('penaltyLabel') },
    { value: 'MANUAL_ADJUSTMENT', label: t('adjustmentLabel') },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    const parsed = parseInt(points, 10);
    if (!Number.isInteger(parsed) || parsed === 0) {
      setFormError(t('valScoreInvalid'));
      return;
    }
    // Sign follows the chosen type — a Bonus is always credited, a Penalty
    // always deducted, regardless of what the admin typed.
    const signedPoints = type === 'MANUAL_PENALTY' ? -Math.abs(parsed) : Math.abs(parsed);

    setSaving(true);
    try {
      const response = await pointsAPI.createAdjustment(installer.id, signedPoints, type, reason);
      onCreated(response.data);
      setPoints('');
      setReason('');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-neutral-200 p-4 space-y-3 bg-neutral-50">
      <p className="text-sm font-semibold text-neutral-900">{t('manualAdjustment')}</p>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-3">
        <Select label={t('adjustmentType')} value={type} onChange={(e) => setType(e.target.value)} options={typeOptions} />
        <Input
          label={t('adjustmentPoints')}
          type="number"
          min="1"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          required
        />
      </div>
      <Input
        label={t('adjustmentReason')}
        placeholder={t('adjustmentReasonPlaceholder')}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        required
      />
      {formError && <p className="text-sm text-red-600">{formError}</p>}
      <Button type="submit" size="sm" icon={PlusCircle} loading={saving}>
        {t('createAdjustment')}
      </Button>
    </form>
  );
};

const InstallerLedgerModal = ({ installer, onClose }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const canAdjust = !!user?.is_super_admin;

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1, limit: LEDGER_PAGE_SIZE, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!installer) return;
    setError(null);
    setLoading(true);
    void (async () => {
      try {
        const response = await pointsAPI.getForInstaller(installer.id, currentPage, LEDGER_PAGE_SIZE);
        setRows(response.data.data);
        setTotal(response.data.total);
        setPagination(response.data.pagination);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [installer, currentPage, refreshKey]);

  const handleCreated = () => {
    setToast({ type: 'success', message: t('adjustmentCreated') });
    setCurrentPage(1);
    setRefreshKey((k) => k + 1);
  };

  const columns = [
    { key: 'date', header: t('pointsDateColumn'), render: (r) => new Date(r.created_at).toLocaleDateString() },
    {
      key: 'reason',
      header: t('pointsReasonColumn'),
      render: (r) => <p className="text-neutral-900 truncate max-w-xs">{r.reason || '—'}</p>,
    },
    { key: 'type', header: t('pointsTypeColumn'), render: (r) => <StatusBadge status={r.transaction_type} /> },
    {
      key: 'points',
      header: t('pointsAmountColumn'),
      render: (r) => (
        <span className={`font-semibold ${r.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {r.points >= 0 ? '+' : ''}{r.points}
        </span>
      ),
    },
  ];

  const renderLedgerMobileCard = (r) => (
    <div className="border border-neutral-200 rounded-lg p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-neutral-900 truncate">{r.reason || '—'}</p>
          <p className="text-xs text-neutral-500 mt-0.5">{new Date(r.created_at).toLocaleDateString()}</p>
        </div>
        <span className={`font-semibold flex-shrink-0 ${r.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {r.points >= 0 ? '+' : ''}{r.points}
        </span>
      </div>
      <StatusBadge status={r.transaction_type} />
    </div>
  );

  return (
    <Modal isOpen={!!installer} onClose={onClose} title={installer?.full_name} size="2xl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">{t('totalPoints')}</p>
            <p className="text-2xl font-semibold text-neutral-900">{loading ? '—' : total}</p>
          </div>
        </div>

        {canAdjust && <AdjustmentForm installer={installer} onCreated={handleCreated} />}

        {loading ? (
          <SkeletonTable />
        ) : error ? (
          <ErrorState title={t('unableToLoadPoints')} description={error} onRetry={() => setRefreshKey((k) => k + 1)} />
        ) : rows.length === 0 ? (
          <EmptyState title={t('noPointsYet')} description={t('noPointsYetDesc')} icon={Award} />
        ) : (
          <div className="space-y-4">
            <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} renderMobileCard={renderLedgerMobileCard} />
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              pageSize={LEDGER_PAGE_SIZE}
              hasNext={pagination.hasNext}
              hasPrevious={pagination.hasPrevious}
              onPageChange={setCurrentPage}
              itemsLabel={t('submissionsUnit')}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

const AdminInstallerPointsModern = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isSuperAdmin = !!user?.is_super_admin;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInstaller, setSelectedInstaller] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [pageToast, setPageToast] = useState(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await exportCsvAPI.points();
      downloadBlob(response.data, buildCsvFilename('points'));
    } catch (err) {
      setPageToast({ type: 'error', message: err.message });
    } finally {
      setExporting(false);
    }
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userAPI.getAllUsers();
      setUsers(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const employees = useMemo(() => users.filter((u) => u.role === 'EMPLOYEE'), [users]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((u) =>
      u.full_name?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.branch_name?.toLowerCase().includes(q)
    );
  }, [employees, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const columns = [
    {
      key: 'name',
      header: t('fullName'),
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
            {initialsOf(u.full_name)}
          </div>
          <span className="font-medium text-neutral-900 truncate">{u.full_name}</span>
        </div>
      ),
    },
    { key: 'branch', header: t('branch'), render: (u) => u.branch_name || u.branch_code || '—' },
  ];

  const renderActions = (u) => (
    <Button size="sm" variant="outline" icon={Eye} onClick={() => setSelectedInstaller(u)}>
      {t('pointsHistory')}
    </Button>
  );

  const renderMobileCard = (u) => (
    <div className="border border-neutral-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
          {initialsOf(u.full_name)}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-neutral-900 truncate">{u.full_name}</p>
          <p className="text-xs text-neutral-500 mt-0.5">{u.branch_name || u.branch_code || '—'}</p>
        </div>
      </div>
      {renderActions(u)}
    </div>
  );

  if (loading) {
    return (
      <ModernAdminLayout>
        <div className="space-y-6">
          <Skeleton height="h-9" width="w-64" />
          <Card><CardContent className="p-4"><SkeletonTable /></CardContent></Card>
        </div>
      </ModernAdminLayout>
    );
  }

  if (error) {
    return (
      <ModernAdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold text-neutral-900">{t('installerPoints')}</h1>
          <ErrorState title={t('unableToLoadPoints')} description={error} onRetry={fetchUsers} />
        </div>
      </ModernAdminLayout>
    );
  }

  return (
    <ModernAdminLayout>
      {pageToast && <Toast message={pageToast.message} type={pageToast.type} onClose={() => setPageToast(null)} />}
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">{t('installerPoints')}</h1>
            <p className="text-neutral-500 mt-1.5">{t('installerPointsSubtitle')}</p>
          </div>
          {isSuperAdmin && (
            <Button variant="outline" icon={Download} loading={exporting} onClick={handleExport}>
              {exporting ? t('exportingCsv') : t('exportCsvAction')}
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="p-4">
            <Input
              icon={Search}
              placeholder={t('searchInstallerPlaceholder')}
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-neutral-900">{t('installerPoints')} ({filtered.length})</h2>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <EmptyState title={t('noUsersMatch')} description={t('noUsersMatchDesc')} icon={Award} />
            ) : (
              <div className="space-y-4">
                <DataTable
                  columns={columns}
                  rows={paginated}
                  rowKey={(u) => u.id}
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

      <InstallerLedgerModal installer={selectedInstaller} onClose={() => setSelectedInstaller(null)} />
    </ModernAdminLayout>
  );
};

export default AdminInstallerPointsModern;
