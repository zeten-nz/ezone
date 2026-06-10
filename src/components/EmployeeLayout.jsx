import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EmployeeLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-blue-600">STAG Warranty</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-700 text-sm">
                Xush kelibsiz, <strong>{user?.full_name}</strong>
              </span>
              <div className="flex gap-4">
                <Link
                  to="/warranty-form"
                  className="text-gray-700 hover:text-blue-600 text-sm font-medium"
                >
                  Garantiya Shakli
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-blue-600 text-sm font-medium"
                >
                  Profil
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 text-sm font-medium"
                >
                  Chiqish
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default EmployeeLayout;
