import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import ModernEmployeeLayout from '../components/ModernEmployeeLayout';
import { warrantyAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/UI/Button';
import Toast from '../components/UI/Toast';
import WarrantyFormFields, {
  createEmptyWarrantyForm,
  validateWarrantyForm,
} from '../components/WarrantyFormFields';

const EmployeeWarrantyFormModern = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [submitted, setSubmitted] = useState(false);
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
      await warrantyAPI.createForm(formData);
      setToast({ type: 'success', message: t('formSubmitted') });
      setSubmitted(true);
      setTimeout(() => {
        setFormData(createEmptyWarrantyForm());
        setSubmitted(false);
      }, 2000);
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

  if (submitted) {
    return (
      <ModernEmployeeLayout>
        <div className="flex items-center justify-center min-h-[28rem]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="text-center space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.35, delay: 0.1, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto"
            >
              <CheckCircle2 className="w-9 h-9 text-green-600" />
            </motion.div>
            <h2 className="text-2xl font-semibold text-neutral-900">{t('formSubmitted')}</h2>
            <p className="text-neutral-500">{t('successFormDesc')}</p>
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
