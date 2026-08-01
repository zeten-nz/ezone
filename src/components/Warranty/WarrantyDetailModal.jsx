import { Check, X } from 'lucide-react';
import { Modal } from '../UI/Modal';
import StatusBadge from '../UI/StatusBadge';
import Button from '../UI/Button';
import AuthenticatedPhoto from '../UI/AuthenticatedPhoto';
import { getEquipmentTypeLabel } from '../../config/equipmentCategories';
import { warrantyAPI } from '../../services/api';

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
 * Manual Verification workflow — replaces the plain EquipmentRow above for
 * any row whose verification_status isn't the ordinary AUTO default. Shows
 * exactly what the spec asks the admin to see (seller name/phone, comment,
 * photo, who reviewed it and when) plus, for a still-PENDING row, Approve/
 * Reject actions. The actual confirmation UI and API calls are owned by the
 * parent page (onApprove/onReject callbacks) — same separation
 * AdminWarrantyFormsModern already uses for delete/retry-sync, so this stays
 * a presentational component like the rest of this file.
 */
const ManualVerificationRow = ({ item, t, language, onApprove, onReject, canReview }) => (
  <div className="py-3 space-y-3">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs text-neutral-500">{getEquipmentTypeLabel(t, item.equipment_type)}</p>
        <p className="text-sm font-medium text-neutral-900 truncate">{item.product_name || '—'}</p>
      </div>
      <StatusBadge status={`VERIFICATION_${item.verification_status}`} />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pl-0">
      <Field label={t('sellerName')} value={item.seller_name} />
      <Field label={t('sellerPhone')} value={item.seller_phone} />
      <div className="col-span-2 sm:col-span-1">
        <p className="text-xs text-neutral-500">{t('verificationComment')}</p>
        <p className="text-sm font-medium text-neutral-900 mt-0.5">{item.verification_comment || '—'}</p>
      </div>
    </div>
    {item.manual_verification_photo_filename && (
      <div>
        <p className="text-xs text-neutral-500 mb-1">{t('verificationPhotoOptional')}</p>
        <AuthenticatedPhoto
          fetcher={() => warrantyAPI.getEquipmentPhotoBlob(item.id)}
          cacheKey={item.id}
          className="w-24 h-24 rounded-lg border border-neutral-200"
        />
      </div>
    )}
    {item.verification_status !== 'PENDING' && item.reviewed_at && (
      <p className="text-xs text-neutral-500">
        {t('reviewedBy')}: {item.reviewed_by_name || '—'} · {new Date(item.reviewed_at).toLocaleString(language === 'ru' ? 'ru-RU' : 'uz-UZ')}
        {item.review_notes && <> · “{item.review_notes}”</>}
      </p>
    )}
    {item.verification_status === 'PENDING' && canReview && (
      <div className="flex gap-2 pt-1">
        <Button size="sm" variant="success" icon={Check} onClick={() => onApprove(item.id)}>
          {t('approve')}
        </Button>
        <Button size="sm" variant="danger" icon={X} onClick={() => onReject(item.id)}>
          {t('reject')}
        </Button>
      </div>
    )}
  </div>
);

/**
 * Comprehensive read-only detail view, shared by the admin and employee
 * warranty lists. Reads the new warrantyDTO shape — `installer` (nested
 * snapshot: full_name/phone/region/district/branch/branch_code),
 * `vehicle_name` (single field, server-resolved fallback for old rows),
 * `equipment` (the 4 fixed rows) with a `legacy_equipment` fallback for
 * historical rows recorded before either equipment redesign existed.
 *
 * Manual Verification workflow: onApproveVerification/onRejectVerification
 * are optional — only the admin warranty page passes them (with
 * canReview), so an installer viewing their own warranty here still sees
 * seller info/photo/status on a row awaiting review, just never the
 * Approve/Reject buttons. The parent owns the actual confirm/reject-reason
 * UI and API calls, same as it already does for delete/retry-sync.
 */
const WarrantyDetailModal = ({ isOpen, onClose, form, t, language = 'uz', onApproveVerification, onRejectVerification, canReview = false }) => (
  <Modal isOpen={isOpen && !!form} onClose={onClose} title={t('warrantyDetailsTitle')} size="2xl">
    {form && (
      <div className="space-y-5">
        <Section title={t('warrantyInfo')}>
          <Field label={t('warrantyBookNumber')} value={form.warranty_book_number} />
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
                item.verification_status && item.verification_status !== 'AUTO' ? (
                  <ManualVerificationRow
                    key={item.equipment_type}
                    item={item}
                    t={t}
                    language={language}
                    canReview={canReview}
                    onApprove={onApproveVerification}
                    onReject={onRejectVerification}
                  />
                ) : (
                  <EquipmentRow
                    key={item.equipment_type}
                    label={getEquipmentTypeLabel(t, item.equipment_type)}
                    productName={item.product_name}
                    serial={item.serial_number}
                  />
                )
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
