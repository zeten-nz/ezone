import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import ModernEmployeeLayout from '../components/ModernEmployeeLayout';
import { warrantyAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/UI/Button';
import Toast from '../components/UI/Toast';
import { Card, CardContent } from '../components/UI/Card';
import ClaimUrlQr from '../components/Warranty/ClaimUrlQr';
import WarrantyFormFields, {
  createEmptyWarrantyForm,
  validateWarrantyForm,
} from '../components/WarrantyFormFields';

const EmployeeWarrantyFormModern = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  // The created-warranty result returned by the backend (number, fuel type,
  // EasyGas outcome + claim_url) — truthy = success screen. No auto-close
  // timer: the installer needs time to show the QR to the customer, so the
  // screen stays until an explicit "Yopish".
  const [submittedWarranty, setSubmittedWarranty] = useState(null);
  const [errors, setErrors] = useState({});
  const [scannerOpen, setScannerOpen] = useState(false);
  // Lazy initializer — createEmptyWarrantyForm() mints a fresh
  // submission_uuid (this warranty's local create-idempotency key), so it
  // must only run once per form instance, not on every re-render.
  const [formData, setFormData] = useState(() => createEmptyWarrantyForm());

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateWarrantyForm(formData, t);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setToast({ type: 'error', message: t('fillRequiredFields') });
      return;
    }

    setLoading(true);
    try {
      const response = await warrantyAPI.createForm(formData);
      setToast(null);
      setSubmittedWarranty(response.data);
    } catch (err) {
      // err.message is already the correctly translated, user-facing text
      // for this errorCode (see src/api/client.js's response interceptor,
      // which builds it via config/errorCodes.js) — showing it instead of a
      // generic fallback is what lets a specific, actionable failure reach
      // the installer at all.
      setToast({ type: 'error', message: err.message || t('errorSubmittingForm') });
    } finally {
      setLoading(false);
    }
  };

  // Explicit close — the ONLY way off the success screen. Resets to a
  // completely fresh form: createEmptyWarrantyForm() mints a NEW
  // submission_uuid (the previous one must never be reused — it would make
  // the next warranty an idempotent replay of this one), and every piece of
  // per-warranty UI state is cleared.
  const handleCloseSuccess = () => {
    setFormData(createEmptyWarrantyForm());
    setSubmittedWarranty(null);
    setErrors({});
    setToast(null);
    setScannerOpen(false);
  };

  if (submittedWarranty) {
    return (
      <ModernEmployeeLayout>
        <div className="flex items-start justify-center py-6 sm:py-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full max-w-md"
          >
            <Card>
              <CardContent className="p-6 space-y-5 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.35, delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto"
                >
                  <CheckCircle2 className="w-9 h-9 text-green-600" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-semibold text-neutral-900">{t('formSubmitted')}</h2>
                  <p className="text-neutral-500 mt-1">{t('successFormDesc')}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                    <p className="text-xs text-neutral-500">{t('warrantyBookNumber')}</p>
                    <p className="text-sm font-mono font-semibold text-neutral-900 mt-0.5 break-all">
                      {submittedWarranty.warranty_book_number || '—'}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                    <p className="text-xs text-neutral-500">{t('fuelType')}</p>
                    <p className="text-sm font-semibold text-neutral-900 mt-0.5">{submittedWarranty.fuel_type || '—'}</p>
                  </div>
                </div>

                {submittedWarranty.easygas_claim_url ? (
                  <div className="pt-1 space-y-3">
                    <p className="text-sm font-semibold text-neutral-900">{t('warrantyQrTitle')}</p>
                    {/* Reuses the ONE QR presentation — encodes EXACTLY the
                        claim URL the backend returned/stored. */}
                    <ClaimUrlQr claimUrl={submittedWarranty.easygas_claim_url} size={192} />
                  </div>
                ) : (
                  // EasyGas failed or the QR isn't available — the LOCAL
                  // warranty is still saved. A calm localized notice, never
                  // raw API/internal error text.
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm text-amber-800">{t('warrantySavedNoQr')}</p>
                  </div>
                )}

                <Button onClick={handleCloseSuccess} className="w-full">
                  {t('close')}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </ModernEmployeeLayout>
    );
  }

  return (
    <ModernEmployeeLayout>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">{t('warrantyForm')}</h1>
          <p className="text-neutral-500 mt-1.5">{t('empAlert')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <WarrantyFormFields
            formData={formData}
            onChange={handleInputChange}
            onEquipmentChange={(equipment) => setFormData((prev) => ({ ...prev, equipment }))}
            errors={errors}
            scannerOpen={scannerOpen}
            setScannerOpen={setScannerOpen}
            onScannerComplete={(data) => setFormData((prev) => ({ ...prev, ...data }))}
          />

          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="reset" onClick={() => setFormData(createEmptyWarrantyForm())}>
              {t('clear')}
            </Button>
            <Button type="submit" loading={loading}>
              {t('submitForm')}
            </Button>
          </div>
        </form>
      </div>
    </ModernEmployeeLayout>
  );
};

export default EmployeeWarrantyFormModern;
