import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import Toast from '../components/UI/Toast';
import { useLanguage } from '../context/LanguageContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

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
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Login failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-neutral-50 flex items-center justify-center px-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden">
          <div className="px-8 py-12 border-b border-neutral-100 bg-gradient-to-r from-blue-600 to-blue-700">
            <h1 className="text-4xl font-bold text-white mb-2">STAG</h1>
            <p className="text-blue-100">{t('loginTitle')}</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                showPasswordToggle
                required
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  loading={loading}
                  className="w-full"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </div>
            </form>

            
          </div>

          <div className="px-8 py-4 bg-neutral-50 border-t border-neutral-100 text-center text-xs text-neutral-600">
            © 2026 STAG {t('loginTitle')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
