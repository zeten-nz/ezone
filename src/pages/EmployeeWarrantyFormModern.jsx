import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import ModernEmployeeLayout from '../components/ModernEmployeeLayout';
import { warrantyAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/UI/Button';
import Toast from '../components/UI/Toast';
import WarrantyFormFields, {
  EMPTY_WARRANTY_FORM,
  validateWarrantyForm,
} from '../components/WarrantyFormFields';

const EmployeeWarrantyFormModern = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [scannerOpen, setScannerOpen] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_WARRANTY_FORM });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === 'region') return { ...prev, [name]: value, city: '', district: '' };
      return { ...prev, [name]: value };
    });
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
        setFormData({ ...EMPTY_WARRANTY_FORM });
        setSubmitted(false);
      }, 2000);
    } catch {
      setToast({ type: 'error', message: t('errorSubmittingForm') });
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
            errors={errors}
            scannerOpen={scannerOpen}
            setScannerOpen={setScannerOpen}
            onScannerComplete={(data) => setFormData((prev) => ({ ...prev, ...data }))}
          />

          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="reset" onClick={() => setFormData({ ...EMPTY_WARRANTY_FORM })}>
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
