/**
 * WarrantyFormFields — shared presentational component for the warranty form.
 * Installer/organization fields are never collected here — see the read-only
 * profile/branch summary and EMPTY_WARRANTY_FORM's comment below.
 *
 * Used by:
 *   - EmployeeWarrantyFormModern  (create)
 *   - EmployeeWarrantyHistoryModern (edit modal)
 *   - AdminWarrantyFormsModern    (edit modal)
 *
 * Future features that render the same fields (print, PDF export) should import
 * this component rather than duplicating the field definitions.
 */

import { useState, useEffect } from 'react';
import { Camera, FileText, Car, User, Wrench, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { authAPI } from '../services/api';
import { Card, CardContent, CardHeader } from './UI/Card';
import Input from './UI/Input';
import EquipmentSection from './Warranty/EquipmentSection';
import VehicleNameField from './Warranty/VehicleNameField';
import VehicleScannerModal from './VehicleScanner/VehicleScannerModal';
import { EMPTY_EQUIPMENT_ROWS, getEquipmentTypeLabel } from '../config/equipmentCategories';

// ── Blank template used for the create form initial state ──────────────────────
// Installer/organization fields are gone — a real ERP doesn't re-ask for data
// the logged-in employee's profile/branch already has. The server derives
// them at submission time (see ezone-server/services/warrantyService.js);
// ProfileSummary below just shows the installer what will be recorded.
// vehicle_brand/vehicle_model/engine volume/power are gone too — vehicle_name
// is a single field now, and engine specs are no longer collected. car_id is
// set only when the installer picks a match from the synced car catalog
// autocomplete (see components/Warranty/VehicleNameField.jsx) — null means
// free text, which always remains a valid submission on its own.
// warranty_book_number is no longer typed by the installer either — EasyGas
// generates the official number and it lands here once sync succeeds (see
// the EasyGas integration plan); kept as a key for structural symmetry with
// the edit flow (which loads an existing warranty's value), always shown
// read-only, never as an editable input — see Section 1 below.
export const EMPTY_WARRANTY_FORM = {
  warranty_book_number: '',
  installation_date: '',
  fuel_type: null,
  vehicle_name: '',
  car_id: null,
  vehicle_production_year: new Date().getFullYear(),
  vehicle_plate_number: '',
  vehicle_vin: '',
  vehicle_mileage: '',
  owner_full_name: '',
  owner_phone: '',
  equipment: EMPTY_EQUIPMENT_ROWS(),
};

// EMPTY_WARRANTY_FORM is a shared, module-level template — spreading it
// alone would mean every fresh form instance carries no submission_uuid (or
// worse, silently shares one generated once at module-load time across every
// warranty in the session). This is EasyGas's idempotency key for a
// warranty's whole lifecycle, so it must be minted fresh, once, per NEW
// warranty — every reset site (initial mount, "Clear", and the post-submit
// success reset) must use this helper instead of spreading
// EMPTY_WARRANTY_FORM directly.
export const createEmptyWarrantyForm = () => ({
  ...EMPTY_WARRANTY_FORM,
  submission_uuid: crypto.randomUUID(),
});

// ── Per-section required fields — drives both validation and the section's
// completion badge, so the two can never disagree with each other.
// vehicle_plate_number is deliberately excluded — it's optional, and
// warranty_book_number is excluded too — it's never installer-entered (see
// EMPTY_WARRANTY_FORM's comment above). `equipment` isn't a scalar field so
// it's checked separately (see isSectionComplete and validateWarrantyForm
// below) rather than living in this flat map. ─────────
const SECTION_FIELDS = {
  warranty: ['installation_date'],
  vehicle: ['vehicle_name', 'vehicle_production_year', 'vehicle_vin', 'vehicle_mileage'],
  owner: ['owner_full_name', 'owner_phone'],
};

// ── Shared client-side validator ───────────────────────────────────────────────
// Range checks below mirror ezone-server/routes/warrantyRoutes.js's
// validators exactly (which in turn mirror EasyGas's documented integration
// limits) — failing fast here avoids a round trip just to get the same
// rejection back from the server.
const MIN_PRODUCTION_YEAR = 1950;
const MAX_MILEAGE = 4294967295;
const MIN_INSTALLATION_DATE = new Date('2015-01-01');

export const validateWarrantyForm = (formData, t) => {
  const errors = {};
  const requiredFields = Object.values(SECTION_FIELDS).flat();
  requiredFields.forEach((field) => {
    if (!formData[field]) errors[field] = t('fieldRequired');
  });

  // One fuel type for the whole installation — required alongside, not
  // nested inside, the per-row equipment errors below.
  if (!formData.fuel_type) errors.fuel_type = t('fieldRequired');

  if (formData.vehicle_production_year && !errors.vehicle_production_year) {
    const year = Number(formData.vehicle_production_year);
    const maxYear = new Date().getFullYear() + 1;
    if (!Number.isInteger(year) || year < MIN_PRODUCTION_YEAR || year > maxYear) {
      errors.vehicle_production_year = t('valYearRange');
    }
  }

  if (formData.vehicle_mileage && !errors.vehicle_mileage) {
    const mileage = Number(formData.vehicle_mileage);
    if (!Number.isInteger(mileage) || mileage < 0 || mileage > MAX_MILEAGE) {
      errors.vehicle_mileage = t('valMileageRange');
    }
  }

  if (formData.installation_date && !errors.installation_date) {
    const date = new Date(formData.installation_date);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date < MIN_INSTALLATION_DATE || date > tomorrow) {
      errors.installation_date = t('valInstallationDateRange');
    }
  }

  const equipmentErrors = {};
  (formData.equipment || []).forEach((row) => {
    if (!row.product) equipmentErrors[row.equipment_type] = t('valProductRequired');
  });
  if (Object.keys(equipmentErrors).length > 0) {
    errors.equipment = equipmentErrors;
  }

  return errors;
};

