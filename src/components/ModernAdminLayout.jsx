import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const ModernAdminLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto">
          <div className="px-4 md:px-6 py-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ModernAdminLayout;
