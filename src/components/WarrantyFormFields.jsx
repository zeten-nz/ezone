/**
 * WarrantyFormFields — shared presentational component for the 29-field warranty form.
 *
 * Used by:
 *   - EmployeeWarrantyFormModern  (create)
 *   - EmployeeWarrantyHistoryModern (edit modal)
 *   - AdminWarrantyFormsModern    (edit modal)
 *
 * Future features that render the same fields (print, PDF export) should import
 * this component rather than duplicating the field definitions.
 */

import { Camera, Building2, Car, User, Wrench, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { regions } from '../regions';
import { Card, CardContent, CardHeader } from './UI/Card';
import Input from './UI/Input';
import Select from './UI/Select';
import VehicleScannerModal from './VehicleScanner/VehicleScannerModal';

// ── Blank template used for the create form initial state ──────────────────────
export const EMPTY_WARRANTY_FORM = {
  region: '',
  city: '',
  district: '',
  organization_name: '',
  organization_phone: '',
  installer_full_name: '',
  warranty_book_number: '',
  installation_date: '',
  vehicle_brand: '',
  vehicle_model: '',
  vehicle_production_year: new Date().getFullYear(),
  vehicle_plate_number: '',
  vehicle_vin: '',
  vehicle_engine_volume: '',
  vehicle_engine_power: '',
  vehicle_mileage: '',
  owner_full_name: '',
  owner_phone: '',
  reducer_fuel_type: 'LPG',
  reducer_manufacturer: '',
  reducer_serial_number: '',
  cylinder_fuel_type: 'LPG',
  cylinder_manufacturer: '',
  cylinder_serial_number: '',
  stag_controller_manufacturer: '',
  stag_controller_serial_number: '',
  injector_rail_manufacturer: '',
  injector_rail_serial_number: '',
};

// ── Per-section required fields — drives both validation and the section's
// completion badge, so the two can never disagree with each other. ────────────
const SECTION_FIELDS = {
  organization: ['region', 'city', 'district', 'organization_name', 'organization_phone', 'installer_full_name', 'warranty_book_number', 'installation_date'],
  vehicle: ['vehicle_brand', 'vehicle_model', 'vehicle_plate_number', 'vehicle_vin', 'vehicle_engine_volume', 'vehicle_engine_power', 'vehicle_mileage'],
  owner: ['owner_full_name', 'owner_phone'],
  equipment: ['reducer_manufacturer', 'reducer_serial_number', 'cylinder_manufacturer', 'cylinder_serial_number', 'stag_controller_manufacturer', 'stag_controller_serial_number', 'injector_rail_manufacturer', 'injector_rail_serial_number'],
};

// ── Shared client-side validator ───────────────────────────────────────────────
export const validateWarrantyForm = (formData, t) => {
  const errors = {};
  const requiredFields = Object.values(SECTION_FIELDS).flat();
  requiredFields.forEach((field) => {
    if (!formData[field]) errors[field] = t('fieldRequired');
  });
  return errors;
};

const isSectionComplete = (formData, section) =>
  SECTION_FIELDS[section].every((field) => !!formData[field]);

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
// errors          — field-keyed error strings
// scannerOpen     — controls VehicleScannerModal visibility
// setScannerOpen  — toggle function
// onScannerComplete — called with the extracted data object; parent merges into state
const WarrantyFormFields = ({
  formData,
  onChange,
  errors = {},
  scannerOpen = false,
  setScannerOpen,
  onScannerComplete,
}) => {
  const { t } = useLanguage();

  return (
    <>
      {/* Section 1 — Organization & installer details */}
      <SectionCard title={t('sectionOrganization')} icon={Building2} complete={isSectionComplete(formData, 'organization')} completeLabel={t('sectionComplete')}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label={t('region')}
            name="region"
            value={formData.region}
            onChange={onChange}
            options={[
              { value: '', label: t('selectPlaceholder') },
              ...Object.keys(regions).map((r) => ({ value: r, label: r })),
            ]}
            error={errors.region}
            required
          />
          <Select
            label={t('city')}
            name="city"
            value={formData.city}
            onChange={onChange}
            options={[
              { value: '', label: t('selectPlaceholder') },
              ...(formData.region
                ? regions[formData.region].map((c) => ({ value: c, label: c }))
                : []),
            ]}
            error={errors.city}
            required
          />
          <Input
            label={t('district')}
            name="district"
            value={formData.district}
            onChange={onChange}
            error={errors.district}
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('organizationName')}
            name="organization_name"
            value={formData.organization_name}
            onChange={onChange}
            error={errors.organization_name}
            required
          />
          <Input
            label={t('organizationPhone')}
            name="organization_phone"
            type="tel"
            value={formData.organization_phone}
            onChange={onChange}
            error={errors.organization_phone}
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('installerName')}
            name="installer_full_name"
            value={formData.installer_full_name}
            onChange={onChange}
            error={errors.installer_full_name}
            required
          />
          <Input
            label={t('warrantyBookNumber')}
            name="warranty_book_number"
            value={formData.warranty_book_number}
            onChange={onChange}
            error={errors.warranty_book_number}
            required
          />
        </div>
        <Input
          label={t('installationDate')}
          name="installation_date"
          type="date"
          value={formData.installation_date}
          onChange={onChange}
          error={errors.installation_date}
          required
        />
      </SectionCard>

      {/* Section 2 — Vehicle details + OCR scanner */}
      <SectionCard title={t('sectionVehicle')} icon={Car} complete={isSectionComplete(formData, 'vehicle')} completeLabel={t('sectionComplete')}>
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={() => setScannerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <Camera className="w-4 h-4" />
            {t('scanCertificate')}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label={t('vehicleBrand')}
            name="vehicle_brand"
            value={formData.vehicle_brand}
            onChange={onChange}
            error={errors.vehicle_brand}
            required
          />
          <Input
            label={t('vehicleModel')}
            name="vehicle_model"
            value={formData.vehicle_model}
            onChange={onChange}
            error={errors.vehicle_model}
            required
          />
          <Input
            label={t('productionYear')}
            name="vehicle_production_year"
            type="number"
            value={formData.vehicle_production_year}
            onChange={onChange}
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('plateNumber')}
            name="vehicle_plate_number"
            value={formData.vehicle_plate_number}
            onChange={onChange}
            error={errors.vehicle_plate_number}
            required
          />
          <Input
            label={t('vinNumber')}
            name="vehicle_vin"
            value={formData.vehicle_vin}
            onChange={onChange}
            error={errors.vehicle_vin}
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label={t('engineVolume')}
            name="vehicle_engine_volume"
            value={formData.vehicle_engine_volume}
            onChange={onChange}
            error={errors.vehicle_engine_volume}
            required
          />
          <Input
            label={t('enginePower')}
            name="vehicle_engine_power"
            value={formData.vehicle_engine_power}
            onChange={onChange}
            error={errors.vehicle_engine_power}
            required
          />
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

      {/* Section 4 — Equipment serial numbers */}
      <SectionCard title={t('sectionEquipment')} icon={Wrench} complete={isSectionComplete(formData, 'equipment')} completeLabel={t('sectionComplete')}>
        <h3 className="font-semibold text-neutral-900 mb-4">{t('reducer')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label={t('fuelType')}
            name="reducer_fuel_type"
            value={formData.reducer_fuel_type}
            onChange={onChange}
            options={[
              { value: 'LPG', label: 'LPG' },
              { value: 'CNG', label: 'CNG' },
            ]}
          />
          <Input
            label={t('manufacturer')}
            name="reducer_manufacturer"
            value={formData.reducer_manufacturer}
            onChange={onChange}
            error={errors.reducer_manufacturer}
            required
          />
          <Input
            label={t('serialNumber')}
            name="reducer_serial_number"
            value={formData.reducer_serial_number}
            onChange={onChange}
            error={errors.reducer_serial_number}
            required
          />
        </div>

        <h3 className="font-semibold text-neutral-900 mb-4 mt-6">{t('cylinder')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label={t('fuelType')}
            name="cylinder_fuel_type"
            value={formData.cylinder_fuel_type}
            onChange={onChange}
            options={[
              { value: 'LPG', label: 'LPG' },
              { value: 'CNG', label: 'CNG' },
            ]}
          />
          <Input
            label={t('manufacturer')}
            name="cylinder_manufacturer"
            value={formData.cylinder_manufacturer}
            onChange={onChange}
            error={errors.cylinder_manufacturer}
            required
          />
          <Input
            label={t('serialNumber')}
            name="cylinder_serial_number"
            value={formData.cylinder_serial_number}
            onChange={onChange}
            error={errors.cylinder_serial_number}
            required
          />
        </div>

        <h3 className="font-semibold text-neutral-900 mb-4 mt-6">{t('controller')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('manufacturer')}
            name="stag_controller_manufacturer"
            value={formData.stag_controller_manufacturer}
            onChange={onChange}
            error={errors.stag_controller_manufacturer}
            required
          />
          <Input
            label={t('serialNumber')}
            name="stag_controller_serial_number"
            value={formData.stag_controller_serial_number}
            onChange={onChange}
            error={errors.stag_controller_serial_number}
            required
          />
        </div>

        <h3 className="font-semibold text-neutral-900 mb-4 mt-6">{t('injectorRail')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('manufacturer')}
            name="injector_rail_manufacturer"
            value={formData.injector_rail_manufacturer}
            onChange={onChange}
            error={errors.injector_rail_manufacturer}
            required
          />
          <Input
            label={t('serialNumber')}
            name="injector_rail_serial_number"
            value={formData.injector_rail_serial_number}
            onChange={onChange}
            error={errors.injector_rail_serial_number}
            required
          />
        </div>
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
