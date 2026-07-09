import { useState } from 'react';
import Webcam from 'react-webcam';
import { MdCameraAlt } from 'react-icons/md';
import Button from '../../UI/Button';
import { useCameraCapture } from './useCameraCapture';

const STATUS_MESSAGES = {
  positioning: 'Guvohnomani ramka ichiga joylashtiring',
  steadying: 'Qo\'lni tekis tuting...',
  ready: 'Tayyor — skanerlanmoqda',
};

const STATUS_COLORS = {
  positioning: 'border-white/70',
  steadying: 'border-yellow-400',
  ready: 'border-green-400',
};

const VIDEO_CONSTRAINTS = {
  facingMode: 'environment',
  width: { ideal: 1920 },
  height: { ideal: 1080 },
};

/**
 * Live camera view with an alignment guide, auto-capture-on-stable-focus, and
 * a manual capture fallback for devices/lighting where auto-capture doesn't
 * trigger confidently.
 */
const CameraView = ({ webcamRef, onCapture, onError }) => {
  const [permissionError, setPermissionError] = useState(null);

  const { status, captureHighResFrame } = useCameraCapture(webcamRef, {
    autoCapture: true,
    onReady: () => {
      const canvas = captureHighResFrame();
      if (canvas) onCapture(canvas);
    },
  });

  const handleManualCapture = () => {
    const canvas = captureHighResFrame();
    if (canvas) onCapture(canvas);
  };

  const handleUserMediaError = (err) => {
    const message =
      err?.name === 'NotAllowedError'
        ? 'Kameradan foydalanishga ruxsat berilmadi. Brauzer sozlamalaridan ruxsat bering.'
        : err?.name === 'NotFoundError'
        ? 'Kamera topilmadi.'
        : 'Kamerani ishga tushirib bo\'lmadi.';
    setPermissionError(message);
    onError?.(message);
  };

  if (permissionError) {
    return (
      <div className="bg-black rounded-lg overflow-hidden h-80 flex items-center justify-center p-6">
        <p className="text-red-300 text-sm text-center">{permissionError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative bg-black rounded-lg overflow-hidden h-80 flex items-center justify-center">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          forceScreenshotSourceSize
          videoConstraints={VIDEO_CONSTRAINTS}
          onUserMediaError={handleUserMediaError}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Alignment overlay — guides the user to the ID-card aspect ratio */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className={`w-[82%] aspect-[1.586] border-4 rounded-lg transition-colors duration-200 ${STATUS_COLORS[status]}`}
          />
        </div>
        <div className="absolute bottom-2 left-0 right-0 text-center">
          <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full">
            {STATUS_MESSAGES[status]}
          </span>
        </div>
      </div>
      <Button variant="secondary" onClick={handleManualCapture} className="w-full">
        <MdCameraAlt className="w-4 h-4 mr-1 inline" /> Qo'lda suratga olish
      </Button>
    </div>
  );
};

export default CameraView;
