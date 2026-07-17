import { useState, useEffect } from 'react';
import { Warehouse, Boxes, TrendingUp, Download } from 'lucide-react';
import ModernAdminLayout from '../components/ModernAdminLayout';
import { branchAPI, reportsAPI, exportCsvAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Select from '../components/UI/Select';
import Toast from '../components/UI/Toast';
import EmptyState from '../components/UI/EmptyState';
import { SkeletonTable } from '../components/UI/Skeleton';
import ErrorState from '../components/UI/ErrorState';
import StatTile from '../components/Dashboard/StatTile';
import { downloadBlob, buildCsvFilename } from '../utils/download';

const AdminWarehouseStatisticsModern = () => {
  const { t } = useLanguage();
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    branchAPI.getAll().then((response) => setBranches(response.data)).catch(() => setBranches([]));
  }, []);

  useEffect(() => {
    if (!branchId) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    reportsAPI.getWarehouseStatistics(branchId)
      .then((response) => setData(response.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [branchId]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await exportCsvAPI.warehouseStatistics();
      downloadBlob(response.data, buildCsvFilename('warehouse_statistics'));
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setExporting(false);
    }
  };

  return (
    <ModernAdminLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">{t('warehouseStatistics')}</h1>
          <Button variant="outline" icon={Download} loading={exporting} onClick={handleExport}>
            {exporting ? t('exportingCsv') : t('exportCsvAction')}
          </Button>
        </div>

        <Card>
          <CardContent className="p-4">
            <Select
              label={t('warehouseLabel')}
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              options={[{ value: '', label: t('selectWarehousePlaceholder') }, ...branches.map((b) => ({ value: String(b.id), label: b.name }))]}
            />
          </CardContent>
        </Card>

        {!branchId ? (
          <EmptyState title={t('selectWarehousePlaceholder')} icon={Warehouse} />
        ) : loading ? (
          <Card><CardContent className="p-4"><SkeletonTable /></CardContent></Card>
        ) : error ? (
          <ErrorState title={t('unableToLoadReports')} description={error} />
        ) : data && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <StatTile index={0} label={t('currentStockLabel')} value={data.currentStock} icon={Boxes} />
              <StatTile index={1} label={t('installedStockLabel')} value={data.installedStock} icon={TrendingUp} />
              <StatTile index={2} label={t('reservedStockLabel')} value={data.reservedStock} icon={Boxes} />
              <StatTile index={3} label={t('damagedInventoryLabel')} value={data.damagedStock} icon={Boxes} />
              <StatTile index={4} label={t('returnedInventoryLabel')} value={data.returnedStock} icon={Boxes} />
              <StatTile index={5} label={t('lostInventoryLabel')} value={data.lostStock} icon={Boxes} />
            </div>

            <Card>
              <CardHeader><h2 className="text-base font-semibold text-neutral-900">{t('movementHistoryLabel')}</h2></CardHeader>
              <CardContent>
                {data.movementHistory.length === 0 ? (
                  <EmptyState title={t('noReportDataYet')} icon={Boxes} />
                ) : (
                  <ul className="space-y-3">
                    {data.movementHistory.map((a) => (
                      <li key={a.id} className="text-sm border-b border-neutral-100 pb-2 last:border-0">
                        <p className="font-medium text-neutral-900 font-mono">{a.barcode}</p>
                        <p className="text-xs text-neutral-500">{a.brand} {a.model || ''} — {a.from_status || '—'} → {a.to_status} — {new Date(a.created_at).toLocaleDateString()}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ModernAdminLayout>
  );
};

export default AdminWarehouseStatisticsModern;
