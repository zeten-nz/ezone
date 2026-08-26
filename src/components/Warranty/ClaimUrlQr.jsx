import { QRCodeSVG } from 'qrcode.react';
import { ExternalLink } from 'lucide-react';
import Button from '../UI/Button';
import { useLanguage } from '../../context/LanguageContext';

// The "Open link" action only fires for a well-formed http(s) URL — a
// malformed or unexpected-scheme historical value still renders as a QR
// (the QR always encodes the stored string verbatim) but never gets handed
// to window.open.
const isOpenableUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
};

/**
 * QR presentation of a warranty's EasyGas claim_url — the QR encodes
 * EXACTLY the stored claim_url string (authoritative data returned by
 * EasyGas; never trimmed, normalized, or reconstructed locally). Renders
 * nothing at all when claim_url is missing/empty, so call sites can embed
 * it unconditionally. A small "Open link" action is kept for desktop users
 * (safe external-link semantics via noopener,noreferrer).
 */
const ClaimUrlQr = ({ claimUrl, size = 176 }) => {
  const { t } = useLanguage();
  if (typeof claimUrl !== 'string' || claimUrl.trim() === '') return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="p-3 bg-white rounded-xl border border-neutral-200 shadow-sm">
        <QRCodeSVG value={claimUrl} size={size} level="M" marginSize={1} className="max-w-full h-auto" />
      </div>
      <p className="text-xs text-neutral-500 text-center max-w-[260px]">{t('scanWarrantyQrHint')}</p>
      {isOpenableUrl(claimUrl) && (
        <Button
          size="sm"
          variant="outline"
          icon={ExternalLink}
          onClick={() => window.open(claimUrl, '_blank', 'noopener,noreferrer')}
        >
          {t('openWarrantyLink')}
        </Button>
      )}
    </div>
  );
};

export default ClaimUrlQr;
