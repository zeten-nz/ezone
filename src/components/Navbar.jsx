import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

const Navbar = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const { user } = useAuth();
  const { isOpen, toggleSidebar } = useSidebar();

  return (
    <nav className="sticky top-0 z-30 bg-white border-b border-neutral-200 shadow-sm">
      <div className="px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
          >
            <span className="text-xl">{isOpen ? '✕' : '☰'}</span>
          </button>
          <h1 className="text-lg md:text-xl font-semibold text-neutral-900">
            {user?.role === 'ADMIN' ? t('dashboard') : t('warrantyForm')}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleLanguage}
            className="px-3 py-2 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            {language === 'uz' ? 'РУ' : 'UZ'}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
