import { useEffect, useRef, useState } from 'react';
import { RefreshCw, VideoOff, ShieldAlert, CameraOff } from 'lucide-react';
import { Modal } from '../UI/Modal';
import Button from '../UI/Button';
import { useLanguage } from '../../context/LanguageContext';
import { resolveQrDecoder } from '../../utils/qrDecoder';
import { startScannerSession } from '../../utils/scannerSession';
import { classifyCameraError, CAMERA_ERROR_LABEL_KEY } from '../../utils/cameraErrors';

const ERROR_ICON = { permission: ShieldAlert, 'no-camera': VideoOff, init: CameraOff };

/**
 * The live camera + decode session. Mounted FRESH for every open and every
 * retry (the parent keys it), so its state legitimately starts at
 * 'starting' and every state update after that happens asynchronously
 * (decoder resolved / failed) — and unmounting IS the teardown: the effect
 * cleanup stops the decode loop and every MediaStream track.
 *
 * Emits AT MOST ONE onDecode per mount — zxing fires its callback
 * continuously while the QR stays in view, so decodedRef locks out
 * repeats; a held-up QR can never fire multiple lookups.
 */
// Frames must appear within this window after the stream goes live, else we
// surface a retryable init error instead of a permanent black rectangle
// (§4). Generous enough not to trip a slow mobile camera.
const FRAME_WATCHDOG_MS = 8000;

const ScannerView = ({ onDecode, onError }) => {
  const { t } = useLanguage();
  const videoRef = useRef(null);
  // 'starting' until the <video> actually produces frames (videoWidth>0),
  // then 'scanning'. The <video> element itself is ALWAYS rendered and never
  // swapped on this transition — only an overlay changes — so the single
  // HTMLVideoElement that zxing attached to stays mounted for the whole
  // session (a prior black-screen bug came from tearing that element's
  // stream down; the element is now stable by construction).
  const [phase, setPhase] = useState('starting');

  useEffect(() => {
    // Session lifecycle (deferred-open + StrictMode-safe teardown) lives in
    // utils/scannerSession.js so it can be regression-tested without a
    // browser. This effect only wires DOM concerns (frame-ready detection,
    // the retry watchdog) around it.
    let disposed = false;
    let readyRaf = 0;
    let watchdog = 0;
    const clearTimers = () => {
      if (readyRaf) cancelAnimationFrame(readyRaf);
      if (watchdog) clearTimeout(watchdog);
      readyRaf = 0; watchdog = 0;
    };
    const injected = typeof window !== 'undefined' && !!window.__EZONE_QR_DECODER__;

    const session = startScannerSession({
      startDecoder: ({ onDecode: onSessionDecode }) =>
        resolveQrDecoder()({ videoElement: videoRef.current, onDecode: onSessionDecode }),
      onDecode,
      onStarted: () => {
        if (disposed) return;
        if (injected) {
          // Test seam: no real camera/frames — treat a resolved decoder as ready.
          setPhase('scanning');
          return;
        }
        // Flip to the live preview only once real frames exist; if the
        // stream is live but dimensions never arrive, surface a retryable
        // error rather than staying black forever (§4).
        const video = videoRef.current;
        const poll = () => {
          if (disposed || !video) return;
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            clearTimers();
            setPhase('scanning');
            return;
          }
          readyRaf = requestAnimationFrame(poll);
        };
        poll();
        watchdog = setTimeout(() => {
          if (!disposed && video && !(video.videoWidth > 0)) onError('init');
        }, FRAME_WATCHDOG_MS);
      },
      onError: (error) => { if (!disposed) onError(classifyCameraError(error)); },
    });

    return () => {
      disposed = true;
      clearTimers();
      session.cancel(); // genuine close AND unmount both land here — stops the single real session
    };
  }, [onDecode, onError]);

  return (
    <>
      <div className="relative rounded-xl overflow-hidden bg-neutral-900 aspect-square max-h-[60vh]">
        {/* autoPlay+muted+playsInline: required for mobile Safari/Chrome to
            start the camera preview without a user gesture. The <video> is
            the visible base layer; everything else is a transparent/partial
            overlay above it — never an opaque cover. */}
        <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover" />
        {/* viewfinder frame — transparent, pointer-events-none, over the video */}
        <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-3/5 aspect-square rounded-2xl border-2 border-white/70" />
        </div>
        {phase === 'starting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-900/70 text-white">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="text-sm">{t('qrStartingCamera')}</span>
          </div>
        )}
      </div>
      <p className="text-sm text-neutral-600 text-center">{t('qrPointCamera')}</p>
    </>
  );
};

/**
 * Live-camera QR scanner modal — presentation + open/retry orchestration
 * only. The decode boundary lives in utils/qrDecoder.js (with its
 * documented automation seam), error mapping in utils/cameraErrors.js.
 * Retry remounts ScannerView via the key, giving a genuinely fresh camera
 * session; closing the modal unmounts it, which tears the camera down.
 */
const QrScannerModal = ({ isOpen, onClose, onDecode }) => {
  const { t } = useLanguage();
  const [errorKind, setErrorKind] = useState(null);
  const [attempt, setAttempt] = useState(0);

  const handleRetry = () => {
    setErrorKind(null);
    setAttempt((a) => a + 1);
  };

  const handleClose = () => {
    setErrorKind(null); // next open starts clean
    onClose();
  };

  const ErrorIcon = ERROR_ICON[errorKind] || CameraOff;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('qrScanAction')} size="md">
      <div className="space-y-4">
        {errorKind === null ? (
          isOpen && <ScannerView key={attempt} onDecode={onDecode} onError={setErrorKind} />
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center space-y-3">
            <ErrorIcon className="w-8 h-8 text-amber-600 mx-auto" />
            <p className="text-sm font-medium text-amber-800">{t(CAMERA_ERROR_LABEL_KEY[errorKind] || 'qrCameraError')}</p>
            <Button type="button" variant="outline" icon={RefreshCw} onClick={handleRetry}>
              {t('qrRetryCamera')}
            </Button>
          </div>
        )}
        <Button type="button" variant="secondary" onClick={handleClose} className="w-full">
          {t('close')}
        </Button>
      </div>
    </Modal>
  );
};

export default QrScannerModal;
