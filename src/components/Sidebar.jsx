import { Link, useLocation } from 'react-router-dom';
import { MdDashboard, MdArticle, MdPeople, MdNoteAdd, MdManageAccounts } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

const adminItems = [
  { label: 'Asosiy bolim',        path: '/dashboard',      Icon: MdDashboard },
  { label: 'Kafolat daftarlari',  path: '/warranty-forms', Icon: MdArticle },
  { label: 'Foydalanuvchilar',    path: '/users',          Icon: MdPeople },
];

const employeeItems = [
  { label: 'Kafolat daftari', path: '/warranty-form', Icon: MdNoteAdd },
  { label: 'Kabinet',         path: '/profile',       Icon: MdManageAccounts },
];

const Sidebar = () => {
  const { isOpen, closeSidebar } = useSidebar();
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = user?.role === 'ADMIN' ? adminItems : employeeItems;
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-neutral-200 transition-transform duration-300 z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:relative lg:z-auto lg:transition-none shadow-lg lg:shadow-none`}>
        <div className="p-6 border-b border-neutral-200">
          <h1 className="text-2xl font-bold text-blue-600">STAG</h1>
          <p className="text-sm text-neutral-600">Kafolat daftari boshqaruv paneli</p>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {menuItems.map(({ label, path, Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={closeSidebar}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(path)
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-200 space-y-2">
          <div className="px-4 py-3 rounded-lg bg-neutral-50">
            <p className="text-sm font-medium text-neutral-900 truncate">{user?.full_name}</p>
            <p className="text-xs text-neutral-600">Tomonidan kirilgan</p>
          </div>
          <button
            onClick={logout}
            className="w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Chiqish
          </button>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;
