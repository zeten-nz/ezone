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
// Serial number is a plain field (temporary product decision): it is no
// longer validated against the local inventory/barcode system and the
// Manual Verification fields are gone from the active form. It is still
// required server-side for catalog products and sent to EasyGas.
export const EMPTY_EQUIPMENT_ROWS = () =>
  EQUIPMENT_TYPES.map((equipment_type) => ({
    equipment_type,
    brand: '',
    product: null,
    serial_number: '',
  }));

// Converts the DTO's raw equipment rows ({product_id, product_name,
// product_brand, ...}) into the form's editable shape — shared by every
// "open an existing warranty for edit" call site so this mapping only
// lives in one place. Historical Manual Verification fields
// (verification_status, seller info, photo) are deliberately NOT loaded
// into the editable shape — they are read-only history now, preserved
// server-side for unchanged rows and shown in the detail modal.
export const toEditableEquipment = (equipment) => {
  if (!equipment?.length) return EMPTY_EQUIPMENT_ROWS();
  return equipment.map((row) => ({
    equipment_type: row.equipment_type,
    brand: row.product_brand || '',
    product: row.product_id ? { id: row.product_id, name: row.product_name } : null,
    serial_number: row.serial_number || '',
  }));
};
