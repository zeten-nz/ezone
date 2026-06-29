import { useEffect, useState } from 'react';
import { MdCheckCircle, MdError, MdWarning, MdInfo, MdClose } from 'react-icons/md';

const typeStyles = {
  success: 'bg-green-50 text-green-800 border-green-200',
  error:   'bg-red-50 text-red-800 border-red-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  info:    'bg-blue-50 text-blue-800 border-blue-200',
};

const typeIcons = {
  success: <MdCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />,
  error:   <MdError       className="w-5 h-5 text-red-600 flex-shrink-0" />,
  warning: <MdWarning     className="w-5 h-5 text-amber-600 flex-shrink-0" />,
  info:    <MdInfo        className="w-5 h-5 text-blue-600 flex-shrink-0" />,
};

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

  return (
    <div className={`fixed top-4 right-4 px-4 py-3 rounded-lg border flex items-center gap-3 shadow-lg z-50 ${typeStyles[type]}`}>
      {typeIcons[type]}
      <span className="font-medium">{message}</span>
      <button
        onClick={() => setIsVisible(false)}
        className="opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <MdClose className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
