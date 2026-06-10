import React from 'react';

const Badge = ({ children, variant = 'neutral', size = 'md' }) => {
  const variants = {
    neutral: 'bg-neutral-100 text-neutral-700',
    primary: 'bg-blue-100 text-blue-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs font-medium rounded',
    md: 'px-3 py-1 text-sm font-medium rounded-md',
  };

  return (
    <span className={`inline-block ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
};

export default Badge;
