import { useState, useEffect } from 'react';
import { Search, Coins, Save } from 'lucide-react';
import ModernAdminLayout from '../components/ModernAdminLayout';
import { pointsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Toast from '../components/UI/Toast';
import EmptyState from '../components/UI/EmptyState';
import { SkeletonTable } from '../components/UI/Skeleton';
import ErrorState from '../components/UI/ErrorState';
import DataTable from '../components/UI/DataTable';
import Pagination from '../components/UI/Pagination';

const PAGE_SIZE = 20;

// Editable-in-place points cell — a Super Admin can type a new value and
// save it; a plain Admin sees the current value read-only (view-only per the
// Phase 3 plan's permission model — only Super Admins configure point values).
const PointsCell = ({ productId, points, canEdit, onSaved }) => {
  const { t } = useLanguage();
  const [value, setValue] = useState(String(points));
  const [saving, setSaving] = useState(false);
  const dirty = value !== String(points);

  const handleSave = async () => {
    const parsed = parseInt(value, 10);
    if (!Number.isInteger(parsed) || parsed < 0) return;
    setSaving(true);
    try {
      await pointsAPI.setProductConfig(productId, parsed);
      onSaved(parsed);
    } finally {
      setSaving(false);
    }
  };

  if (!canEdit) {
    return <span className="font-medium text-neutral-900">{points}</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-20 px-2 py-1.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
      />
      {dirty && (
        <Button size="sm" variant="outline" icon={Save} loading={saving} onClick={handleSave}>
          {t('savePointValue')}
        </Button>
      )}
    </div>
  );
};

const AdminPointsConfigModern = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const canEdit = !!user?.is_super_admin;

  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1, limit: PAGE_SIZE, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setError(null);
    void (async () => {
      try {
        const response = await pointsAPI.getProductConfigs(currentPage, PAGE_SIZE, search || undefined);
        setRows(response.data.data);
        setPagination(response.data.pagination);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [currentPage, search, refreshKey]);

  const handleRetry = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleSaved = (productId, newPoints) => {
    setRows((prev) => prev.map((r) => (r.product_id === productId ? { ...r, points: newPoints } : r)));
    setToast({ type: 'success', message: t('pointValueUpdated') });
  };

  const columns = [
    {
      key: 'product',
      header: t('product'),
      render: (r) => (
        <div className="min-w-0">
          <p className="font-medium text-neutral-900 truncate">{r.brand} {r.model || ''}</p>
          <p className="text-xs text-neutral-500 mt-0.5">{r.category}</p>
        </div>
      ),
    },
    {
      key: 'points',
      header: t('pointValueLabel'),
      render: (r) => (
        <PointsCell
          productId={r.product_id}
          points={r.points}
          canEdit={canEdit}
          onSaved={(newPoints) => handleSaved(r.product_id, newPoints)}
        />
      ),
    },
  ];

  const renderMobileCard = (r) => (
    <div className="border border-neutral-200 rounded-lg p-4 space-y-3">
      <div>
        <p className="font-medium text-neutral-900 truncate">{r.brand} {r.model || ''}</p>
        <p className="text-xs text-neutral-500 mt-0.5">{r.category}</p>
      </div>
      <PointsCell
        productId={r.product_id}
        points={r.points}
        canEdit={canEdit}
        onSaved={(newPoints) => handleSaved(r.product_id, newPoints)}
      />
    </div>
  );

  if (loading) {
    return (
      <ModernAdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold text-neutral-900">{t('pointsConfig')}</h1>
          <SkeletonTable />
        </div>
      </ModernAdminLayout>
    );
  }

  if (error) {
    return (
      <ModernAdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold text-neutral-900">{t('pointsConfig')}</h1>
          <ErrorState title={t('unableToLoadPoints')} description={error} onRetry={handleRetry} />
        </div>
      </ModernAdminLayout>
    );
  }

  return (
    <ModernAdminLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">{t('pointsConfig')}</h1>
          <p className="text-neutral-500 mt-1.5">{t('pointsConfigSubtitle')}</p>
        </div>

        {!canEdit && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {t('superAdminOnlyHint')}
          </div>
        )}

        <Card>
          <CardContent className="p-4">
            <Input
              icon={Search}
              placeholder={t('productSearchPlaceholder')}
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-neutral-900">{t('products')} ({pagination.totalItems})</h2>
          </CardHeader>
          <CardContent>
            {rows.length === 0 ? (
              <EmptyState title={t('noResultsFound')} icon={Coins} />
            ) : (
              <div className="space-y-4">
                <DataTable columns={columns} rows={rows} rowKey={(r) => r.product_id} renderMobileCard={renderMobileCard} />
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
    </ModernAdminLayout>
  );
};

export default AdminPointsConfigModern;
