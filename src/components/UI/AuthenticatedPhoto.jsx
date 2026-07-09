import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Several photo routes in this app (registration request photos, a user's
 * own profile photo) are authenticated and not served via express.static —
 * a plain <img src> can't attach the Authorization header, so this fetches
 * the blob through the same axios client every other request uses and
 * renders it as an object URL.
 *
 * `fetcher` is a zero-arg function returning the axios promise for that one
 * photo (e.g. `() => registrationRequestsAPI.getPhotoBlob(request.id)`).
 * `cacheKey` should change whenever the underlying photo might have changed
 * (a request id, or a bump counter after the user uploads a new photo) —
 * that's what re-triggers the fetch.
 */
const AuthenticatedPhoto = ({ fetcher, cacheKey, className = '' }) => {
  const { t } = useLanguage();
  const [url, setUrl] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let objectUrl;
    let cancelled = false;
    setUrl(null);
    setFailed(false);

    fetcher()
      .then((response) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(response.data);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  if (failed) {
    return (
      <div className={`flex flex-col items-center justify-center gap-1 bg-neutral-100 text-neutral-400 ${className}`}>
        <ImageOff className="w-6 h-6" />
        <span className="text-[11px]">{t('noPhoto')}</span>
      </div>
    );
  }

  if (!url) {
    return <div className={`bg-neutral-100 animate-pulse ${className}`} />;
  }

  return <img src={url} alt={t('photo')} className={`object-cover ${className}`} />;
};

export default AuthenticatedPhoto;
