import React, { useEffect, useState } from 'react';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  const typeIcons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div className={`fixed top-4 right-4 px-4 py-3 rounded-lg border flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-right-4 ${typeStyles[type]} z-50`}>
      <span className="text-lg">{typeIcons[type]}</span>
      <span className="font-medium">{message}</span>
      <button
        onClick={() => setIsVisible(false)}
        className="text-lg leading-none opacity-70 hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
