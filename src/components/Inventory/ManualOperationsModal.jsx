import { useState, useEffect } from 'react';
import BranchSelect from '../UI/BranchSelect';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Select from '../UI/Select';
import { useLanguage } from '../../context/LanguageContext';
import { inventoryAPI } from '../../services/api';

const STATUS_OPTIONS = ['IN_STOCK', 'RESERVED', 'INSTALLED', 'RETURNED', 'DAMAGED', 'LOST'];

/**
 * One modal body for all 4 Super-Admin-only manual inventory operations
 * (Phase 4) — sharing the required `reason` field and submit/error/loading
 * plumbing rather than 4 near-identical modal files. `mode` picks which
 * fields render and which endpoint fires; every mode's mutation is
 * guarded server-side (see inventoryService.js) — this component only
 * handles the form, never assumes success before the API confirms it.
 */
const ManualOperationsModal = ({ item, mode, branches, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [reason, setReason] = useState('');
  const [toStatus, setToStatus] = useState('');
  // Selected branch OBJECT (null = unassign) — pre-resolved from the item's
  // current branch_id so the transfer form opens showing the current
  // warehouse, exactly as the old select did.
  const [branch, setBranch] = useState(
    () => branches.find((b) => String(b.id) === String(item?.branch_id)) || null
  );
  const [newBarcode, setNewBarcode] = useState('');
  const [canonicalItemId, setCanonicalItemId] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mode !== 'merge' || !item) return;
    setLoadingCandidates(true);
    inventoryAPI.getAll(1, 50, { productId: item.product_id, status: 'IN_STOCK' })
      .then((response) => setCandidates(response.data.data.filter((c) => c.id !== item.id)))
      .catch(() => setCandidates([]))
      .finally(() => setLoadingCandidates(false));
  }, [mode, item]);

  const titleKey = {
    status: 'changeStatusAction',
    branch: 'transferBranchAction',
    barcode: 'correctBarcodeAction',
    merge: 'mergeDuplicateAction',
  }[mode];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (mode === 'status') {
        await inventoryAPI.changeStatus(item.id, item.status, toStatus, reason);
      } else if (mode === 'branch') {
        await inventoryAPI.transferBranch(item.id, branch ? branch.id : null, reason);
      } else if (mode === 'barcode') {
        await inventoryAPI.correctBarcode(item.id, newBarcode, reason);
      } else if (mode === 'merge') {
        await inventoryAPI.mergeDuplicate(item.id, canonicalItemId, reason);
      }
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const canSubmit = reason.trim() && (
    (mode === 'status' && toStatus && toStatus !== item.status) ||
    mode === 'branch' ||
    (mode === 'barcode' && newBarcode.trim()) ||
    (mode === 'merge' && canonicalItemId)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-neutral-500">
        <span className="font-mono">{item.barcode}</span> — {item.brand} {item.model || ''}
      </p>

      {mode === 'status' && (
        <Select
          label={t('newStatusLabel')}
          value={toStatus}
          onChange={(e) => setToStatus(e.target.value)}
          options={[
            { value: '', label: t('selectOption') },
            ...STATUS_OPTIONS.filter((s) => s !== item.status).map((s) => ({ value: s, label: s })),
          ]}
        />
      )}

      {mode === 'branch' && (
        // Searchable selector (Beta-1) — a TRANSFER is a new assignment, so
        // only ACTIVE branches are offered as targets; clearing the field
        // keeps the existing "unassign" (null) semantics.
        <BranchSelect
          label={t('warehouseLabel')}
          branches={branches}
          value={branch}
          onChange={setBranch}
          allowUnassigned
        />
      )}

      {mode === 'barcode' && (
        <Input
          label={t('newBarcodeLabel')}
          value={newBarcode}
          onChange={(e) => setNewBarcode(e.target.value)}
          required
        />
      )}

      {mode === 'merge' && (
        <Select
          label={t('canonicalItemLabel')}
          value={canonicalItemId}
          onChange={(e) => setCanonicalItemId(e.target.value)}
          options={[
            { value: '', label: loadingCandidates ? t('loadingResults') : t('selectOption') },
            ...candidates.map((c) => ({ value: String(c.id), label: c.barcode })),
          ]}
          disabled={loadingCandidates}
        />
      )}

      <Input
        label={t('reasonLabel')}
        placeholder={t('reasonPlaceholderGeneric')}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        required
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onClose}>{t('cancel')}</Button>
        <Button type="submit" loading={saving} disabled={!canSubmit}>{t(titleKey)}</Button>
      </div>
    </form>
  );
};

export default ManualOperationsModal;
