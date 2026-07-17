import { useState, useEffect } from 'react';
import { Award, Package, TrendingUp, XCircle, Coins } from 'lucide-react';
import ModernEmployeeLayout from '../components/ModernEmployeeLayout';
import { reportsAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent } from '../components/UI/Card';
import EmptyState from '../components/UI/EmptyState';
import { SkeletonTable } from '../components/UI/Skeleton';
import ErrorState from '../components/UI/ErrorState';
import StatTile from '../components/Dashboard/StatTile';
import MonthlyActivityChart from '../components/Dashboard/MonthlyActivityChart';

// Always the authenticated user's own statistics — GET /reports/my-statistics
// is scoped server-side by req.user.id, mirroring GET /points/mine exactly
// (see reportsController.js's getMyStatistics). No installerId is ever
// accepted from this page.
const MyStatisticsModern = () => {
  const { t, language } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    reportsAPI.getMyStatistics()
      .then((response) => setData(response.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <ModernEmployeeLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold text-neutral-900">{t('myStatistics')}</h1>
          <SkeletonTable />
        </div>
      </ModernEmployeeLayout>
    );
  }

  if (error) {
    return (
      <ModernEmployeeLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold text-neutral-900">{t('myStatistics')}</h1>
          <ErrorState title={t('unableToLoadReports')} description={error} onRetry={fetchData} />
        </div>
      </ModernEmployeeLayout>
    );
  }

  return (
    <ModernEmployeeLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">{t('myStatistics')}</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatTile index={0} label={t('warrantyCount')} value={data.totalWarranties} icon={Award} />
          <StatTile index={1} label={t('totalClaimedInventoryLabel')} value={data.totalClaimedInventory} icon={Package} />
          <StatTile index={2} label={t('successfulInstallsLabel')} value={data.successfulInstalls} icon={TrendingUp} />
          <StatTile index={3} label={t('rejectedInstallsLabel')} value={data.rejectedInstalls} icon={XCircle} />
          <StatTile index={4} label={t('monthlyPoints')} value={data.monthlyPoints} icon={Coins} />
          <StatTile index={5} label={t('lifetimePoints')} value={data.lifetimePoints} icon={Coins} />
        </div>

        <Card>
          <CardContent className="p-6">
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
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-3">{t('activityGraphLabel')}</h3>
            <MonthlyActivityChart data={data.activityGraph} language={language} t={t} />
          </CardContent>
        </Card>
      </div>
    </ModernEmployeeLayout>
  );
};

export default MyStatisticsModern;
