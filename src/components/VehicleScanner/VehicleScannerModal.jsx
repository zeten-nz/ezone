import { useRef, useState, useCallback, useEffect } from 'react';
import { MdCheck, MdWarning, MdRefresh } from 'react-icons/md';
import { Modal } from '../UI/Modal';
import Button from '../UI/Button';
import CameraView from './Camera/CameraView';
import { parseVin } from './Parser/fieldParser';
import { isLowConfidence } from './Confidence/confidence';

// Tesseract.js + OpenCV/jscanify (~8MB combined) are only needed once a scan
// actually happens — dynamically imported here so the warranty form page
// never fetches them just because this modal exists in its component tree.
const loadPipeline = () => import('./ImageProcessing/pipeline');
const loadOcr = () => import('./OCR/runOcr');
const loadOcrEngine = () => import('./OCR/ocrEngine');

const STAGE_LABELS = {
  cropping: 'Hujjat chegarasi aniqlanmoqda...',
  orienting: 'Yo\'nalishi tekshirilmoqda...',
  enhancing: 'Tasvir sifati yaxshilanmoqda...',
  ocr: 'Matn o\'qilmoqda...',
};

/**
 * VIN-only scanner — its one job is reading field 11 (chassis/VIN number)
 * off the registration certificate and filling the VIN input. Every other
 * field on the warranty form is entered manually now (see the equipment/
 * vehicle redesign) — this is no longer a multi-step front/back wizard.
 */
const VehicleScannerModal = ({ isOpen, onClose, onComplete }) => {
  const webcamRef = useRef(null);
  const [phase, setPhase] = useState('camera'); // camera | processing | review | error
  const [progressLabel, setProgressLabel] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [vinField, setVinField] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [previewSrc, setPreviewSrc] = useState(null);

  useEffect(() => {
    // Free the (large) Tesseract worker + wasm memory once the modal is closed.
    if (!isOpen) loadOcrEngine().then(({ terminateWorker }) => terminateWorker());
  }, [isOpen]);

  const handleCapture = useCallback(async (rawCanvas) => {
    setPhase('processing');
    setProgressPercent(0);
    setErrorMessage('');

    try {
      const [{ processCapturedImage }, { runDualPassOcr }] = await Promise.all([loadPipeline(), loadOcr()]);

      const processed = await processCapturedImage(rawCanvas, {
        onStage: (stage) => {
          setProgressLabel(STAGE_LABELS[stage]);
          setProgressPercent(stage === 'cropping' ? 10 : stage === 'orienting' ? 25 : 40);
        },
      });
      setPreviewSrc(processed.oriented.toDataURL('image/jpeg', 0.85));

      setProgressLabel(STAGE_LABELS.ocr);
      const ocrData = await runDualPassOcr(processed, (pct) => {
        setProgressPercent(40 + Math.round(pct * 0.6));
      });

      const { fields } = parseVin(ocrData);
      setVinField(fields.vehicle_vin);
      setPhase('review');
    } catch (err) {
      console.error('[VehicleScanner] scan failed', err);
      setErrorMessage('Skanerlab bo\'lmadi. Yorug\'lik va fokusni tekshirib, qayta urinib ko\'ring.');
      setPhase('error');
    }
  }, []);

  const handleFieldChange = (value) => {
    setVinField((prev) => ({ ...prev, value, confidence: 100, source: 'manual' }));
  };

  const handleRescan = () => {
    setPhase('camera');
    setPreviewSrc(null);
    setErrorMessage('');
    setProgressPercent(0);
  };

  const handleConfirm = () => {
    onComplete({ vehicle_vin: vinField?.value || '' });
    resetModal();
  };

  const resetModal = () => {
    setPhase('camera');
    setVinField(null);
    setPreviewSrc(null);
    setErrorMessage('');
    setProgressPercent(0);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" title="VIN raqamini skanerlash">
      <div className="space-y-4">
        {phase === 'camera' && <CameraView webcamRef={webcamRef} onCapture={handleCapture} />}

        {phase === 'processing' && (
          <div className="space-y-3">
            {previewSrc && (
              <img src={previewSrc} alt="processing preview" className="w-full h-56 object-contain bg-gray-100 rounded-lg" />
            )}
            <div className="flex justify-between text-sm text-gray-600">
              <span>{progressLabel}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {phase === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
            <p className="text-red-700 text-sm">{errorMessage}</p>
            <Button onClick={handleRescan} className="w-full">
              <MdRefresh className="w-4 h-4 mr-1 inline" /> Qayta urinish
            </Button>
          </div>
        )}

        {phase === 'review' && vinField && (
          <div className="space-y-3">
            {previewSrc && (
              <img src={previewSrc} alt="captured" className="w-full h-40 object-contain bg-gray-100 rounded-lg" />
            )}
            <div className={`rounded-lg border p-3 ${isLowConfidence(vinField) ? 'border-amber-300 bg-amber-50' : 'border-green-200 bg-green-50'}`}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-600">VIN raqami</label>
                {isLowConfidence(vinField) ? (
                  <span className="flex items-center gap-1 text-xs text-amber-700">
                    <MdWarning className="w-3.5 h-3.5" /> Tekshiring
                  </span>
                ) : (
                  <span className="text-xs text-green-700">{vinField.confidence}%</span>
                )}
              </div>
              <input
                type="text"
                value={vinField.value}
                onChange={(e) => handleFieldChange(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-md px-2 py-1.5 text-sm text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleRescan} className="flex-1">
                <MdRefresh className="w-4 h-4 mr-1 inline" /> Qayta skanerla
              </Button>
              <Button onClick={handleConfirm} className="flex-1">
                <MdCheck className="w-4 h-4 mr-1 inline" /> Tasdiqlash
              </Button>
            </div>
          </div>
        )}

        {phase === 'camera' && (
          <Button variant="ghost" onClick={handleClose} className="w-full">
            Bekor qilish
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default VehicleScannerModal;
