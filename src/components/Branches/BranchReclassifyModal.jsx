import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import Button from '../UI/Button';
import Select from '../UI/Select';
import StatusBadge from '../UI/StatusBadge';
import { useLanguage } from '../../context/LanguageContext';
import { branchTypeFilterOptions } from '../../config/branchTypes';

/**
 * Deliberate branch-type CORRECTION (Beta-2.1) — an exceptional Super-Admin
 * recovery operation, never casual editing: the ordinary branch form keeps
 * classification read-only, and this modal shows current vs. target,
 * explains the corrective nature, and requires explicit confirmation.
 * "Tayinlanmagan" as a target = reset to unclassified (the backend rejects
 * it whenever a managed employee still establishes a type).
 */
const BranchReclassifyModal = ({ branch, onConfirm, onCancel, submitting }) => {
  const { t } = useLanguage();
  const current = branch.branch_type || null;
  const [target, setTarget] = useState(current ?? 'UNCLASSIFIED');
  // Reuse the filter option set minus 'ALL' — the remaining values are
  // exactly the valid targets (3 types + Tayinlanmagan/reset).
  const options = branchTypeFilterOptions(t).filter((o) => o.value !== 'ALL');
  const targetValue = target === 'UNCLASSIFIED' ? null : target;
  const isNoop = targetValue === current;

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex gap-2">
        <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>{t('reclassifyBranchWarning')}</p>
      </div>

      <div className="text-sm space-y-2">
        <p className="text-neutral-500">
          <span className="font-mono text-neutral-900">{branch.code}</span> — {branch.name}
        </p>
        <p className="flex items-center gap-2 text-neutral-700">
          {t('currentTypeLabel')}: <StatusBadge status={`BRANCH_TYPE_${current || 'UNCLASSIFIED'}`} />
        </p>
      </div>

      <Select
        label={t('newTypeLabel')}
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        options={options}
      />

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>{t('cancel')}</Button>
        <Button
          type="button"
          variant="danger"
          loading={submitting}
          disabled={isNoop || submitting}
          onClick={() => onConfirm(targetValue)}
        >
          {t('reclassifyBranchAction')}
        </Button>
      </div>
    </div>
  );
};

export default BranchReclassifyModal;
