import { useState } from 'react';
import { Modal } from '../UI/Modal';
import Button from '../UI/Button';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Rendered fresh on every open (parent only mounts this while its owning
 * request is set — see AdminRegistrationRequestsModern), so the reason
 * textarea always starts blank; no manual reset() bookkeeping needed.
 *
 * title/message/reasonLabel/reasonPlaceholder default to the original
 * registration-request copy so the existing caller needs no changes; a
 * second caller (Manual Verification review, AdminWarrantyFormsModern)
 * passes its own copy rather than duplicating this whole component just to
 * change the wording — see "reuse existing UI components" in the Manual
 * Verification workflow's requirements.
 */
const RejectReasonModal = ({
  isOpen, onClose, onConfirm, submitting,
  title, message, reasonLabel, reasonPlaceholder,
}) => {
  const { t } = useLanguage();
  const [reason, setReason] = useState('');

  const handleConfirm = () => onConfirm(reason.trim() || undefined);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title ?? t('rejectRequestTitle')} size="sm">
      <div className="space-y-4">
        <p className="text-neutral-600 text-sm">{message ?? t('rejectRequestMessage')}</p>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">{reasonLabel ?? t('rejectReasonLabel')}</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={reasonPlaceholder ?? t('rejectReasonPlaceholder')}
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500"
          />
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>{t('cancel')}</Button>
          <Button type="button" variant="danger" onClick={handleConfirm} loading={submitting}>{t('reject')}</Button>
        </div>
      </div>
    </Modal>
  );
};

export default RejectReasonModal;
