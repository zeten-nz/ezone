import { useState, useEffect, useCallback } from 'react';
import { Trophy, Building2, Package, Award } from 'lucide-react';
import ModernAdminLayout from '../components/ModernAdminLayout';
import { reportsAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { getDateRangeOptions } from '../config/dateRanges';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Select from '../components/UI/Select';
import Skeleton, { SkeletonTable } from '../components/UI/Skeleton';
import ErrorState from '../components/UI/ErrorState';
import EmptyState from '../components/UI/EmptyState';
import DataTable from '../components/UI/DataTable';
import StatTile from '../components/Dashboard/StatTile';
import ProductsInstalledChart from '../components/Dashboard/ProductsInstalledChart';
import MonthlyActivityChart from '../components/Dashboard/MonthlyActivityChart';

const AdminReportsModern = () => {
  const { t, language } = useLanguage();
  const [period, setPeriod] = useState('30');
  const [year] = useState(new Date().getFullYear());

  const [topInstallers, setTopInstallers] = useState([]);
  const [branchRanking, setBranchRanking] = useState([]);
  const [productsInstalled, setProductsInstalled] = useState([]);
  const [monthlyActivity, setMonthlyActivity] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [installersRes, branchesRes, productsRes, monthlyRes] = await Promise.all([
        reportsAPI.getTopInstallers(period, 10),
        reportsAPI.getBranchRanking(period),
        reportsAPI.getProductsInstalled(),
        reportsAPI.getMonthlyActivity(year),
      ]);
      setTopInstallers(installersRes.data);
      setBranchRanking(branchesRes.data);
      setProductsInstalled(productsRes.data);
      setMonthlyActivity(monthlyRes.data.months);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [period, year]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll, refreshKey]);

  const handleRetry = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  // Ranked by warranty count, not points — reward_points is a future-only
  // field (null until the external STAG validation API responds), so
  // there's nothing real to sum yet. See reportsController.js.
  const totalWarranties = topInstallers.reduce((sum, i) => sum + i.warranty_count, 0);
  const totalEquipment = productsInstalled.reduce((sum, p) => sum + p.count, 0);
  const topBranch = branchRanking[0];

  // Rank is precomputed onto each row (rather than read from a render-callback
  // index) since DataTable's column/mobile-card renderers only ever receive
  // the row itself, not its position in the array.
  const rankedInstallers = topInstallers.map((r, i) => ({ ...r, rank: i + 1 }));
  const rankedBranches = branchRanking.map((r, i) => ({ ...r, rank: i + 1 }));

  const installerColumns = [
    { key: 'rank', header: '#', render: (r) => <span className="text-neutral-400">{r.rank}</span> },
    { key: 'employee', header: t('employee'), render: (r) => r.employee_name },
    { key: 'branch', header: t('branch'), render: (r) => r.branch_name || '—' },
    { key: 'count', header: t('warrantyCount'), render: (r) => <span className="font-semibold text-neutral-900">{r.warranty_count}</span> },
  ];

  const branchColumns = [
    { key: 'rank', header: '#', render: (r) => <span className="text-neutral-400">{r.rank}</span> },
    { key: 'branch', header: t('branch'), render: (r) => r.branch_name },
    { key: 'code', header: t('branchCode'), render: (r) => <span className="font-mono text-xs">{r.branch_code}</span> },
    { key: 'count', header: t('warrantyCount'), render: (r) => <span className="font-semibold text-neutral-900">{r.warranty_count}</span> },
  ];

  if (loading) {
    return (
      <ModernAdminLayout>
        <div className="space-y-6">
          <Skeleton height="h-9" width="w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton height="h-28" /><Skeleton height="h-28" /><Skeleton height="h-28" />
          </div>
          <Card><CardContent className="p-4"><SkeletonTable /></CardContent></Card>
        </div>
      </ModernAdminLayout>
    );
  }

  if (error) {
    return (
      <ModernAdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold text-neutral-900">{t('reports')}</h1>
          <ErrorState title={t('unableToLoadReports')} description={error} onRetry={handleRetry} />
        </div>
      </ModernAdminLayout>
    );
  }

  return (
    <ModernAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">{t('reports')}</h1>
            <p className="text-neutral-500 mt-1.5">{t('reportsSubtitle')}</p>
          </div>
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            options={getDateRangeOptions(t)}
            className="w-44"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatTile index={0} label={t('totalWarrantiesInPeriod')} value={totalWarranties} icon={Award} />
          <StatTile index={1} label={t('totalEquipmentInstalled')} value={totalEquipment} icon={Package} />
          <StatTile index={2} label={t('topBranch')} value={topBranch?.branch_name || '—'} icon={Building2} />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-base font-semibold text-neutral-900">{t('topInstallers')}</h2>
            </div>
          </CardHeader>
          <CardContent>
            {topInstallers.length === 0 ? (
              <EmptyState title={t('noReportDataYet')} description={t('noReportDataYetDesc')} icon={Trophy} />
            ) : (
              <DataTable
                columns={installerColumns}
                rows={rankedInstallers}
                rowKey={(r) => r.employee_id}
                renderMobileCard={(r) => (
                  <div className="border border-neutral-200 rounded-lg p-4 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-neutral-900 truncate">{r.rank}. {r.employee_name}</p>
                      <p className="text-xs text-neutral-500">{r.branch_name || '—'}</p>
                    </div>
                    <p className="font-semibold text-neutral-900">{r.warranty_count}</p>
                  </div>
                )}
              />
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-neutral-900">{t('branchRanking')}</h2>
            </CardHeader>
            <CardContent>
              {branchRanking.length === 0 ? (
                <EmptyState title={t('noReportDataYet')} description={t('noReportDataYetDesc')} icon={Building2} />
              ) : (
                <DataTable
                  columns={branchColumns}
                  rows={rankedBranches}
                  rowKey={(r) => r.branch_id}
                  renderMobileCard={(r) => (
                    <div className="border border-neutral-200 rounded-lg p-4 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="font-medium text-neutral-900 truncate">{r.rank}. {r.branch_name}</p>
                        <p className="text-xs text-neutral-500 font-mono">{r.branch_code}</p>
                      </div>
                      <p className="font-semibold text-neutral-900">{r.warranty_count}</p>
                    </div>
                  )}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-neutral-900">{t('productsInstalledTitle')}</h2>
            </CardHeader>
            <CardContent>
              {productsInstalled.length === 0 ? (
                <EmptyState title={t('noReportDataYet')} description={t('noReportDataYetDesc')} icon={Package} />
              ) : (
                <ProductsInstalledChart data={productsInstalled} t={t} />
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-neutral-900">{t('monthlyActivityTitle')} — {year}</h2>
          </CardHeader>
          <CardContent>
            <MonthlyActivityChart data={monthlyActivity} language={language} t={t} />
          </CardContent>
        </Card>
      </div>
    </ModernAdminLayout>
  );
};

export default AdminReportsModern;
