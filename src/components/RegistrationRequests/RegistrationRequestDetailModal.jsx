import { Modal } from '../UI/Modal';
import StatusBadge from '../UI/StatusBadge';
import AuthenticatedPhoto from '../UI/AuthenticatedPhoto';
import { registrationRequestsAPI } from '../../services/api';

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs text-neutral-500">{label}</p>
    <p className="text-sm font-medium text-neutral-900 mt-0.5">{value || '—'}</p>
  </div>
);

/**
 * Read-only detail view for a single registration request — admin verifies
 * the applicant (by phone call, out of band) using this before Approve/Reject.
 */
const RegistrationRequestDetailModal = ({ isOpen, onClose, request, t, language = 'uz' }) => (
  <Modal isOpen={isOpen && !!request} onClose={onClose} title={t('requestDetailsTitle')} size="lg">
    {request && (
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <AuthenticatedPhoto
            fetcher={() => registrationRequestsAPI.getPhotoBlob(request.id)}
            cacheKey={request.id}
            className="w-24 h-24 rounded-xl flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="text-lg font-semibold text-neutral-900 truncate">
              {request.first_name} {request.last_name}
            </p>
            <p className="text-sm text-neutral-500">@{request.username}</p>
            <StatusBadge status={request.status} size="sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-neutral-100 pt-5">
          <Field label={t('phone')} value={request.phone} />
          <Field label={t('region')} value={request.region} />
          <Field label={t('district')} value={request.district} />
          <Field label={t('branchCode')} value={request.branch_code} />
          <Field
            label={t('createdDate')}
            value={new Date(request.created_at).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'uz-UZ', {
              year: 'numeric', month: 'short', day: 'numeric',
            })}
          />
          {request.reviewed_at && (
            <Field
              label={t('reviewedAt')}
              value={new Date(request.reviewed_at).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'uz-UZ', {
                year: 'numeric', month: 'short', day: 'numeric',
              })}
            />
          )}
          {request.reviewer_name && <Field label={t('reviewedBy')} value={request.reviewer_name} />}
        </div>

        {request.notes && (
          <div className="border-t border-neutral-100 pt-5">
            <p className="text-xs text-neutral-500">{t('notes')}</p>
            <p className="text-sm text-neutral-700 mt-1">{request.notes}</p>
          </div>
        )}
      </div>
    )}
  </Modal>
);

export default RegistrationRequestDetailModal;
