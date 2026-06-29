import { MdClose } from 'react-icons/md';

export const Modal = ({ isOpen, onClose, children, title, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    '2xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full mx-4 ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
        {title && (
          <div className="sticky top-0 px-6 py-4 border-b border-neutral-200 bg-white rounded-t-2xl flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-700 transition-colors"
              aria-label="Close"
            >
              <MdClose className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', isDangerous = false }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <p className="text-neutral-600 mb-6">{message}</p>
    <div className="flex gap-3 justify-end">
      <button
        onClick={onClose}
        className="px-4 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors"
      >
        {cancelText}
      </button>
      <button
        onClick={onConfirm}
        className={`px-4 py-2.5 rounded-lg font-medium text-white transition-colors ${
          isDangerous
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {confirmText}
      </button>
    </div>
  </Modal>
);
