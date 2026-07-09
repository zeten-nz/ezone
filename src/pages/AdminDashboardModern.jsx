import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, CalendarRange, Building2, Download, ListChecks, UserCog, FileSpreadsheet } from 'lucide-react';
import ModernAdminLayout from '../components/ModernAdminLayout';
import { dashboardAPI, exportAPI } from '../services/api';
import { downloadBlob, buildExportFilename } from '../utils/download';
import { getDateRangeOptions } from '../config/dateRanges';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Select from '../components/UI/Select';
import Toast from '../components/UI/Toast';
import Skeleton from '../components/UI/Skeleton';
import ErrorState from '../components/UI/ErrorState';
import StatTile from '../components/Dashboard/StatTile';
import SubmissionsTrendChart from '../components/Dashboard/SubmissionsTrendChart';
import FuelTypeSplit from '../components/Dashboard/FuelTypeSplit';
import TopOrganizations from '../components/Dashboard/TopOrganizations';
import RecentSubmissions from '../components/Dashboard/RecentSubmissions';
import QuickActions from '../components/Dashboard/QuickActions';
import NotificationsPanel from '../components/UI/NotificationsPanel';
import SystemStatus from '../components/Dashboard/SystemStatus';

const AdminDashboardModern = () => {
  const { t, language } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedDays, setSelectedDays] = useState('all');
  const [toast, setToast] = useState(null);
  const [syncedAt, setSyncedAt] = useState(null);

  useEffect(() => {
    if (refreshKey > 0) setRefreshing(true);
    setError(null);
    void (async () => {
      try {
        const response = await dashboardAPI.getDashboard();
        setData(response.data);
        setSyncedAt(new Date());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    })();
  }, [refreshKey]);

  const handleRetry = () => setRefreshKey((k) => k + 1);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await exportAPI.exportWarrantyForms(selectedDays, language);
      downloadBlob(response.data, buildExportFilename('warranty_forms', selectedDays));
      setToast({ type: 'success', message: t('exportToExcel') });
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setExporting(false);
    }
  };

  // Every number below is derived directly from real fields returned by
  // /api/dashboard — no fabricated trend percentages or placeholder stats.
  const derived = useMemo(() => {
    const daily = data?.forms_last_14_days || [];
    const last7 = daily.slice(7, 14).reduce((sum, d) => sum + d.count, 0);
    const prev7 = daily.slice(0, 7).reduce((sum, d) => sum + d.count, 0);
    const weekDelta = prev7 > 0 ? Math.round(((last7 - prev7) / prev7) * 100) : null;
    const sparkline = daily.map((d) => d.count);
    const topOrg = data?.top_organizations?.[0];

    return { last7, weekDelta, sparkline, topOrgName: topOrg?.name, topOrgCount: topOrg?.count };
  }, [data]);

  if (loading) {
    return (
      <ModernAdminLayout>
        <div className="space-y-8">
          <div className="space-y-2">
            <Skeleton height="h-9" width="w-64" />
            <Skeleton height="h-5" width="w-96" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}><CardContent className="p-6 space-y-3">
                <Skeleton height="h-4" width="w-24" />
                <Skeleton height="h-8" width="w-16" />
              </CardContent></Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2"><CardContent className="p-6"><Skeleton height="h-64" /></CardContent></Card>
            <Card><CardContent className="p-6 space-y-4">
              <Skeleton height="h-3" count={4} />
            </CardContent></Card>
          </div>
        </div>
      </ModernAdminLayout>
    );
  }

  if (error) {
    return (
      <ModernAdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold text-neutral-900">{t('dashboard')}</h1>
          <ErrorState title={t('unableToLoadDashboard')} description={error} onRetry={handleRetry} />
        </div>
      </ModernAdminLayout>
    );
  }

  return (
    <ModernAdminLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">{t('dashboard')}</h1>
          <p className="text-neutral-500 mt-1.5">{t('dashboardSubtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatTile index={0} label={t('totalEmployees')} value={data?.total_employees || 0} icon={Users} />
          <StatTile index={1} label={t('totalForms')} value={data?.total_forms || 0} icon={FileText} />
          <StatTile
            index={2}
            label={t('thisWeek')}
            value={derived.last7}
            icon={CalendarRange}
            delta={derived.weekDelta}
            deltaLabel={derived.weekDelta === null ? undefined : (language === 'ru' ? 'за неделю' : 'haftada')}
            sparkline={derived.sparkline}
          />
          <StatTile
            index={3}
            label={t('topBranch')}
            value={derived.topOrgName || '—'}
            icon={Building2}
            deltaLabel={derived.topOrgCount ? `${derived.topOrgCount} ${t('submissionsUnit')}` : undefined}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-base font-semibold text-neutral-900">{t('submissionsTrend')}</h2>
              </CardHeader>
              <CardContent>
                <SubmissionsTrendChart data={data?.forms_last_14_days || []} language={language} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex items-center justify-between flex-row">
                <h2 className="text-base font-semibold text-neutral-900">{t('recentSubmissions')}</h2>
                <Link to="/warranty-forms" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  {t('viewAll')}
                </Link>
              </CardHeader>
              <CardContent>
                <RecentSubmissions
                  forms={data?.recent_forms || []}
                  language={language}
                  emptyTitle={t('noRecentSubmissions')}
                  emptyDescription={t('noRecentSubmissionsDesc')}
                  labels={{
                    vehicle: t('vehicle'),
                    owner: t('owner'),
                    employee: t('employee'),
                    fuelType: t('fuelType'),
                    date: t('date'),
                  }}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-base font-semibold text-neutral-900">{t('fuelTypeBreakdown')}</h2>
              </CardHeader>
              <CardContent>
                <FuelTypeSplit data={data?.fuel_type_breakdown || []} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-base font-semibold text-neutral-900">{t('topOrganizations')}</h2>
              </CardHeader>
              <CardContent>
                <TopOrganizations data={data?.top_organizations || []} emptyLabel={t('noRecentSubmissions')} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-base font-semibold text-neutral-900">{t('quickActions')}</h2>
              </CardHeader>
              <CardContent>
                <QuickActions
                  actions={[
                    { label: t('qaViewForms'), icon: ListChecks, to: '/warranty-forms' },
                    { label: t('qaManageUsers'), icon: UserCog, to: '/users' },
                    { label: t('qaExportReport'), icon: FileSpreadsheet, onClick: () => document.getElementById('export-card')?.scrollIntoView({ behavior: 'smooth' }) },
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-base font-semibold text-neutral-900">{t('notifications')}</h2>
              </CardHeader>
              <CardContent>
                <NotificationsPanel title={t('noNotifications')} description={t('noNotificationsDesc')} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-base font-semibold text-neutral-900">{t('systemStatus')}</h2>
              </CardHeader>
              <CardContent>
                <SystemStatus
                  apiLabel={t('apiOnline')}
                  dbLabel={t('databaseConnected')}
                  lastSyncedLabel={t('lastSynced')}
                  syncedAt={syncedAt ? syncedAt.toLocaleTimeString(language === 'ru' ? 'ru-RU' : 'uz-UZ', { hour: '2-digit', minute: '2-digit' }) : '—'}
                  refreshLabel={t('refresh')}
                  onRefresh={handleRetry}
                  refreshing={refreshing}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <Card id="export-card">
          <CardHeader>
            <h2 className="text-base font-semibold text-neutral-900">{t('exportData')}</h2>
            <p className="text-sm text-neutral-500 mt-1">{t('exportWarrantyDataDesc')}</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 md:items-end">
              <Select
                label={t('timePeriod')}
                value={selectedDays}
                onChange={(e) => setSelectedDays(e.target.value)}
                options={getDateRangeOptions(t)}
              />
              <Button onClick={handleExport} loading={exporting} icon={Download} className="md:w-auto">
                {exporting ? t('exportingLabel') : t('exportToExcel')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModernAdminLayout>
  );
};

export default AdminDashboardModern;
