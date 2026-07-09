import { createContext, useContext, useState } from 'react';

const SidebarContext = createContext();
const COLLAPSE_STORAGE_KEY = 'ezone_sidebar_collapsed';

export const SidebarProvider = ({ children }) => {
  // Mobile drawer visibility — unrelated to desktop collapse below.
  const [isOpen, setIsOpen] = useState(false);

  // Desktop icon-rail collapse. Persisted so a reload doesn't jump back
  // to expanded and reflow the whole layout under the user.
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_STORAGE_KEY) === 'true');

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_STORAGE_KEY, String(next));
      return next;
    });
  };

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar, closeSidebar, collapsed, toggleCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
};
