import { useRef, useState, useCallback, useEffect } from 'react';
import { MdCheck, MdArrowForward, MdWarning, MdRefresh } from 'react-icons/md';
import { Modal } from '../UI/Modal';
import Button from '../UI/Button';
import CameraView from './Camera/CameraView';
import { parseFrontSide, parseBackSide } from './Parser/fieldParser';
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

const FIELD_LABELS = {
  vehicle_plate_number: 'Davlat raqami',
  vehicle_brand: 'Brend',
  vehicle_model: 'Model',
  owner_full_name: 'Egasi',
  vehicle_production_year: 'Ishlab chiqarish yili',
  vehicle_vin: 'VIN raqami',
  vehicle_engine_power: 'Dvigatel quvvati',
};

function FieldRow({ name, field, onChange }) {
  const low = isLowConfidence(field);
  return (
    <div className={`rounded-lg border p-3 ${low ? 'border-amber-300 bg-amber-50' : 'border-green-200 bg-green-50'}`}>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium text-gray-600">{FIELD_LABELS[name] || name}</label>
        {low ? (
          <span className="flex items-center gap-1 text-xs text-amber-700">
            <MdWarning className="w-3.5 h-3.5" /> Tekshiring
          </span>
        ) : (
          <span className="text-xs text-green-700">{field.confidence}%</span>
        )}
      </div>
      <input
        type="text"
        value={field.value}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-full bg-white border border-gray-300 rounded-md px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

const VehicleScannerModal = ({ isOpen, onClose, onComplete }) => {
  const webcamRef = useRef(null);
  const [step, setStep] = useState(1); // 1 = front, 2 = back
  const [phase, setPhase] = useState('camera'); // camera | processing | review | error
  const [progressLabel, setProgressLabel] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [frontFields, setFrontFields] = useState(null);
  const [backFields, setBackFields] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [previewSrc, setPreviewSrc] = useState(null);

  useEffect(() => {
    // Free the (large) Tesseract worker + wasm memory once the modal is closed.
    if (!isOpen) loadOcrEngine().then(({ terminateWorker }) => terminateWorker());
  }, [isOpen]);

  const handleCapture = useCallback(
    async (rawCanvas) => {
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

        const { fields } = step === 1 ? parseFrontSide(ocrData) : parseBackSide(ocrData);
        if (step === 1) setFrontFields(fields);
        else setBackFields(fields);

        setPhase('review');
      } catch (err) {
        console.error('[VehicleScanner] scan failed', err);
        setErrorMessage('Skanerlab bo\'lmadi. Yorug\'lik va fokusni tekshirib, qayta urinib ko\'ring.');
        setPhase('error');
      }
    },
    [step]
  );

  const handleFieldChange = (name, value) => {
    const setFields = step === 1 ? setFrontFields : setBackFields;
    setFields((prev) => ({
      ...prev,
      [name]: { ...prev[name], value, confidence: 100, source: 'manual' },
    }));
  };

  const handleRescan = () => {
    setPhase('camera');
    setPreviewSrc(null);
    setErrorMessage('');
    setProgressPercent(0);
  };

  const handleNext = () => {
    setStep(2);
    setPhase('camera');
    setPreviewSrc(null);
  };

  const handleConfirm = () => {
    const flatten = (fields) => Object.fromEntries(Object.entries(fields || {}).map(([k, f]) => [k, f.value]));
    onComplete({ ...flatten(frontFields), ...flatten(backFields) });
    resetModal();
  };

  const resetModal = () => {
    setStep(1);
    setPhase('camera');
    setFrontFields(null);
    setBackFields(null);
    setPreviewSrc(null);
    setErrorMessage('');
    setProgressPercent(0);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const currentFields = step === 1 ? frontFields : backFields;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl" title="Guvohnomani Skanerla">
      <div className="space-y-4">
        <div className="flex gap-4 items-center justify-center">
          <button
            onClick={() => step !== 1 && setStep(1)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer'
            }`}
          >
            1. Oldingi tomon
          </button>
          <span className="text-gray-400">|</span>
          <button
            onClick={() => step !== 2 && frontFields && setStep(2)}
            disabled={!frontFields}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              step === 2
                ? 'bg-blue-600 text-white'
                : frontFields
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            2. Orqa tomon
          </button>
        </div>

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

        {phase === 'review' && currentFields && (
          <div className="space-y-3">
            {previewSrc && (
              <img src={previewSrc} alt="captured" className="w-full h-40 object-contain bg-gray-100 rounded-lg" />
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(currentFields).map(([name, field]) => (
                <FieldRow key={name} name={name} field={field} onChange={handleFieldChange} />
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleRescan} className="flex-1">
                <MdRefresh className="w-4 h-4 mr-1 inline" /> Qayta skanerla
              </Button>
              {step === 1 && (
                <Button onClick={handleNext} className="flex-1">
                  Keyingisi <MdArrowForward className="w-4 h-4 ml-1 inline" />
                </Button>
              )}
              {step === 2 && (
                <Button onClick={handleConfirm} className="flex-1">
                  <MdCheck className="w-4 h-4 mr-1 inline" /> Tasdiqlash
                </Button>
              )}
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
