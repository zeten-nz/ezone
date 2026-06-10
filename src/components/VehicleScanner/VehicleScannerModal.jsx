import { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { recognize } from 'tesseract.js';
import { Modal } from '../UI/Modal';
import Button from '../UI/Button';
import { parseFrontSide, parseBackSide } from './parseGuvohnoma';

const VehicleScannerModal = ({ isOpen, onClose, onComplete }) => {
  const webcamRef = useRef(null);
  const [step, setStep] = useState(1);
  const [scanning, setScanning] = useState(false);
  const [frontData, setFrontData] = useState(null);
  const [backData, setBackData] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [extractedFields, setExtractedFields] = useState(null);

  const handleScan = async () => {
    if (!webcamRef.current) return;

    setScanning(true);
    setOcrProgress(0);
    setCapturedImage(null);
    setExtractedFields(null);

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);

      const result = await recognize(imageSrc, 'eng+uzb', {
        logger: (m) => {
          if (m.progress) {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });

      const text = result.data.text;

      let parsed;
      if (step === 1) {
        parsed = parseFrontSide(text);
        setFrontData(parsed);
      } else {
        parsed = parseBackSide(text);
        setBackData(parsed);
      }

      setExtractedFields(parsed);
      setScanning(false);
    } catch (error) {
      console.error('OCR error:', error);
      setScanning(false);
      setExtractedFields({ error: 'Skanerlab bo\'lmadi. Qayta urinib ko\'ring.' });
    }
  };

  const handleRetry = () => {
    setCapturedImage(null);
    setExtractedFields(null);
    setOcrProgress(0);
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
      setCapturedImage(null);
      setExtractedFields(null);
      setOcrProgress(0);
    }
  };

  const handleConfirm = () => {
    const allData = {
      ...frontData,
      ...backData,
    };
    onComplete(allData);
    resetModal();
  };

  const resetModal = () => {
    setStep(1);
    setScanning(false);
    setFrontData(null);
    setBackData(null);
    setCapturedImage(null);
    setOcrProgress(0);
    setExtractedFields(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl" title="Guvohnomani Skanerla">
      <div className="space-y-4">
        {/* Step indicator */}
        <div className="flex gap-4 items-center justify-center">
          <button
            onClick={() => step !== 1 && (setStep(1), handleRetry())}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              step === 1
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer'
            }`}
          >
            ● Oldingi tomon
          </button>
          <span className="text-gray-400">|</span>
          <button
            onClick={() => step !== 2 && frontData && (setStep(2), handleRetry())}
            disabled={!frontData}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              step === 2
                ? 'bg-blue-600 text-white'
                : frontData
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            ○ Orqa tomon
          </button>
        </div>

        {/* Camera or preview */}
        <div className="bg-black rounded-lg overflow-hidden h-80 flex items-center justify-center">
          {!capturedImage ? (
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: 'environment' }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <img src={capturedImage} alt="captured" className="w-full h-full object-cover" />
          )}
        </div>

        {/* Instructions */}
        {!capturedImage && (
          <p className="text-center text-gray-600 text-sm">
            {step === 1
              ? 'Kamerani guvohnomaning oldingi tomoniga yo\'naltiring va "Skanerla" tugmasini bosing'
              : 'Kamerani guvohnomaning orqa tomoniga yo\'naltiring va "Skanerla" tugmasini bosing'}
          </p>
        )}

        {/* OCR Progress */}
        {scanning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tekstni o'qiyapman...</span>
              <span>{ocrProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${ocrProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Extracted fields preview */}
        {extractedFields && !extractedFields.error && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-green-900 text-sm">Topilgan ma'lumotlar:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {Object.entries(extractedFields).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-700">{formatFieldName(key)}:</span>
                  <span className="font-medium text-gray-900">{value || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {extractedFields?.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{extractedFields.error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          {!capturedImage ? (
            <>
              <Button
                variant="secondary"
                onClick={handleClose}
                className="flex-1"
              >
                Bekor qilish
              </Button>
              <Button
                onClick={handleScan}
                disabled={scanning}
                className="flex-1"
              >
                {scanning ? '⏳ Skanerlanmoqda...' : '📷 Skanerla'}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={handleRetry}
                className="flex-1"
              >
                Qayta skanerla
              </Button>
              {step === 1 && frontData && (
                <Button
                  onClick={handleNext}
                  className="flex-1"
                >
                  Keyingisi →
                </Button>
              )}
              {step === 2 && (
                <Button
                  onClick={handleConfirm}
                  className="flex-1"
                >
                  ✓ Tasdiqlash
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

function formatFieldName(key) {
  const names = {
    vehicle_brand: 'Brend',
    vehicle_model: 'Model',
    vehicle_plate_number: 'Raqami',
    vehicle_vin: 'VIN raqami',
    vehicle_production_year: 'Ishlab chiqarish yili',
    vehicle_engine_power: 'Dvigatel quvvati',
    owner_full_name: 'Egasi',
  };
  return names[key] || key;
}

export default VehicleScannerModal;
