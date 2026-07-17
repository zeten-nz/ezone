import { useState, useEffect } from 'react';
import { Package, TrendingUp, Boxes, XCircle, RotateCcw, Download } from 'lucide-react';
import ModernAdminLayout from '../components/ModernAdminLayout';
import { reportsAPI, exportCsvAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import useAdminProductSearch from '../hooks/useAdminProductSearch';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Autocomplete from '../components/UI/Autocomplete';
import Toast from '../components/UI/Toast';
import EmptyState from '../components/UI/EmptyState';
import { SkeletonTable } from '../components/UI/Skeleton';
import ErrorState from '../components/UI/ErrorState';
import StatTile from '../components/Dashboard/StatTile';
import { downloadBlob, buildCsvFilename } from '../utils/download';

const AdminProductStatisticsModern = () => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [product, setProduct] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState(null);
  const { results, loading: searching } = useAdminProductSearch(query);

  useEffect(() => {
    if (!product) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    reportsAPI.getProductStatistics(product.id)
      .then((response) => setData(response.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [product]);

  const handleSelectProduct = (p) => {
    setProduct(p);
    setQuery('');
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await exportCsvAPI.productStatistics();
      downloadBlob(response.data, buildCsvFilename('product_statistics'));
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
          <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">{t('productStatistics')}</h1>
          <Button variant="outline" icon={Download} loading={exporting} onClick={handleExport}>
            {exporting ? t('exportingCsv') : t('exportCsvAction')}
          </Button>
        </div>

        <Card>
          <CardContent className="p-4">
            <Autocomplete
              label={t('product')}
              placeholder={t('selectProductPlaceholder')}
              query={product ? `${product.brand} ${product.model || ''}`.trim() : query}
              onQueryChange={(v) => { setQuery(v); if (product) setProduct(null); }}
              results={results}
              loading={searching}
              onSelect={handleSelectProduct}
              getOptionLabel={(p) => `${p.brand} ${p.model || ''}`.trim()}
            />
          </CardContent>
        </Card>

        {!product ? (
          <EmptyState title={t('selectProductPlaceholder')} icon={Package} />
        ) : loading ? (
          <Card><CardContent className="p-4"><SkeletonTable /></CardContent></Card>
        ) : error ? (
          <ErrorState title={t('unableToLoadReports')} description={error} />
        ) : data && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <StatTile index={0} label={t('importedQuantityLabel')} value={data.importedQuantity} icon={Boxes} />
              <StatTile index={1} label={t('installedQuantityLabel')} value={data.installedQuantity} icon={TrendingUp} />
              <StatTile index={2} label={t('remainingStockLabel')} value={data.remainingStock} icon={Package} />
              <StatTile index={3} label={t('failureRateLabel')} value={`${(data.failureRate * 100).toFixed(1)}%`} icon={XCircle} />
              <StatTile index={4} label={t('returnRateLabel')} value={`${(data.returnRate * 100).toFixed(1)}%`} icon={RotateCcw} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><h2 className="text-base font-semibold text-neutral-900">{t('topInstallers')}</h2></CardHeader>
                <CardContent>
                  {data.topInstallers.length === 0 ? (
                    <EmptyState title={t('noReportDataYet')} icon={Package} />
                  ) : (
                    <ul className="space-y-2">
                      {data.topInstallers.map((i) => (
                        <li key={i.id} className="flex items-center justify-between text-sm border-b border-neutral-100 pb-2 last:border-0">
                          <span className="text-neutral-700">{i.full_name}</span>
                          <span className="font-semibold text-neutral-900">{i.count}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><h2 className="text-base font-semibold text-neutral-900">{t('topBranchesLabel')}</h2></CardHeader>
                <CardContent>
                  {data.topBranches.length === 0 ? (
                    <EmptyState title={t('noReportDataYet')} icon={Package} />
                  ) : (
                    <ul className="space-y-2">
                      {data.topBranches.map((b) => (
                        <li key={b.id} className="flex items-center justify-between text-sm border-b border-neutral-100 pb-2 last:border-0">
                          <span className="text-neutral-700">{b.name}</span>
                          <span className="font-semibold text-neutral-900">{b.count}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </ModernAdminLayout>
  );
};

export default AdminProductStatisticsModern;
