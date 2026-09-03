import { useMemo, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../UI/Input';
import BranchSelect from '../UI/BranchSelect';
import PhoneInput from '../UI/PhoneInput';
import Button from '../UI/Button';
import { useLanguage } from '../../context/LanguageContext';
import { buildCreateUserSchema, buildEditUserSchema } from '../../validation/userSchemas';
import { branchAPI } from '../../services/api';
import { parseManagedUsernamePreview } from '../../utils/managedUsernamePreview';
import { getBranchTypeLabel } from '../../config/branchTypes';

/**
 * Rendered fresh on every open (parent only mounts this while its owning
 * <Modal> is open — see AdminUsersModern), so useForm's defaultValues and
 * the create-vs-edit resolver are always correct for whichever user (or lack
 * of one) triggered this open; no manual reset() bookkeeping needed.
 */
const UserFormModal = ({ editingUser, onSubmit, onCancel }) => {
  const { t } = useLanguage();
  const isEditing = !!editingUser;
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    void (async () => {
      try {
        const response = await branchAPI.getAll();
        setBranches(response.data);
      } catch {
        // Non-fatal — the Select just shows no options.
      }
    })();
  }, []);

  const schema = useMemo(
    () => (isEditing ? buildEditUserSchema(t) : buildCreateUserSchema(t)),
    [isEditing, t]
  );

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      full_name: editingUser?.full_name ?? '',
      username: editingUser?.username ?? '',
      password: '',
      phone: editingUser?.phone ?? '',
      branch_id: editingUser?.branch_id ?? '',
    },
  });

  // ── Managed-username live preview (Beta-2, presentation only — the
  // backend independently enforces everything) ──────────────────────────
  const watchedUsername = watch('username');
  const watchedBranchId = watch('branch_id');
  const effectiveUsername = isEditing ? editingUser.username : watchedUsername;
  const preview = parseManagedUsernamePreview(effectiveUsername);
  const selectedBranch = branches.find((b) => String(b.id) === String(watchedBranchId)) || null;
  const previewMismatch = preview.managed && selectedBranch && preview.branchCode !== selectedBranch.code;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input
        label={t('fullName')}
        error={errors.full_name?.message}
        {...register('full_name')}
      />

      {isEditing ? (
        <div className="w-full">
          <label className="block text-sm font-medium text-neutral-700 mb-2">{t('username')}</label>
          <div className="px-4 py-2.5 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-500">
            {editingUser.username}
          </div>
        </div>
      ) : (
        <>
          <Input
            label={t('username')}
            error={errors.username?.message}
            {...register('username')}
          />
          {/* Concise username-convention helper (Beta-2) — employees created
              here are always installer EMPLOYEE accounts, so the managed
              format applies (ADMIN accounts are not created through this
              form). */}
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-900 space-y-1">
            <p className="font-medium">{t('usernameFormatHelperTitle')}</p>
            <p className="font-mono">eg_ali_01_1 · st_ali_10_1 · bs_ali_10_2</p>
            <p>{t('usernamePrefixLegend')}</p>
          </div>
        </>
      )}

      {/* Live preview (Beta-2, presentation only — backend is authoritative):
          appears once the username matches the managed pattern; the mismatch
          hint compares it against the currently selected branch. */}
      {preview.managed && (
        <div className={`p-3 rounded-lg border text-xs space-y-0.5 ${previewMismatch ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-neutral-50 border-neutral-200 text-neutral-700'}`}>
          <p>{t('branchTypeLabel')}: <span className="font-medium">{getBranchTypeLabel(t, preview.branchType)}</span></p>
          <p>{t('branchCode')}: <span className="font-mono font-medium">{preview.branchCode}</span></p>
          {previewMismatch && (
            <p className="font-medium">
              {t('usernameBranchMismatchHint')} ({preview.branchCode} ≠ {selectedBranch.code})
            </p>
          )}
        </div>
      )}

      {!isEditing && (
        <Input
          label={t('password')}
          type="password"
          showPasswordToggle
          hint={t('atLeast6CharsPlaceholder')}
          error={errors.password?.message}
          {...register('password')}
        />
      )}

      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <PhoneInput label={t('phone')} error={errors.phone?.message} {...field} />
        )}
      />

      <Controller
        name="branch_id"
        control={control}
        render={({ field }) => (
          // Searchable selector (Beta-1). includeInactive: a user may already
          // be assigned to a deactivated branch — the previous select offered
          // every branch, and hiding inactive ones here would silently break
          // editing such users. RHF keeps storing the bare branch_id.
          <BranchSelect
            label={t('branchCode')}
            branches={branches}
            includeInactive
            allowUnassigned
            value={branches.find((b) => String(b.id) === String(field.value)) || null}
            onChange={(b) => field.onChange(b ? b.id : '')}
            error={errors.branch_id?.message}
          />
        )}
      />

      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {t('save')}
        </Button>
      </div>
    </form>
  );
};

export default UserFormModal;
