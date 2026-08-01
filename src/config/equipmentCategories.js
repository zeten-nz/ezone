/**
 * The warranty form's 4 fixed equipment slots — mirrors
 * ezone-server/config/equipmentCategories.js. Order here is the order the
 * rows render in.
 */
export const EQUIPMENT_TYPES = ['REDUCER', 'CYLINDER', 'CONTROLLER', 'INJECTOR_RAIL'];

const EQUIPMENT_TYPE_LABEL_KEY = {
  REDUCER: 'reducer',
  CYLINDER: 'cylinder',
  CONTROLLER: 'controller',
  INJECTOR_RAIL: 'injectorRail',
};

export const getEquipmentTypeLabel = (t, type) => t(EQUIPMENT_TYPE_LABEL_KEY[type] || type);

// fuel_type is NOT part of a row — a warranty has exactly one fuel type for
// the whole installation (WarrantyFormFields' top-level formData.fuel_type),
// not one per equipment row. brand is a client-side search filter (gates
// and scopes the Product autocomplete) — never sent to the server as
// authoritative data; the server always derives brand from the resolved
// product_id.
export const EMPTY_EQUIPMENT_ROWS = () =>
  EQUIPMENT_TYPES.map((equipment_type) => ({
    equipment_type,
    brand: '',
    product: null,
    serial_number: '',
    // original_serial_number/original_product_id: null for a brand-new row —
    // there is nothing "already saved" to compare against, so the instant
    // barcode check (useBarcodeValidation) always runs normally here. Only
    // toEditableEquipment (opening an EXISTING warranty) ever populates
    // these with a real value — see there for why.
    original_serial_number: null,
    original_product_id: null,
    // Manual Verification workflow — only meaningful once the barcode above
    // resolves to BARCODE_NOT_FOUND and the installer opts in (see
    // EquipmentRow.jsx); harmless/unused otherwise.
    manual_verification: false,
    seller_name: '',
    seller_phone: '',
    comment: '',
    manual_verification_photo_filename: null,
  }));

// Converts the DTO's raw equipment rows ({product_id, product_name,
// product_brand, ...}) into the form's editable shape — shared by every
// "open an existing warranty for edit" call site so this mapping only
// lives in one place.
export const toEditableEquipment = (equipment) => {
  if (!equipment?.length) return EMPTY_EQUIPMENT_ROWS();
  return equipment.map((row) => ({
    equipment_type: row.equipment_type,
    brand: row.product_brand || '',
    product: row.product_id ? { id: row.product_id, name: row.product_name } : null,
    serial_number: row.serial_number || '',
    // Stamped once, at load time, so useBarcodeValidation can tell "still
    // exactly what's already saved" apart from "the installer changed it" —
    // the same distinction warrantyService.updateWarrantyForm's own
    // `changed` check already makes server-side (see warrantyService.js),
    // just mirrored here so the instant-feedback UI agrees with it instead
    // of re-checking global barcode availability for a row nothing is
    // actually happening to.
    original_serial_number: row.serial_number || null,
    original_product_id: row.product_id || null,
    // A row already sitting at PENDING/APPROVED/REJECTED keeps its manual-
    // verification state visible/editable; an AUTO row simply has none of
    // this populated (matches warranty_equipment's own default).
    manual_verification: row.verification_status && row.verification_status !== 'AUTO',
    seller_name: row.seller_name || '',
    seller_phone: row.seller_phone || '',
    comment: row.verification_comment || '',
    manual_verification_photo_filename: row.manual_verification_photo_filename || null,
    verification_status: row.verification_status || 'AUTO',
  }));
};
