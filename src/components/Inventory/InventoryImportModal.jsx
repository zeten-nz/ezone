import { useState, useEffect } from 'react';
import { UploadCloud } from 'lucide-react';
import Autocomplete from '../UI/Autocomplete';
import BranchSelect from '../UI/BranchSelect';
import Button from '../UI/Button';
import { useLanguage } from '../../context/LanguageContext';
import useAdminProductSearch from '../../hooks/useAdminProductSearch';
import { inventoryAPI, branchAPI } from '../../services/api';

/**
 * Warehouse admin picks a synced product, uploads a CSV of bare barcodes
 * (one per line), and sees exact imported/skipped/duplicates/errors counts
 * — see ezone-server/services/inventoryService.js for the exact
 * classification rules this mirrors. Branch ("warehouse", Phase 4) is
 * optional — omitting it keeps imported items unassigned, exactly like
 * every import before Phase 4 existed.
 */
const InventoryImportModal = ({ onImported }) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [product, setProduct] = useState(null);
  const [file, setFile] = useState(null);
  const [branch, setBranch] = useState(null); // selected branch object, null = unassigned
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const { results, loading: searching } = useAdminProductSearch(query);

  useEffect(() => {
    branchAPI.getAll()
      .then((response) => setBranches(response.data))
      .catch(() => setBranches([]))
      .finally(() => setBranchesLoading(false));
  }, []);

  const handleSelectProduct = (p) => {
    setProduct(p);
    setResult(null);
    setError(null);
  };

  const handleQueryChange = (value) => {
    setQuery(value);
    if (product) setProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product || !file) return;
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryAPI.importCsv(product.id, file, branch?.id || undefined);
      setResult(response.data);
      onImported?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Autocomplete
        label={t('product')}
        placeholder={t('productSearchPlaceholder')}
        query={product ? `${product.brand} ${product.model || ''}`.trim() : query}
        onQueryChange={handleQueryChange}
        results={results}
        loading={searching}
        onSelect={handleSelectProduct}
        getOptionLabel={(p) => `${p.brand} ${p.model || ''}`.trim()}
      />

      {/* Searchable branch selector (Beta-1) — ACTIVE branches only for new
          stock imports (the old native select wrongly offered inactive
          ones); leaving it empty keeps the import unassigned, exactly as
          before. */}
      <BranchSelect
        label={t('warehouseLabel')}
        branches={branches}
        loading={branchesLoading}
        value={branch}
        onChange={setBranch}
        allowUnassigned
      />

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">{t('inventoryCsvFile')}</label>
        <input
          type="file"
          accept=".csv,.txt,text/csv,text/plain"
          onChange={(e) => { setFile(e.target.files?.[0] || null); setResult(null); setError(null); }}
          className="block w-full text-sm text-neutral-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:text-sm file:font-medium hover:file:bg-blue-100"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {result && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-lg bg-neutral-50 border border-neutral-200">
          <div>
            <p className="text-xs text-neutral-500">{t('inventoryImported')}</p>
            <p className="text-lg font-semibold text-green-600">{result.imported}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">{t('inventorySkipped')}</p>
            <p className="text-lg font-semibold text-neutral-700">{result.skipped}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">{t('inventoryDuplicates')}</p>
            <p className="text-lg font-semibold text-amber-600">{result.duplicates}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">{t('inventoryErrors')}</p>
            <p className="text-lg font-semibold text-red-600">{result.errors}</p>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" icon={UploadCloud} loading={loading} disabled={!product || !file}>
          {t('inventoryImportAction')}
        </Button>
      </div>
    </form>
  );
};

export default InventoryImportModal;
