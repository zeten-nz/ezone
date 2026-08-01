import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../UI/Input';
import Button from '../UI/Button';
import { useLanguage } from '../../context/LanguageContext';
import { buildBrandSchema } from '../../validation/brandSchemas';

/**
 * Rendered fresh on every open (parent only mounts this while its owning
 * <Modal> is open — see AdminBrandsModern), same remount pattern as
 * BranchFormModal/ProductFormModal.
 */
const BrandFormModal = ({ editingBrand, onSubmit, onCancel }) => {
  const { t } = useLanguage();

  const schema = useMemo(() => buildBrandSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      name: editingBrand?.name ?? '',
      full_name: editingBrand?.full_name ?? '',
      country: editingBrand?.country ?? '',
      logo_url: editingBrand?.logo_url ?? '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input label={t('brand')} required error={errors.name?.message} {...register('name')} />
      <Input label={t('brandFullName')} error={errors.full_name?.message} {...register('full_name')} />
      <Input label={t('country')} error={errors.country?.message} {...register('country')} />
      <Input label={t('logoUrl')} error={errors.logo_url?.message} {...register('logo_url')} />

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

export default BrandFormModal;
