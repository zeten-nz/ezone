import { useRef, useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../UI/Card';
import Button from '../UI/Button';
import AuthenticatedPhoto from '../UI/AuthenticatedPhoto';
import { ConfirmModal } from '../UI/Modal';
import { authAPI } from '../../services/api';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // mirrors ezone-server/config/uploads.js
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Change/remove the caller's own profile photo. Cropping before upload was
 * explicitly marked optional in the spec and is skipped here — the backend
 * already validates type/size (magic-byte check, not just extension), so
 * this only needs to mirror that validation client-side for instant feedback.
 */
const ProfilePhotoCard = ({ profile, photoVersion, onPhotoChanged, t, onToast }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      onToast({ type: 'error', message: t('valPhotoInvalidType') });
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      onToast({ type: 'error', message: t('valPhotoTooLarge') });
      return;
    }

    setUploading(true);
    try {
      await authAPI.updateProfilePhoto(file);
      onToast({ type: 'success', message: t('photoUpdated') });
      onPhotoChanged();
    } catch (err) {
      onToast({ type: 'error', message: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      await authAPI.removeProfilePhoto();
      onToast({ type: 'success', message: t('photoRemoved') });
      setRemoveConfirm(false);
      onPhotoChanged();
    } catch (err) {
      onToast({ type: 'error', message: err.message });
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-semibold text-neutral-900">{t('profilePhoto')}</h2>
        <p className="text-sm text-neutral-500 mt-1">{t('profilePhotoDesc')}</p>
      </CardHeader>
      <CardContent>
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex items-center gap-4">
          {profile.has_photo ? (
            <AuthenticatedPhoto
              fetcher={() => authAPI.getProfilePhotoBlob()}
              cacheKey={photoVersion}
              className="w-20 h-20 rounded-xl flex-shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0 text-neutral-400">
              <Camera className="w-7 h-7" />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              variant="secondary"
              icon={Camera}
              loading={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {profile.has_photo ? t('changePhoto') : t('uploadPhoto')}
            </Button>
            {profile.has_photo && (
              <Button size="sm" variant="danger" icon={Trash2} onClick={() => setRemoveConfirm(true)}>
                {t('removePhoto')}
              </Button>
            )}
          </div>
        </div>
      </CardContent>

      <ConfirmModal
        isOpen={removeConfirm}
        onClose={() => setRemoveConfirm(false)}
        onConfirm={handleRemove}
        title={t('removePhotoConfirmTitle')}
        message={t('removePhotoConfirmMessage')}
        confirmText={t('removePhoto')}
        isDangerous
      />
    </Card>
  );
};

export default ProfilePhotoCard;
