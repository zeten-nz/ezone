import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../UI/Input';
import Button from '../UI/Button';
import { useLanguage } from '../../context/LanguageContext';
import { buildCarSchema } from '../../validation/carSchemas';

/**
 * Rendered fresh on every open (parent only mounts this while its owning
 * <Modal> is open — see AdminCarsModern), same remount pattern as
 * BrandFormModal/ProductFormModal.
 */
const CarFormModal = ({ editingCar, onSubmit, onCancel }) => {
  const { t } = useLanguage();

  const schema = useMemo(() => buildCarSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      brand: editingCar?.brand ?? '',
      model: editingCar?.model ?? '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input label={t('brand')} required error={errors.brand?.message} {...register('brand')} />
      <Input label={t('model')} required error={errors.model?.message} {...register('model')} />

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

export default CarFormModal;
