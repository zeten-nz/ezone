import { useState, useEffect, useCallback } from 'react';
import { Trophy, Building2, Package, Award, Boxes, TrendingUp, Download, Coins, Warehouse, Clock } from 'lucide-react';
import ModernAdminLayout from '../components/ModernAdminLayout';
import { reportsAPI, exportCsvAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { getDateRangeOptions } from '../config/dateRanges';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Select from '../components/UI/Select';
import Toast from '../components/UI/Toast';
import Skeleton, { SkeletonTable } from '../components/UI/Skeleton';
import ErrorState from '../components/UI/ErrorState';
import EmptyState from '../components/UI/EmptyState';
import DataTable from '../components/UI/DataTable';
import StatTile from '../components/Dashboard/StatTile';
import ProductsInstalledChart from '../components/Dashboard/ProductsInstalledChart';
import MonthlyActivityChart from '../components/Dashboard/MonthlyActivityChart';
import { downloadBlob, buildCsvFilename } from '../utils/download';

const AdminReportsModern = () => {
  const { t, language } = useLanguage();
  const [period, setPeriod] = useState('30');
  const [year] = useState(new Date().getFullYear());

  const [topInstallers, setTopInstallers] = useState([]);
  const [branchRanking, setBranchRanking] = useState([]);
  const [productsInstalled, setProductsInstalled] = useState([]);
  const [monthlyActivity, setMonthlyActivity] = useState([]);
  const [dashboardTotals, setDashboardTotals] = useState(null);
  const [pointsLeaderboard, setPointsLeaderboard] = useState([]);
  const [topWarehouses, setTopWarehouses] = useState([]);
  const [recentImports, setRecentImports] = useState([]);
  const [recentWarrantyActivity, setRecentWarrantyActivity] = useState([]);
  const [recentInventoryActivity, setRecentInventoryActivity] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [
        installersRes, branchesRes, productsRes, monthlyRes,
        totalsRes, leaderboardRes, warehousesRes, importsRes, warrantyActivityRes, inventoryActivityRes,
      ] = await Promise.all([
        reportsAPI.getTopInstallers(period, 10),
        reportsAPI.getBranchRanking(period),
        reportsAPI.getProductsInstalled(),
        reportsAPI.getMonthlyActivity(year),
        reportsAPI.getDashboardTotals(),
        reportsAPI.getPointsLeaderboard('lifetime', 10),
        reportsAPI.getTopWarehouses(),
        reportsAPI.getRecentImports(5),
        reportsAPI.getRecentWarrantyActivity(5),
        reportsAPI.getRecentInventoryActivity(5),
      ]);
      setTopInstallers(installersRes.data);
      setBranchRanking(branchesRes.data);
      setProductsInstalled(productsRes.data);
      setMonthlyActivity(monthlyRes.data.months);
      setDashboardTotals(totalsRes.data);
      setPointsLeaderboard(leaderboardRes.data);
      setTopWarehouses(warehousesRes.data);
      setRecentImports(importsRes.data);
      setRecentWarrantyActivity(warrantyActivityRes.data);
      setRecentInventoryActivity(inventoryActivityRes.data);
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

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await exportCsvAPI.reports();
      downloadBlob(response.data, buildCsvFilename('reports'));
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setExporting(false);
    }
  };

  // topInstallers/branchRanking rank by warranty count — a different,
  // equally legitimate ranking from pointsLeaderboard (most points earned).
  // See reportsController.js's getTopInstallers doc comment.
  const totalWarranties = topInstallers.reduce((sum, i) => sum + i.warranty_count, 0);
  const totalEquipment = productsInstalled.reduce((sum, p) => sum + p.count, 0);
  const topBranch = branchRanking[0];

  // Rank is precomputed onto each row (rather than read from a render-callback
  // index) since DataTable's column/mobile-card renderers only ever receive
  // the row itself, not its position in the array.
  const rankedInstallers = topInstallers.map((r, i) => ({ ...r, rank: i + 1 }));
  const rankedBranches = branchRanking.map((r, i) => ({ ...r, rank: i + 1 }));
  const rankedPoints = pointsLeaderboard.map((r, i) => ({ ...r, rank: i + 1 }));

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

  const pointsColumns = [
    { key: 'rank', header: '#', render: (r) => <span className="text-neutral-400">{r.rank}</span> },
    { key: 'installer', header: t('employee'), render: (r) => r.full_name },
    { key: 'branch', header: t('branch'), render: (r) => r.branch_name || '—' },
    { key: 'total', header: t('totalPoints'), render: (r) => <span className="font-semibold text-neutral-900">{r.total}</span> },
  ];

  const warehouseColumns = [
    { key: 'name', header: t('warehouseLabel'), render: (r) => r.branch_name || t('unassignedWarehouse') },
    { key: 'total', header: t('totalInventoryLabel'), render: (r) => <span className="font-semibold text-neutral-900">{r.total}</span> },
    { key: 'installed', header: t('installedStockLabel'), render: (r) => r.installed },
  ];

  const successPct = dashboardTotals?.warrantySuccessRate != null
    ? `${(dashboardTotals.warrantySuccessRate * 100).toFixed(1)}%`
    : '—';

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
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">{t('reportsDashboard')}</h1>
            <p className="text-neutral-500 mt-1.5">{t('reportsSubtitle')}</p>
          </div>
          <div className="flex gap-3">
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              options={getDateRangeOptions(t)}
              className="w-44"
            />
            <Button variant="outline" icon={Download} loading={exporting} onClick={handleExport}>
              {exporting ? t('exportingCsv') : t('exportCsvAction')}
            </Button>
          </div>
        </div>

        {dashboardTotals && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile index={0} label={t('totalProductsLabel')} value={dashboardTotals.totalProducts} icon={Package} />
            <StatTile index={1} label={t('totalInventoryLabel')} value={dashboardTotals.totalInventory} icon={Boxes} />
            <StatTile index={2} label={t('installedProductsLabel')} value={dashboardTotals.installedProducts} icon={TrendingUp} />
            <StatTile index={3} label={t('availableInventoryLabel')} value={dashboardTotals.availableInventory} icon={Boxes} />
            <StatTile index={4} label={t('damagedInventoryLabel')} value={dashboardTotals.damagedInventory} icon={Boxes} />
            <StatTile index={5} label={t('lostInventoryLabel')} value={dashboardTotals.lostInventory} icon={Boxes} />
            <StatTile index={6} label={t('returnedInventoryLabel')} value={dashboardTotals.returnedInventory} icon={Boxes} />
            <StatTile index={7} label={t('importedTodayLabel')} value={dashboardTotals.importedToday} icon={Clock} />
            <StatTile index={8} label={t('importedThisMonthLabel')} value={dashboardTotals.importedThisMonth} icon={Clock} />
            <StatTile index={9} label={t('warrantyCount')} value={dashboardTotals.warrantyCount} icon={Award} />
            <StatTile index={10} label={t('warrantySuccessRateLabel')} value={successPct} icon={TrendingUp} />
            <StatTile index={11} label={t('topBranch')} value={topBranch?.branch_name || '—'} icon={Building2} />
          </div>
        )}

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
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Coins className="w-4 h-4 text-blue-600" />
                </div>
                <h2 className="text-base font-semibold text-neutral-900">{t('pointsLeaderboardLabel')}</h2>
              </div>
            </CardHeader>
            <CardContent>
              {pointsLeaderboard.length === 0 ? (
                <EmptyState title={t('noReportDataYet')} description={t('noReportDataYetDesc')} icon={Coins} />
              ) : (
                <DataTable
                  columns={pointsColumns}
                  rows={rankedPoints}
                  rowKey={(r) => r.installer_id}
                  renderMobileCard={(r) => (
                    <div className="border border-neutral-200 rounded-lg p-4 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="font-medium text-neutral-900 truncate">{r.rank}. {r.full_name}</p>
                        <p className="text-xs text-neutral-500">{r.branch_name || '—'}</p>
                      </div>
                      <p className="font-semibold text-neutral-900">{r.total}</p>
                    </div>
                  )}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Warehouse className="w-4 h-4 text-blue-600" />
                </div>
                <h2 className="text-base font-semibold text-neutral-900">{t('topWarehousesLabel')}</h2>
              </div>
            </CardHeader>
            <CardContent>
              {topWarehouses.length === 0 ? (
                <EmptyState title={t('noReportDataYet')} description={t('noReportDataYetDesc')} icon={Warehouse} />
              ) : (
                <DataTable
                  columns={warehouseColumns}
                  rows={topWarehouses}
                  rowKey={(r) => r.branch_id}
                  renderMobileCard={(r) => (
                    <div className="border border-neutral-200 rounded-lg p-4 flex items-center justify-between">
                      <p className="font-medium text-neutral-900 truncate">{r.branch_name || t('unassignedWarehouse')}</p>
                      <p className="font-semibold text-neutral-900">{r.total}</p>
                    </div>
                  )}
                />
              )}
            </CardContent>
          </Card>
        </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader><h2 className="text-base font-semibold text-neutral-900">{t('recentImportsLabel')}</h2></CardHeader>
            <CardContent>
              {recentImports.length === 0 ? (
                <EmptyState title={t('noReportDataYet')} icon={Boxes} />
              ) : (
                <ul className="space-y-3">
                  {recentImports.map((b) => (
                    <li key={b.id} className="text-sm">
                      <p className="font-medium text-neutral-900">{b.product_brand} {b.product_model || ''}</p>
                      <p className="text-xs text-neutral-500">{b.imported_count} imported — {new Date(b.created_at).toLocaleDateString()}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h2 className="text-base font-semibold text-neutral-900">{t('recentWarrantyActivityLabel')}</h2></CardHeader>
            <CardContent>
              {recentWarrantyActivity.length === 0 ? (
                <EmptyState title={t('noReportDataYet')} icon={Award} />
              ) : (
                <ul className="space-y-3">
                  {recentWarrantyActivity.map((w) => (
                    <li key={w.id} className="text-sm">
                      <p className="font-medium text-neutral-900 truncate">{w.owner_full_name}</p>
                      <p className="text-xs text-neutral-500">{w.employee_name} — {new Date(w.created_at).toLocaleDateString()}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h2 className="text-base font-semibold text-neutral-900">{t('recentInventoryActivityLabel')}</h2></CardHeader>
            <CardContent>
              {recentInventoryActivity.length === 0 ? (
                <EmptyState title={t('noReportDataYet')} icon={Boxes} />
              ) : (
                <ul className="space-y-3">
                  {recentInventoryActivity.map((a) => (
                    <li key={a.id} className="text-sm">
                      <p className="font-medium text-neutral-900 font-mono">{a.barcode}</p>
                      <p className="text-xs text-neutral-500">{a.from_status || '—'} → {a.to_status} — {new Date(a.created_at).toLocaleDateString()}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ModernAdminLayout>
  );
};

export default AdminReportsModern;
