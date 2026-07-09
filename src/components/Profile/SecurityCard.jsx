import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardContent } from '../UI/Card';
import Input from '../UI/Input';
import Button from '../UI/Button';
import PasswordStrengthMeter from '../UI/PasswordStrengthMeter';
import { buildChangePasswordSchema } from '../../validation/authSchemas';
import { authAPI } from '../../services/api';

const SecurityCard = ({ t, onToast }) => {
  const changePasswordSchema = useMemo(() => buildChangePasswordSchema(t), [t]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(changePasswordSchema), mode: 'onBlur' });

  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    try {
      await authAPI.changePassword(data.currentPassword, data.newPassword);
      onToast({ type: 'success', message: t('passwordChanged') });
      reset();
    } catch (err) {
      onToast({ type: 'error', message: err.message });
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-semibold text-neutral-900">{t('security')}</h2>
        <p className="text-sm text-neutral-500 mt-1">{t('securityDesc')}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label={t('currentPassword')}
            type="password"
            showPasswordToggle
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />
          <div>
            <Input
              label={t('newPassword')}
              type="password"
              showPasswordToggle
              hint={t('atLeast6CharsPlaceholder')}
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
            <PasswordStrengthMeter password={newPassword} />
          </div>
          <Input
            label={t('confirmPassword')}
            type="password"
            showPasswordToggle
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <div className="flex gap-3 justify-end pt-4 border-t border-neutral-200">
            <Button type="button" variant="secondary" onClick={() => reset()}>
              {t('cancel')}
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {t('changePassword')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SecurityCard;
