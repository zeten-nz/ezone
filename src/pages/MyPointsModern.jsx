import { useState, useEffect } from 'react';
import { Award } from 'lucide-react';
import ModernEmployeeLayout from '../components/ModernEmployeeLayout';
import { pointsAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import EmptyState from '../components/UI/EmptyState';
import { SkeletonTable } from '../components/UI/Skeleton';
import ErrorState from '../components/UI/ErrorState';
import DataTable from '../components/UI/DataTable';
import Pagination from '../components/UI/Pagination';
import StatusBadge from '../components/UI/StatusBadge';

const PAGE_SIZE = 20;

const MyPointsModern = () => {
  const { t } = useLanguage();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1, limit: PAGE_SIZE, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setError(null);
    void (async () => {
      try {
        const response = await pointsAPI.getMine(currentPage, PAGE_SIZE);
        setRows(response.data.data);
        setTotal(response.data.total);
        setPagination(response.data.pagination);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [currentPage, refreshKey]);

  const handleRetry = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  const columns = [
    { key: 'date', header: t('pointsDateColumn'), render: (r) => new Date(r.created_at).toLocaleDateString() },
    {
      key: 'reason',
      header: t('pointsReasonColumn'),
      render: (r) => (
        <div className="min-w-0">
          <p className="text-neutral-900 truncate">{r.reason || '—'}</p>
          {r.product_brand && <p className="text-xs text-neutral-500 mt-0.5">{r.product_brand} {r.product_model || ''}</p>}
        </div>
      ),
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

  const renderMobileCard = (r) => (
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

  if (loading) {
    return (
      <ModernEmployeeLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold text-neutral-900">{t('myPoints')}</h1>
          <SkeletonTable />
        </div>
      </ModernEmployeeLayout>
    );
  }

  if (error) {
    return (
      <ModernEmployeeLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold text-neutral-900">{t('myPoints')}</h1>
          <ErrorState title={t('unableToLoadPoints')} description={error} onRetry={handleRetry} />
        </div>
      </ModernEmployeeLayout>
    );
  }

  return (
    <ModernEmployeeLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">{t('myPoints')}</h1>
          <p className="text-neutral-500 mt-1.5">{t('myPointsSubtitle')}</p>
        </div>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">{t('totalPoints')}</p>
              <p className="text-3xl font-semibold text-neutral-900">{total}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-neutral-900">{t('pointsHistory')}</h2>
          </CardHeader>
          <CardContent>
            {rows.length === 0 ? (
              <EmptyState title={t('noPointsYet')} description={t('noPointsYetDesc')} icon={Award} />
            ) : (
              <div className="space-y-4">
                <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} renderMobileCard={renderMobileCard} />
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
    </ModernEmployeeLayout>
  );
};

export default MyPointsModern;
