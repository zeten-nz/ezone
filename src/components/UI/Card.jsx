import React from 'react';

export const Card = ({ children, className = '', variant = 'default' }) => {
  const variants = {
    default: 'bg-white border border-neutral-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200',
    elevated: 'bg-white border border-neutral-100 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200',
    minimal: 'bg-white rounded-xl border border-neutral-100',
  };

  return (
    <div className={`${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', divider = true }) => (
  <div className={`px-6 py-4 ${divider ? 'border-b border-neutral-100' : ''} ${className}`}>
    {children}
  </div>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-t border-neutral-100 bg-neutral-50 rounded-b-xl ${className}`}>
    {children}
  </div>
);
