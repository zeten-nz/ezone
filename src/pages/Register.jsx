import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Fuel, CheckCircle2 } from 'lucide-react';
import { authAPI, branchAPI } from '../services/api';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import PhoneInput from '../components/UI/PhoneInput';
import ImageUploader from '../components/UI/ImageUploader';
import Button from '../components/UI/Button';
import Toast from '../components/UI/Toast';
import { useLanguage } from '../context/LanguageContext';
import { buildRegisterSchema } from '../validation/authSchemas';
import { regions } from '../regions';

/**
 * Registration no longer creates an active account — it submits a
 * registration_requests row (status PENDING) for an admin to review and
 * approve/reject. There is no token/login on success (see
 * ezone-server/controllers/authController.js's register()); the form is
 * replaced by a pending-confirmation view instead of navigating anywhere.
 */
const Register = () => {
  const [toast, setToast] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [branches, setBranches] = useState([]);
  const { t } = useLanguage();

  useEffect(() => {
    void (async () => {
      try {
        const response = await branchAPI.getPublic();
        setBranches(response.data);
      } catch {
        // Non-fatal — the Select just shows no options; the field's own
        // validation will still stop submission until one is chosen.
      }
    })();
  }, []);

  const registerSchema = useMemo(() => buildRegisterSchema(t), [t]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      first_name: '',
      last_name: '',
      region: '',
      district: '',
      branch_id: '',
      phone: '',
      username: '',
      password: '',
      confirmPassword: '',
      photo: undefined,
    },
  });

  const selectedRegion = watch('region');

  const regionOptions = useMemo(
    () => [
      { value: '', label: t('selectPlaceholder') },
      ...Object.keys(regions).map((r) => ({ value: r, label: r })),
    ],
    [t]
  );
  const districtOptions = useMemo(
    () => [
      { value: '', label: t('selectPlaceholder') },
      ...(selectedRegion ? regions[selectedRegion].map((d) => ({ value: d, label: d })) : []),
    ],
    [t, selectedRegion]
  );
  const branchOptions = useMemo(
    () => [
      { value: '', label: t('selectPlaceholder') },
      ...branches.map((b) => ({ value: b.id, label: `${b.name} (${b.code})` })),
    ],
    [t, branches]
  );

  const onSubmit = async (data) => {
    try {
      await authAPI.register(data);
      setSubmitted(true);
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 text-center space-y-4"
        >
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900">{t('registrationPendingTitle')}</h2>
          <p className="text-neutral-600 text-sm whitespace-pre-line">{t('registrationPendingMessage')}</p>
          <Link to="/login" className="inline-block pt-2 w-full">
            <Button className="w-full">{t('backToLogin')}</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-lg"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center mb-4">
            <Fuel className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-neutral-900">STAG</h1>
          <p className="text-sm text-neutral-500 mt-1">{t('loginTitle')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">{t('createAccount')}</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('firstName')}
                required
                placeholder={t('firstNamePlaceholder')}
                error={errors.first_name?.message}
                {...register('first_name')}
              />
              <Input
                label={t('lastName')}
                required
                placeholder={t('lastNamePlaceholder')}
                error={errors.last_name?.message}
                {...register('last_name')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                name="region"
                control={control}
                render={({ field }) => (
                  <Select
                    label={t('region')}
                    required
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
                    required
                    options={districtOptions}
                    error={errors.district?.message}
                    disabled={!selectedRegion}
                    {...field}
                  />
                )}
              />
            </div>

            <Controller
              name="branch_id"
              control={control}
              render={({ field }) => (
                <Select
                  label={t('branchCode')}
                  required
                  options={branchOptions}
                  error={errors.branch_id?.message}
                  {...field}
                />
              )}
            />

            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <PhoneInput label={t('phone')} required error={errors.phone?.message} {...field} />
              )}
            />

            <Input
              label={t('username')}
              required
              placeholder={t('chooseUsernamePlaceholder')}
              error={errors.username?.message}
              {...register('username')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('password')}
                type="password"
                required
                placeholder={t('atLeast6CharsPlaceholder')}
                showPasswordToggle
                error={errors.password?.message}
                {...register('password')}
              />
              <Input
                label={t('confirmPassword')}
                type="password"
                required
                placeholder={t('repeatPasswordPlaceholder')}
                showPasswordToggle
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>

            <Controller
              name="photo"
              control={control}
              render={({ field: { value, onChange } }) => (
                <ImageUploader
                  label={t('personalPhoto')}
                  required
                  value={value}
                  onChange={onChange}
                  error={errors.photo?.message}
                />
              )}
            />

            <div className="pt-2">
              <Button type="submit" loading={isSubmitting} className="w-full">
                {isSubmitting ? t('submittingRequest') : t('submitRequest')}
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            {t('alreadyHaveAccount')}{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
              {t('signIn')}
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-neutral-400">
          &copy; 2026 STAG {t('loginTitle')}
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
