import { useState } from 'react';
import { Search, Car, Wrench, QrCode, Loader2, UserRound } from 'lucide-react';
import ModernEmployeeLayout from '../components/ModernEmployeeLayout';
import { warrantyAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent } from '../components/UI/Card';
import Button from '../components/UI/Button';
import PhoneInput from '../components/UI/PhoneInput';
import EmptyState from '../components/UI/EmptyState';
import ErrorState from '../components/UI/ErrorState';
import StatusBadge from '../components/UI/StatusBadge';
import { Modal } from '../components/UI/Modal';
import ClaimUrlQr from '../components/Warranty/ClaimUrlQr';
import { getEquipmentTypeLabel } from '../config/equipmentCategories';
import { equipmentSlots } from '../utils/warrantyLookupDisplay';
import { PHONE_REGEX } from '../config/phone';

const formatDate = (value, language) => {
  if (!value) return '—';
  const d = new Date(value);
  return isNaN(d) ? '—' : d.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' });
};

/** One warranty result — everything a technician at the car needs on one card. */
const LookupResultCard = ({ item, t, language, onShowQr }) => (
  <Card>
    <CardContent className="p-4 sm:p-5 space-y-4">
      {/* Customer + warranty header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <UserRound className="w-4 h-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-neutral-900 truncate">{item.owner_full_name || '—'}</p>
            <p className="text-sm text-neutral-500">{item.owner_phone || '—'}</p>
          </div>
        </div>
        <div className="text-right space-y-1">
          <StatusBadge status={`WARRANTY_${item.status}`} />
          <p className="font-mono text-xs text-neutral-500">{item.warranty_book_number || '—'}</p>
          <p className="text-xs text-neutral-500">{t('installationDate')}: {formatDate(item.installation_date, language)}</p>
        </div>
      </div>

      {/* Vehicle */}
      <div className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50 border border-neutral-100">
        <Car className="w-4 h-4 text-neutral-500 mt-0.5 flex-shrink-0" />
        <div className="min-w-0 text-sm">
          <p className="font-medium text-neutral-900 truncate">
            {item.vehicle_name || '—'}
            {item.vehicle_production_year ? <span className="text-neutral-500 font-normal"> · {item.vehicle_production_year}</span> : null}
          </p>
          <p className="text-neutral-600">
            <span className="font-mono">{item.vehicle_plate_number || '—'}</span>
            {item.vehicle_vin && <span className="font-mono text-xs text-neutral-400"> · VIN {item.vehicle_vin}</span>}
          </p>
          <p className="text-xs text-neutral-500">
            {item.fuel_type || '—'}
            {item.vehicle_mileage != null && <> · {item.vehicle_mileage} km</>}
          </p>
        </div>
      </div>

      {/* Installed equipment — the 4 fixed slots; an absent slot shows
          "Kiritilmagan", never fake data (historical/malformed tolerance) */}
      <div>
        <p className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900 mb-2">
          <Wrench className="w-4 h-4 text-neutral-500" /> {t('installedEquipment')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {equipmentSlots(item).map((slot) => (
            <div key={slot.type} className="p-2.5 rounded-lg border border-neutral-100">
              <p className="text-xs text-neutral-500">{getEquipmentTypeLabel(t, slot.type)}</p>
              {slot.product || slot.serial ? (
                <>
                  <p className="text-sm font-medium text-neutral-900 truncate">{slot.product || t('notProvided')}</p>
                  <p className="text-xs text-neutral-600">
                    {t('serialLabel')}: {slot.serial ? <span className="font-mono">{slot.serial}</span> : t('notProvided')}
                  </p>
                </>
              ) : (
                <p className="text-sm text-neutral-400">{t('notProvided')}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Installer / branch + QR action */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-100">
        <p className="text-xs text-neutral-500 min-w-0">
          {t('installerLabel')}: <span className="text-neutral-700 font-medium">{item.installer?.full_name || '—'}</span>
          {' · '}
          {t('branchLabel')}: <span className="text-neutral-700">{item.installer?.branch || '—'}</span>
          {item.installer?.branch_code && <span className="font-mono"> ({item.installer.branch_code})</span>}
        </p>
        {item.easygas_claim_url && (
          <Button size="sm" variant="success" icon={QrCode} onClick={() => onShowQr(item)}>
            {t('viewEasyGasWarrantyShort')}
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

/**
 * "Mijozni topish" — the technician's customer lookup (Beta-1). Enter a
 * phone number, see every warranty registered to it: vehicle, installed
 * equipment + serials, installation date, installer/branch. Search fires
 * only on explicit submit (never per keystroke), double submits are
 * blocked while a lookup runs, and multiple warranties/vehicles render as
 * separate cards newest-first (server order).
 */
const CustomerLookupModern = () => {
  const { t, language } = useLanguage();
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null); // null = nothing searched yet
  const [qrItem, setQrItem] = useState(null);

  const performSearch = async () => {
    if (loading) return;
    if (!PHONE_REGEX.test(phone)) {
      setPhoneError(t('valPhoneInvalid'));
      return;
    }
    setPhoneError(null);
    setError(null);
    setLoading(true);
    try {
      const response = await warrantyAPI.lookupByPhone(phone);
      setResults(response.data);
    } catch (err) {
      setError(err.message);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    void performSearch();
  };

  return (
    <ModernEmployeeLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">{t('customerLookup')}</h1>
          <p className="text-neutral-500 mt-1.5">{t('customerLookupDesc')}</p>
        </div>

        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-start" noValidate>
              <PhoneInput
                label={t('phone')}
                value={phone}
                onChange={(value) => { setPhone(value); if (phoneError) setPhoneError(null); }}
                error={phoneError}
              />
              <div className="sm:pt-7">
                <Button type="submit" icon={Search} loading={loading} disabled={loading} className="w-full sm:w-auto">
                  {t('searchAction')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {loading && (
          <div className="flex items-center justify-center gap-2 py-12 text-neutral-500">
            <Loader2 className="w-5 h-5 animate-spin" /> {t('loadingResults')}
          </div>
        )}

        {!loading && error && (
          <Card>
            <CardContent>
              <ErrorState title={t('lookupFailed')} description={error} onRetry={performSearch} />
            </CardContent>
          </Card>
        )}

        {!loading && !error && results && results.length === 0 && (
          <Card>
            <CardContent>
              <EmptyState title={t('noCustomerFound')} description={t('noCustomerFoundDesc')} icon={Search} />
            </CardContent>
          </Card>
        )}

        {!loading && !error && results && results.length > 0 && (
          <div className="space-y-4">
            {results.map((item) => (
              <LookupResultCard key={item.id} item={item} t={t} language={language} onShowQr={setQrItem} />
            ))}
          </div>
        )}
      </div>

      {/* EasyGas warranty QR — same presentation as Warranty History */}
      <Modal isOpen={!!qrItem} onClose={() => setQrItem(null)} title={t('easyGasWarrantyTitle')} size="sm">
        {qrItem && (
          <div className="py-2">
            <ClaimUrlQr claimUrl={qrItem.easygas_claim_url} size={208} />
          </div>
        )}
      </Modal>
    </ModernEmployeeLayout>
  );
};

export default CustomerLookupModern;
