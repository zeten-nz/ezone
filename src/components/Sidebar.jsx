import { Link, useLocation } from 'react-router-dom';
import { LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { useLanguage } from '../context/LanguageContext';
import { getNavItems } from '../config/navigation';
import { initialsOf } from '../utils/initials';

const Sidebar = () => {
  const { isOpen, closeSidebar, collapsed, toggleCollapsed } = useSidebar();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  const menuItems = getNavItems(user?.role);
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <aside
        className={`fixed left-0 top-0 h-screen bg-slate-900 flex flex-col transition-transform duration-300 z-40 w-64 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:relative lg:z-auto lg:transition-[width] lg:duration-200 ${
          collapsed ? 'lg:w-20' : 'lg:w-64'
        } shadow-xl lg:shadow-none`}
      >
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* EasyGas mark on a white chip so it stays legible on the dark
                sidebar (the PNG is a transparent blue/red mark). */}
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 p-1">
              <img src="/easygas-none-text.png" alt="EasyGas" className="w-full h-full object-contain" />
            </div>
            {!collapsed && (
              <span className="text-lg font-semibold text-white truncate">EasyGas</span>
            )}
          </div>
          <button
            onClick={toggleCollapsed}
            className="hidden lg:flex w-7 h-7 rounded-md items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0"
            aria-label={collapsed ? t('expandSidebar') : t('collapseSidebar')}
            title={collapsed ? t('expandSidebar') : t('collapseSidebar')}
          >
            {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuItems.map(({ labelKey, path, icon: Icon }) => {
            const active = isActive(path);
            return (
              <div key={path} className="relative">
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-blue-500 rounded-r-full" />
                )}
                <Link
                  to={path}
                  onClick={closeSidebar}
                  title={collapsed ? t(labelKey) : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    collapsed ? 'justify-center' : ''
                  } ${
                    active
                      ? 'bg-slate-800 text-white font-medium'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="truncate text-sm">{t(labelKey)}</span>}
                </Link>
              </div>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800 flex-shrink-0">
          <div className={`flex items-center gap-3 px-1 py-2 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-slate-700 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
              {initialsOf(user?.full_name)}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{user?.full_name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.role === 'ADMIN' ? t('admin') : t('employee')}</p>
              </div>
            )}
            <button
              onClick={() => logout()}
              title={t('logout')}
              aria-label={t('logout')}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
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
