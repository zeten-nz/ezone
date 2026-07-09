import { Modal } from '../UI/Modal';

const FUEL_DOT = { LPG: 'bg-blue-600', CNG: 'bg-emerald-500' };

const Field = ({ label, value, mono }) => (
  <div>
    <p className="text-xs text-neutral-500">{label}</p>
    <p className={`text-sm font-medium text-neutral-900 mt-0.5 ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
  </div>
);

const Section = ({ title, children }) => (
  <div className="border-t border-neutral-100 pt-5 first:border-0 first:pt-0">
    <h3 className="text-sm font-semibold text-neutral-900 mb-3">{title}</h3>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">{children}</div>
  </div>
);

const EquipmentRow = ({ label, fuelType, manufacturer, serial }) => (
  <div className="flex items-start gap-3 py-2">
    {fuelType && (
      <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${FUEL_DOT[fuelType] || 'bg-neutral-300'}`} />
    )}
    <div className="min-w-0">
      <p className="text-xs text-neutral-500">{label}{fuelType ? ` · ${fuelType}` : ''}</p>
      <p className="text-sm font-medium text-neutral-900 truncate">{manufacturer || '—'} / {serial || '—'}</p>
    </div>
  </div>
);

/**
 * Comprehensive read-only detail view, shared by the admin and employee
 * warranty lists — the previous admin-only modal showed noticeably less
 * (no equipment, mileage, org info) than the employee one for the exact
 * same record; this consolidates on the fuller view for both.
 */
const WarrantyDetailModal = ({ isOpen, onClose, form, t, employeeName, language = 'uz' }) => (
  <Modal isOpen={isOpen && !!form} onClose={onClose} title={t('warrantyDetailsTitle')} size="2xl">
    {form && (
      <div className="space-y-5">
        <Section title={t('warrantyInfo')}>
          <Field label={t('warrantyBookNumber')} value={form.warranty_book_number} />
          <Field label={t('installationDate')} value={form.installation_date ? new Date(form.installation_date).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'uz-UZ') : null} />
          <Field label={t('organizationName')} value={form.organization_name} />
          {employeeName && <Field label={t('employee')} value={employeeName} />}
          <Field label={t('region')} value={form.region} />
          <Field label={t('city')} value={form.city} />
        </Section>

        <Section title={t('vehicleInfo')}>
          <Field label={t('vehicleBrand')} value={form.vehicle_brand} />
          <Field label={t('vehicleModel')} value={form.vehicle_model} />
          <Field label={t('plateNumber')} value={form.vehicle_plate_number} mono />
          <Field label={t('vinNumber')} value={form.vehicle_vin} mono />
          <Field label={t('productionYear')} value={form.vehicle_production_year} />
          <Field label={t('mileage')} value={form.vehicle_mileage ? `${form.vehicle_mileage} km` : null} />
        </Section>

        <Section title={t('ownerName')}>
          <Field label={t('ownerName')} value={form.owner_full_name} />
          <Field label={t('ownerPhone')} value={form.owner_phone} />
        </Section>

        <div className="border-t border-neutral-100 pt-5">
          <h3 className="text-sm font-semibold text-neutral-900 mb-1">{t('equipmentInfo')}</h3>
          <div className="divide-y divide-neutral-100">
            <EquipmentRow label={t('reducer')} fuelType={form.reducer_fuel_type} manufacturer={form.reducer_manufacturer} serial={form.reducer_serial_number} />
            <EquipmentRow label={t('cylinder')} fuelType={form.cylinder_fuel_type} manufacturer={form.cylinder_manufacturer} serial={form.cylinder_serial_number} />
            <EquipmentRow label={t('controller')} manufacturer={form.stag_controller_manufacturer} serial={form.stag_controller_serial_number} />
            <EquipmentRow label={t('injectorRail')} manufacturer={form.injector_rail_manufacturer} serial={form.injector_rail_serial_number} />
          </div>
        </div>
      </div>
    )}
  </Modal>
);

export default WarrantyDetailModal;
