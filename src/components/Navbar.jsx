import { useLocation } from 'react-router-dom';
import { Menu, X, Languages } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { getReachablePages, getProfilePath, getHomePath } from '../config/navigation';
import Breadcrumb from './Header/Breadcrumb';
import CommandSearch from './Header/CommandSearch';
import NotificationsMenu from './Header/NotificationsMenu';
import ProfileMenu from './Header/ProfileMenu';

const Navbar = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const { isOpen, toggleSidebar } = useSidebar();
  const location = useLocation();

  const reachablePages = getReachablePages(user?.role);
  const currentPage = reachablePages.find((p) => p.path === location.pathname);
  const homePath = getHomePath(user?.role);

  const searchPages = reachablePages.map((p) => ({ ...p, label: t(p.labelKey) }));

  return (
    <nav className="sticky top-0 z-30 bg-white border-b border-neutral-200 shadow-sm">
      <div className="px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors flex-shrink-0"
            aria-label={isOpen ? t('closeMenu') : t('openMenu')}
          >
            {isOpen ? <X className="w-5 h-5 text-neutral-700" /> : <Menu className="w-5 h-5 text-neutral-700" />}
          </button>
          <Breadcrumb homePath={homePath} currentLabel={currentPage ? t(currentPage.labelKey) : ''} />
        </div>

        <div className="hidden md:block flex-1 max-w-xs">
          <CommandSearch pages={searchPages} placeholder={t('searchPlaceholder')} noResultsLabel={t('searchNoResults')} />
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <Languages className="w-4 h-4 text-neutral-400" />
            {language === 'uz' ? 'RU' : 'UZ'}
          </button>
          <NotificationsMenu
            label={t('notifications')}
            title={t('noNotifications')}
            description={t('noNotificationsDesc')}
          />
          <ProfileMenu
            user={user}
            profilePath={getProfilePath(user?.role)}
            profileLabel={t('myAccount')}
            logoutLabel={t('logout')}
            roleLabel={user?.role === 'ADMIN' ? t('admin') : t('employee')}
            onLogout={logout}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
