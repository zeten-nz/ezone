import { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../UI/Input';
import Select from '../UI/Select';
import Button from '../UI/Button';
import EasyGasStagCodeField from './EasyGasStagCodeField';
import { useLanguage } from '../../context/LanguageContext';
import { buildCreateBranchSchema, buildEditBranchSchema } from '../../validation/branchSchemas';
import { regions } from '../../regions';

/**
 * Rendered fresh on every open (parent only mounts this while its owning
 * <Modal> is open — see AdminBranchesModern), same pattern as UserFormModal.
 */
const BranchFormModal = ({ editingBranch, onSubmit, onCancel }) => {
  const { t } = useLanguage();
  const isEditing = !!editingBranch;

  const schema = useMemo(
    () => (isEditing ? buildEditBranchSchema(t) : buildCreateBranchSchema(t)),
    [isEditing, t]
  );

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      code: editingBranch?.code ?? '',
      name: editingBranch?.name ?? '',
      phone: editingBranch?.phone ?? '',
      region: editingBranch?.region ?? '',
      district: editingBranch?.district ?? '',
      city: editingBranch?.city ?? '',
      easygas_stag_code: editingBranch?.easygas_stag_code ?? '',
    },
  });

  const selectedRegion = watch('region');

  const regionOptions = useMemo(
    () => [{ value: '', label: t('selectPlaceholder') }, ...Object.keys(regions).map((r) => ({ value: r, label: r }))],
    [t]
  );
  const districtOptions = useMemo(
    () => [
      { value: '', label: t('selectPlaceholder') },
      ...(selectedRegion ? regions[selectedRegion].map((d) => ({ value: d, label: d })) : []),
    ],
    [t, selectedRegion]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {isEditing ? (
        <div className="w-full">
          <label className="block text-sm font-medium text-neutral-700 mb-2">{t('branchCode')}</label>
          <div className="px-4 py-2.5 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-500">
            {editingBranch.code}
          </div>
        </div>
      ) : (
        <Input
          label={t('branchCode')}
          required
          error={errors.code?.message}
          {...register('code')}
        />
      )}

      <Input
        label={t('branchName')}
        required
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label={t('phone')}
        type="tel"
        error={errors.phone?.message}
        {...register('phone')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller
          name="region"
          control={control}
          render={({ field }) => (
            <Select
              label={t('region')}
              options={regionOptions}
              error={errors.region?.message}
              {...field}
              onChange={(e) => {
                field.onChange(e);
                setValue('district', '');
              }}
            />
          )}
        />
        <Controller
          name="district"
          control={control}
          render={({ field }) => (
            <Select
              label={t('district')}
              options={districtOptions}
              error={errors.district?.message}
              disabled={!selectedRegion}
              {...field}
            />
          )}
        />
      </div>

      <Input
        label={t('city')}
        error={errors.city?.message}
        {...register('city')}
      />

      <Controller
        name="easygas_stag_code"
        control={control}
        render={({ field }) => (
          <EasyGasStagCodeField
            value={field.value}
            onChange={field.onChange}
            error={errors.easygas_stag_code?.message}
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

export default BranchFormModal;
