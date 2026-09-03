import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import Button from '../UI/Button';
import Input from '../UI/Input';
import BranchSelect from '../UI/BranchSelect';
import { useLanguage } from '../../context/LanguageContext';
import { branchAPI } from '../../services/api';
import { parseManagedUsernamePreview } from '../../utils/managedUsernamePreview';
import { getBranchTypeLabel } from '../../config/branchTypes';

/**
 * Registration approval form (Beta-2.1) — EMPLOYEE accounts are
 * admin-managed: the applicant's own username never becomes the final
 * identity, so the admin supplies the FINAL managed username here (and may
 * adjust the branch). Live preview/mismatch hints are presentation only —
 * the backend runs the one authoritative classification rule inside the
 * approval transaction and its errors surface via the page toast.
 */
const ApproveRequestModal = ({ request, onApprove, onCancel, submitting }) => {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [branch, setBranch] = useState(null);
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(true);

  useEffect(() => {
    branchAPI.getAll()
      .then((response) => {
        setBranches(response.data);
        // Pre-select the applicant's chosen branch — the admin may change it.
        setBranch(response.data.find((b) => String(b.id) === String(request.branch_id)) || null);
      })
      .catch(() => setBranches([]))
      .finally(() => setBranchesLoading(false));
  }, [request.branch_id]);

  const preview = parseManagedUsernamePreview(username);
  const mismatch = preview.managed && branch && preview.branchCode !== branch.code;
  const canSubmit = preview.managed && branch && !mismatch && !submitting;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onApprove({ username: username.trim(), branch_id: branch.id });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="text-xs text-neutral-500">
        {t('applicantUsernameLabel')}: <span className="font-mono text-neutral-700">{request.username}</span>
      </div>

      <Input
        label={t('approveRequestFinalUsername')}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="eg_ali_01_1"
        required
      />
      <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-900 space-y-1">
        <p>{t('approveRequestUsernameHint')}</p>
        <p>{t('usernamePrefixLegend')}</p>
      </div>

      <BranchSelect
        label={t('branchCode')}
        branches={branches}
        loading={branchesLoading}
        value={branch}
        onChange={setBranch}
      />

      {preview.managed && (
        <div className={`p-3 rounded-lg border text-xs space-y-0.5 ${mismatch ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-neutral-50 border-neutral-200 text-neutral-700'}`}>
          <p>{t('branchTypeLabel')}: <span className="font-medium">{getBranchTypeLabel(t, preview.branchType)}</span></p>
          <p>{t('branchCode')}: <span className="font-mono font-medium">{preview.branchCode}</span></p>
          {mismatch && (
            <p className="font-medium">{t('usernameBranchMismatchHint')} ({preview.branchCode} ≠ {branch.code})</p>
          )}
        </div>
      )}

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>{t('cancel')}</Button>
        <Button type="submit" variant="success" icon={Check} loading={submitting} disabled={!canSubmit}>
          {t('approve')}
        </Button>
      </div>
    </form>
  );
};

export default ApproveRequestModal;
