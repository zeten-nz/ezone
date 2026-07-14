import { Modal } from '../UI/Modal';
import StatusBadge from '../UI/StatusBadge';
import { getEquipmentTypeLabel } from '../../config/equipmentCategories';
import { getErrorMessage } from '../../config/errorCodes';
import { extractSyncErrorCode } from '../../utils/syncErrorCode';

const FUEL_DOT = { LPG: 'bg-blue-600', CNG: 'bg-emerald-500' };

const Field = ({ label, value, mono }) => (
  <div>
    <p className="text-xs text-neutral-500">{label}</p>
    <p className={`text-sm font-medium text-neutral-900 mt-0.5 ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
  </div>
);

const FuelTypeField = ({ label, value }) => (
  <div>
    <p className="text-xs text-neutral-500">{label}</p>
    <p className="text-sm font-medium text-neutral-900 mt-0.5 flex items-center gap-1.5">
      {value && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${FUEL_DOT[value] || 'bg-neutral-300'}`} />}
      {value || '—'}
    </p>
  </div>
);

const Section = ({ title, children }) => (
  <div className="border-t border-neutral-100 pt-5 first:border-0 first:pt-0">
    <h3 className="text-sm font-semibold text-neutral-900 mb-3">{title}</h3>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">{children}</div>
  </div>
);

const EquipmentRow = ({ label, fuelType, productName, serial }) => (
  <div className="flex items-start gap-3 py-2">
    {fuelType && (
      <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${FUEL_DOT[fuelType] || 'bg-neutral-300'}`} />
    )}
    <div className="min-w-0">
      <p className="text-xs text-neutral-500">{label}{fuelType ? ` · ${fuelType}` : ''}</p>
      <p className="text-sm font-medium text-neutral-900 truncate">{productName || '—'} / {serial || '—'}</p>
    </div>
  </div>
);

/**
 * Comprehensive read-only detail view, shared by the admin and employee
 * warranty lists. Reads the new warrantyDTO shape — `installer` (nested
 * snapshot: full_name/phone/region/district/branch/branch_code),
 * `vehicle_name` (single field, server-resolved fallback for old rows),
 * `equipment` (the 4 fixed rows) with a `legacy_equipment` fallback for
 * historical rows recorded before either equipment redesign existed.
 */
const WarrantyDetailModal = ({ isOpen, onClose, form, t, language = 'uz' }) => (
  <Modal isOpen={isOpen && !!form} onClose={onClose} title={t('warrantyDetailsTitle')} size="2xl">
    {form && (
      <div className="space-y-5">
        <Section title={t('warrantyInfo')}>
          <Field label={t('warrantyBookNumber')} value={form.warranty_book_number} />
          <div>
            <p className="text-xs text-neutral-500">{t('syncStatus')}</p>
            <div className="mt-1">
              <StatusBadge status={`SYNC_${form.easygas_sync_status}`} />
            </div>
            {form.easygas_sync_status === 'FAILED' && extractSyncErrorCode(form.easygas_last_error) && (
              <p className="text-xs text-neutral-500 mt-1" title={form.easygas_last_error}>
                {getErrorMessage(extractSyncErrorCode(form.easygas_last_error), null, language)}
              </p>
            )}
          </div>
          <Field label={t('installationDate')} value={form.installation_date ? new Date(form.installation_date).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'uz-UZ') : null} />
          <Field label={t('organizationName')} value={form.installer?.branch} />
          <Field label={t('employee')} value={form.employee_name} />
          <Field label={t('region')} value={form.installer?.region} />
          <Field label={t('district')} value={form.installer?.district} />
          <FuelTypeField label={t('fuelType')} value={form.fuel_type} />
        </Section>

        <Section title={t('vehicleInfo')}>
          <Field label={t('vehicleName')} value={form.vehicle_name} />
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
          {form.equipment?.length > 0 ? (
            <div className="divide-y divide-neutral-100">
              {form.equipment.map((item) => (
                <EquipmentRow
                  key={item.equipment_type}
                  label={getEquipmentTypeLabel(t, item.equipment_type)}
                  productName={item.product_name}
                  serial={item.serial_number}
                />
              ))}
            </div>
          ) : form.legacy_equipment ? (
            <div className="divide-y divide-neutral-100">
              <EquipmentRow label={t('reducer')} fuelType={form.legacy_equipment.reducer_fuel_type} productName={form.legacy_equipment.reducer_manufacturer} serial={form.legacy_equipment.reducer_serial_number} />
              <EquipmentRow label={t('cylinder')} fuelType={form.legacy_equipment.cylinder_fuel_type} productName={form.legacy_equipment.cylinder_manufacturer} serial={form.legacy_equipment.cylinder_serial_number} />
              <EquipmentRow label={t('controller')} productName={form.legacy_equipment.stag_controller_manufacturer} serial={form.legacy_equipment.stag_controller_serial_number} />
              <EquipmentRow label={t('injectorRail')} productName={form.legacy_equipment.injector_rail_manufacturer} serial={form.legacy_equipment.injector_rail_serial_number} />
            </div>
          ) : (
            <p className="text-sm text-neutral-500">—</p>
          )}
        </div>
      </div>
    )}
  </Modal>
);

export default WarrantyDetailModal;
