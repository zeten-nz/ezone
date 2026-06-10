import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/dashboard', label: t('dashboard') },
    { path: '/users', label: t('users') },
    { path: '/warranty-forms', label: t('warrantyForms') },
    { path: '/admin/profile', label: t('profile') },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="font-bold text-lg text-blue-900">STAG</div>
              <span className="text-gray-600 text-sm">Warranty Management System</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700 text-sm">{user?.full_name}</span>
              <LanguageSwitcher />
              <button
                onClick={handleLogout}
                className="text-sm px-4 py-2 text-red-600 hover:bg-red-50 rounded transition"
              >
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-56 bg-white border-r border-gray-200 min-h-screen p-6">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-3 rounded transition text-sm font-medium ${
                  isActive(item.path)
                    ? 'bg-blue-100 text-blue-900 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
