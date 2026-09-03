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
        <Input
          label={t('username')}
          error={errors.username?.message}
          {...register('username')}
        />
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
