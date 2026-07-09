import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Modal } from '../UI/Modal';
import Button from '../UI/Button';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Shows a freshly-generated password until the admin explicitly closes it —
 * the old flow surfaced it in a Toast that auto-dismissed after 3 seconds,
 * which isn't enough time to reliably read and hand off a random string.
 */
const NewPasswordModal = ({ password, onClose }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={!!password} onClose={onClose} title={t('newPasswordTitle')} size="sm">
      <div className="space-y-4">
        <p className="text-sm text-neutral-500">{t('newPasswordDesc')}</p>
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-neutral-200 bg-neutral-50">
          <code className="flex-1 font-mono text-base text-neutral-900 select-all">{password}</code>
          <button
            onClick={handleCopy}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors flex-shrink-0"
            aria-label={t('copyToClipboard')}
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        {copied && <p className="text-xs text-green-600">{t('copied')}</p>}
        <div className="flex justify-end pt-2">
          <Button onClick={onClose}>{t('done')}</Button>
        </div>
      </div>
    </Modal>
  );
};

export default NewPasswordModal;