const isSectionComplete = (formData, section) => {
  if (section === 'equipment') {
    return !!formData.fuel_type && (formData.equipment || []).every((row) => !!row.product);
  }
  return SECTION_FIELDS[section].every((field) => !!formData[field]);
};

// ── Section wrapper (module-level to satisfy react-refresh/only-export-components) ──
const SectionCard = ({ title, icon: Icon, complete, completeLabel, children }) => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>
        <h2 className="text-base font-semibold text-neutral-900 flex-1">{title}</h2>
        {complete && (
          <CheckCircle2 className="w-5 h-5 text-green-500" title={completeLabel} />
        )}
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      {children}
    </CardContent>
  </Card>
);

// ── Props ──────────────────────────────────────────────────────────────────────
// formData        — current form values (controlled)
// onChange        — standard event handler: (e) => void
// onEquipmentChange — (equipment[]) => void; replaces the whole 4-row array
// errors          — field-keyed error strings (errors.equipment is an object
//                   keyed by equipment_type instead of a scalar string)
// scannerOpen     — controls VehicleScannerModal visibility
// setScannerOpen  — toggle function
// onScannerComplete — called with { vehicle_vin }; parent merges into state
// legacyEquipment — read-only { reducer_manufacturer, ... } from a historical
//                   row recorded before either equipment redesign existed;
//                   undefined for new forms and for any row that already has
//                   `equipment` rows (see warrantyDTO.js's legacy_equipment).
const WarrantyFormFields = ({
  formData,
  onChange,
  onEquipmentChange,
  errors = {},
  scannerOpen = false,
  setScannerOpen,
  onScannerComplete,
  legacyEquipment,
}) => {
  const { t } = useLanguage();
  const [profile, setProfile] = useState(null);

  // Read-only — shows the installer exactly what the server will snapshot
  // onto the submission (see ezone-server/services/warrantyService.js's
  // getEmployeeSnapshot). Never editable here; if it's wrong, an admin fixes
  // the employee's branch assignment, not this form.
  useEffect(() => {
    void (async () => {
      try {
        const response = await authAPI.getProfile();
        setProfile(response.data);
      } catch {
        // Non-fatal — the summary just won't render; submission itself
        // still fails server-side with INCOMPLETE_PROFILE if truly incomplete.
      }
    })();
  }, []);

  return (
    <>
      {profile && (
        <Card>
          <CardContent className="flex flex-wrap gap-x-8 gap-y-3 py-4">
            <div>
              <p className="text-xs text-neutral-500">{t('installerName')}</p>
              <p className="text-sm font-medium text-neutral-900">{profile.full_name}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">{t('installerPhone')}</p>
              <p className="text-sm font-medium text-neutral-900">{profile.phone || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">{t('organizationName')}</p>
              <p className="text-sm font-medium text-neutral-900">{profile.branch_name || profile.branch_code || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">{t('region')}</p>
              <p className="text-sm font-medium text-neutral-900">{profile.branch_region || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">{t('district')}</p>
              <p className="text-sm font-medium text-neutral-900">{profile.branch_district || '—'}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 1 — Warranty number (read-only, EasyGas-assigned) + installation date */}
      <SectionCard title={t('sectionWarranty')} icon={FileText} complete={isSectionComplete(formData, 'warranty')} completeLabel={t('sectionComplete')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.warranty_book_number ? (
            <div>
              <p className="text-sm font-medium text-neutral-700 mb-2">{t('warrantyBookNumber')}</p>
              <p className="text-sm font-mono text-neutral-900 px-4 py-2.5 rounded-lg border border-neutral-200 bg-neutral-50">
                {formData.warranty_book_number}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-neutral-700 mb-2">{t('warrantyBookNumber')}</p>
              <p className="text-sm text-neutral-500 px-4 py-2.5 rounded-lg border border-dashed border-neutral-200">
                {t('warrantyNumberPendingSync')}
              </p>
            </div>
          )}
          <Input
            label={t('installationDate')}
            name="installation_date"
            type="date"
            value={formData.installation_date}
            onChange={onChange}
            error={errors.installation_date}
            required
          />
        </div>
      </SectionCard>

      {/* Section 2 — Vehicle details + VIN-only scanner */}
      <SectionCard title={t('sectionVehicle')} icon={Car} complete={isSectionComplete(formData, 'vehicle')} completeLabel={t('sectionComplete')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <VehicleNameField
            value={formData.vehicle_name}
            onChange={({ vehicle_name, car_id }) => {
              onChange({ target: { name: 'vehicle_name', value: vehicle_name } });
              onChange({ target: { name: 'car_id', value: car_id } });
            }}
            error={errors.vehicle_name}
          />
          <Input
            label={t('productionYear')}
            name="vehicle_production_year"
            type="number"
            value={formData.vehicle_production_year}
            onChange={onChange}
            error={errors.vehicle_production_year}
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                label={t('vinNumber')}
                name="vehicle_vin"
                value={formData.vehicle_vin}
                onChange={onChange}
                error={errors.vehicle_vin}
                required
              />
            </div>
            <button
              type="button"
              onClick={() => setScannerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors flex-shrink-0"
              title={t('scanCertificate')}
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <Input
            label={t('plateNumber')}
            name="vehicle_plate_number"
            hint={t('plateNumberOptionalHint')}
            value={formData.vehicle_plate_number}
            onChange={onChange}
            error={errors.vehicle_plate_number}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('mileage')}
            name="vehicle_mileage"
            type="number"
            value={formData.vehicle_mileage}
            onChange={onChange}
            error={errors.vehicle_mileage}
            required
          />
        </div>
      </SectionCard>

      {/* Section 3 — Owner details */}
      <SectionCard title={t('sectionOwner')} icon={User} complete={isSectionComplete(formData, 'owner')} completeLabel={t('sectionComplete')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('ownerName')}
            name="owner_full_name"
            value={formData.owner_full_name}
            onChange={onChange}
            error={errors.owner_full_name}
            required
          />
          <Input
            label={t('ownerPhone')}
            name="owner_phone"
            type="tel"
            value={formData.owner_phone}
            onChange={onChange}
            error={errors.owner_phone}
            required
          />
        </div>
      </SectionCard>

      {/* Section 4 — Equipment: 4 fixed rows, product picked from the catalog */}
      <SectionCard title={t('sectionEquipment')} icon={Wrench} complete={isSectionComplete(formData, 'equipment')} completeLabel={t('sectionComplete')}>
        <EquipmentSection
          fuelType={formData.fuel_type}
          onFuelTypeChange={(value) => onChange({ target: { name: 'fuel_type', value } })}
          fuelTypeError={errors.fuel_type}
          equipment={formData.equipment || []}
          onChange={(equipment) => onEquipmentChange?.(equipment)}
          errors={errors.equipment || {}}
        />

        {legacyEquipment && (
          <div className="mt-6 pt-6 border-t border-neutral-100">
            <p className="text-sm font-semibold text-neutral-900">{t('legacyEquipmentTitle')}</p>
            <p className="text-xs text-neutral-500 mb-4">{t('legacyEquipmentDesc')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {legacyEquipment.reducer_manufacturer && (
                <div>
                  <p className="text-xs text-neutral-500">{getEquipmentTypeLabel(t, 'REDUCER')}</p>
                  <p className="font-medium text-neutral-900">{legacyEquipment.reducer_manufacturer} / {legacyEquipment.reducer_serial_number}</p>
                </div>
              )}
              {legacyEquipment.cylinder_manufacturer && (
                <div>
                  <p className="text-xs text-neutral-500">{getEquipmentTypeLabel(t, 'CYLINDER')}</p>
                  <p className="font-medium text-neutral-900">{legacyEquipment.cylinder_manufacturer} / {legacyEquipment.cylinder_serial_number}</p>
                </div>
              )}
              {legacyEquipment.stag_controller_manufacturer && (
                <div>
                  <p className="text-xs text-neutral-500">{getEquipmentTypeLabel(t, 'CONTROLLER')}</p>
                  <p className="font-medium text-neutral-900">{legacyEquipment.stag_controller_manufacturer} / {legacyEquipment.stag_controller_serial_number}</p>
                </div>
              )}
              {legacyEquipment.injector_rail_manufacturer && (
                <div>
                  <p className="text-xs text-neutral-500">{getEquipmentTypeLabel(t, 'INJECTOR_RAIL')}</p>
                  <p className="font-medium text-neutral-900">{legacyEquipment.injector_rail_manufacturer} / {legacyEquipment.injector_rail_serial_number}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </SectionCard>

      <VehicleScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onComplete={(data) => {
          onScannerComplete?.(data);
          setScannerOpen(false);
        }}
      />
    </>
  );
};

export default WarrantyFormFields;
