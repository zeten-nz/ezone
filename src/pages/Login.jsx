import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import Toast from '../components/UI/Toast';
import { useLanguage } from '../context/LanguageContext';
import { buildLoginSchema } from '../validation/authSchemas';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  // ProtectedRoute redirects here with { reason: 'expired' } when a 401
  // forced the logout (as opposed to landing here fresh or via an explicit
  // logout) — derived once at mount, not in an effect, since it's just
  // reading the initial navigation state rather than syncing with anything.
  const [toast, setToast] = useState(() =>
    location.state?.reason === 'expired'
      ? { type: 'info', message: t('sessionExpiredMessage') }
      : null
  );

  // Clear the router history state right after reading it above, so a later
  // refresh of /login doesn't keep re-showing the message.
  useEffect(() => {
    if (location.state?.reason === 'expired') {
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginSchema = useMemo(() => buildLoginSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema), mode: 'onBlur' });

  const onSubmit = async ({ username, password }) => {
    try {
      const response = await authAPI.login(username, password);
      const { token, user } = response.data;

      login(user, token);

      if (user.role === 'ADMIN') {
        navigate('/dashboard');
      } else if (user.role === 'EMPLOYEE') {
        navigate('/warranty-form');
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          {/* EasyGas lockup (mark + wordmark, transparent PNG) */}
          <img src="/easygas-side-text.png" alt="EasyGas" className="h-12 w-auto max-w-full mb-3" />
          <h1 className="sr-only">EasyGas</h1>
          <p className="text-sm text-neutral-500 mt-1">{t('loginTitle')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Input
              label={t('username')}
              type="text"
              placeholder={t('usernamePlaceholder')}
              error={errors.username?.message}
              {...register('username')}
            />

            <Input
              label={t('password')}
              type="password"
              placeholder={t('passwordPlaceholder')}
              showPasswordToggle
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="pt-2">
              <Button type="submit" loading={isSubmitting} className="w-full">
                {isSubmitting ? t('signingIn') : t('signIn')}
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            {t('dontHaveAccount')}{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-700">
              {t('signUp')}
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-neutral-400">
          &copy; 2026 EasyGas {t('loginTitle')}
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
