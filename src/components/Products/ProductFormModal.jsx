import { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../UI/Input';
import Select from '../UI/Select';
import Button from '../UI/Button';
import { useLanguage } from '../../context/LanguageContext';
import { buildProductSchema } from '../../validation/productSchemas';
import { getProductCategoryOptions } from '../../config/productCategories';

/**
 * Rendered fresh on every open (parent only mounts this while its owning
 * <Modal> is open — see AdminProductsModern), same remount pattern as
 * UserFormModal/BranchFormModal. Products are catalog models (e.g. "STAG
 * R02"), not serialized physical units — no serial/QR/score fields here
 * anymore; active/inactive is a separate list-level toggle, not part of
 * this form.
 */
const ProductFormModal = ({ editingProduct, onSubmit, onCancel }) => {
  const { t } = useLanguage();

  const categoryOptions = useMemo(() => getProductCategoryOptions(t), [t]);
  const fuelTypeOptions = useMemo(
    () => [
      { value: '', label: t('selectPlaceholder') },
      { value: 'LPG', label: 'LPG' },
      { value: 'CNG', label: 'CNG' },
    ],
    [t]
  );
  const schema = useMemo(() => buildProductSchema(t), [t]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      category: editingProduct?.category ?? '',
      brand: editingProduct?.brand ?? '',
      model: editingProduct?.model ?? '',
      fuel_type: editingProduct?.fuel_type ?? '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Controller
        name="category"
        control={control}
        render={({ field }) => (
          <Select label={t('category')} required options={categoryOptions} error={errors.category?.message} {...field} />
        )}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label={t('brand')} required error={errors.brand?.message} {...register('brand')} />
        <Input label={t('model')} error={errors.model?.message} {...register('model')} />
      </div>

      <Controller
        name="fuel_type"
        control={control}
        render={({ field }) => (
          <Select label={t('fuelType')} options={fuelTypeOptions} error={errors.fuel_type?.message} {...field} />
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

export default ProductFormModal;
