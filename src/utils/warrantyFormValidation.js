import { PHONE_REGEX } from '../config/phone.js';
import { isTypedCylinderRow } from '../config/equipmentCategories.js';

/**
 * Client-side warranty form validation — extracted from WarrantyFormFields
 * (Beta-3) so the rules are unit-testable without JSX. Range checks mirror
 * ezone-server/routes/warrantyRoutes.js; the backend stays authoritative.
 *
 * Equipment rules (Beta-3): a DISABLED cylinder row ("Tsilindr qo'shish"
 * not activated) is skipped entirely — no product error, no serial error,
 * the form submits without it. Every ENABLED row needs a catalog product,
 * except an enabled cylinder that carries existing typed/manual data
 * (brand_name/model round-tripped from history) — that identity is valid
 * as-is.
 */

// Per-section required scalars — drives both validation and the section
// completion badges, so the two can never disagree.
export const SECTION_FIELDS = {
  warranty: ['installation_date'],
  vehicle: ['vehicle_name', 'vehicle_production_year', 'vehicle_vin', 'vehicle_mileage'],
  owner: ['owner_full_name', 'owner_phone'],
};

const MIN_PRODUCTION_YEAR = 1950;
const MAX_MILEAGE = 4294967295;
const MIN_INSTALLATION_DATE = new Date('2015-01-01');

const equipmentRowValid = (row) => row.enabled === false || !!row.product || isTypedCylinderRow(row);

export const validateWarrantyForm = (formData, t) => {
  const errors = {};
  const requiredFields = Object.values(SECTION_FIELDS).flat();
  requiredFields.forEach((field) => {
    if (!formData[field]) errors[field] = t('fieldRequired');
  });

  if (!formData.fuel_type) errors.fuel_type = t('fieldRequired');

  if (formData.owner_phone && !errors.owner_phone && !PHONE_REGEX.test(formData.owner_phone)) {
    errors.owner_phone = t('valPhoneInvalid');
  }

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
    if (!equipmentRowValid(row)) {
      equipmentErrors[row.equipment_type] = t('valProductRequired');
    }
  });
  if (Object.keys(equipmentErrors).length > 0) {
    errors.equipment = equipmentErrors;
  }

  return errors;
};

export const isEquipmentSectionComplete = (formData) =>
  !!formData.fuel_type && (formData.equipment || []).every(equipmentRowValid);
