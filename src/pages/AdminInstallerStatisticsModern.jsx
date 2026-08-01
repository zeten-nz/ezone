import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Award, Package, Coins, Download, FileSearch } from 'lucide-react';
import ModernAdminLayout from '../components/ModernAdminLayout';
import { userAPI, reportsAPI, exportCsvAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { initialsOf } from '../utils/initials';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Toast from '../components/UI/Toast';
import { Modal } from '../components/UI/Modal';
import EmptyState from '../components/UI/EmptyState';
import Skeleton, { SkeletonTable } from '../components/UI/Skeleton';
import ErrorState from '../components/UI/ErrorState';
import DataTable from '../components/UI/DataTable';
import Pagination from '../components/UI/Pagination';
import StatTile from '../components/Dashboard/StatTile';
import MonthlyActivityChart from '../components/Dashboard/MonthlyActivityChart';
import { downloadBlob, buildCsvFilename } from '../utils/download';

const PAGE_SIZE = 10;

const InstallerStatisticsModal = ({ installer, onClose }) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!installer) return;
    setLoading(true);
    setError(null);
    reportsAPI.getInstallerStatistics(installer.id)
      .then((response) => setData(response.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [installer]);

  return (
    <Modal isOpen={!!installer} onClose={onClose} title={installer?.full_name} size="2xl">
      {loading ? (
        <SkeletonTable />
      ) : error ? (
        <ErrorState title={t('unableToLoadPoints')} description={error} />
      ) : data && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              icon={FileSearch}
              onClick={() => navigate(`/warranty-forms?employeeId=${installer.id}`)}
            >
              {t('viewInstallerWarranties')}
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatTile index={0} label={t('warrantyCount')} value={data.totalWarranties} icon={Award} />
            <StatTile index={1} label={t('totalClaimedInventoryLabel')} value={data.totalClaimedInventory} icon={Package} />
            <StatTile index={2} label={t('monthlyPoints')} value={data.monthlyPoints} icon={Coins} />
            <StatTile index={3} label={t('lifetimePoints')} value={data.lifetimePoints} icon={Coins} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-3">{t('topInstalledProductsLabel')}</h3>
            {data.topInstalledProducts.length === 0 ? (
              <EmptyState title={t('noReportDataYet')} icon={Package} />
            ) : (
              <ul className="space-y-2">
                {data.topInstalledProducts.map((p) => (
                  <li key={p.id} className="flex items-center justify-between text-sm border-b border-neutral-100 pb-2 last:border-0">
                    <span className="text-neutral-700">{p.brand} {p.model || ''}</span>
                    <span className="font-semibold text-neutral-900">{p.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-3">{t('activityGraphLabel')}</h3>
            <MonthlyActivityChart data={data.activityGraph} language={language} t={t} />
          </div>
        </div>
      )}
    </Modal>
  );
};

const AdminInstallerStatisticsModern = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInstaller, setSelectedInstaller] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState(null);

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
    return employees.filter((u) => u.full_name?.toLowerCase().includes(q) || u.branch_name?.toLowerCase().includes(q));
  }, [employees, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await exportCsvAPI.installerStatistics();
      downloadBlob(response.data, buildCsvFilename('installer_statistics'));
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setExporting(false);
    }
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
    <Button size="sm" variant="outline" icon={Award} onClick={() => setSelectedInstaller(u)}>
      {t('installerStatistics')}
    </Button>
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
          <h1 className="text-3xl font-semibold text-neutral-900">{t('installerStatistics')}</h1>
          <ErrorState title={t('unableToLoadPoints')} description={error} onRetry={fetchUsers} />
        </div>
      </ModernAdminLayout>
    );
  }

  return (
    <ModernAdminLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">{t('installerStatistics')}</h1>
          <Button variant="outline" icon={Download} loading={exporting} onClick={handleExport}>
            {exporting ? t('exportingCsv') : t('exportCsvAction')}
          </Button>
        </div>

        <Card>
          <CardContent className="p-4">
            <Input
              icon={Search}
              placeholder={t('searchInstallerPlaceholder')}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-neutral-900">{t('installerStatistics')} ({filtered.length})</h2>
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
                  renderMobileCard={(u) => (
                    <div className="border border-neutral-200 rounded-lg p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                          {initialsOf(u.full_name)}
                        </div>
                        <span className="font-medium text-neutral-900 truncate">{u.full_name}</span>
                      </div>
                      {renderActions(u)}
                    </div>
                  )}
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

      <InstallerStatisticsModal installer={selectedInstaller} onClose={() => setSelectedInstaller(null)} />
    </ModernAdminLayout>
  );
};

export default AdminInstallerStatisticsModern;
