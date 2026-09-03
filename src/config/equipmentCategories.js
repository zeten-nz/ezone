/**
 * The warranty form's canonical equipment slots. Beta-3: CYLINDER is
 * OPTIONAL — REDUCER/CONTROLLER/INJECTOR_RAIL stay required. The form
 * always renders the 4 canonical display slots in this stable order (keyed
 * by equipment_type, never by DB result position), but the CYLINDER slot
 * carries an explicit `enabled` state: OFF means "no cylinder" and the row
 * is omitted from the API payload entirely — never sent as a
 * null-placeholder object (the EasyGas adapter, server-side, converts
 * absence into the partner's null-cylinder contract).
 */
export const EQUIPMENT_TYPES = ['REDUCER', 'CYLINDER', 'CONTROLLER', 'INJECTOR_RAIL'];
export const REQUIRED_EQUIPMENT_TYPES = ['REDUCER', 'CONTROLLER', 'INJECTOR_RAIL'];

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
// brand_name/model carry an existing TYPED (free-text) cylinder through an
// edit unchanged — the frontend cannot create typed cylinders, but must
// never destroy one just because the admin edited an unrelated field.
const emptyRow = (equipment_type) => ({
  equipment_type,
  brand: '',
  product: null,
  serial_number: '',
  brand_name: null,
  model: null,
  enabled: equipment_type !== 'CYLINDER', // cylinder starts OFF on a new warranty
});

export const EMPTY_EQUIPMENT_ROWS = () => EQUIPMENT_TYPES.map(emptyRow);

/** A cylinder row whose identity is existing typed/manual data rather than a catalog product. */
export const isTypedCylinderRow = (row) =>
  row.equipment_type === 'CYLINDER' && !row.product && !!(row.brand_name || row.model);

// Converts the DTO's raw equipment rows into the form's editable shape —
// DETERMINISTICALLY normalized onto the 4 canonical display slots keyed by
// equipment_type (never positional): a 3-row no-cylinder warranty yields a
// DISABLED cylinder slot; an absent REQUIRED slot (legacy-partial history)
// yields an enabled empty slot the admin can fill. Historical Manual
// Verification fields stay out of the editable shape (read-only history).
export const toEditableEquipment = (equipment) => {
  if (!equipment?.length) return EMPTY_EQUIPMENT_ROWS();
  const byType = new Map(equipment.map((row) => [row.equipment_type, row]));
  return EQUIPMENT_TYPES.map((type) => {
    const row = byType.get(type);
    if (!row) return emptyRow(type);
    return {
      equipment_type: type,
      brand: row.product_brand || '',
      product: row.product_id ? { id: row.product_id, name: row.product_name } : null,
      serial_number: row.serial_number || '',
      brand_name: row.brand_name || null,
      model: row.model || null,
      enabled: true, // a stored row (incl. an existing cylinder) opens enabled
    };
  });
};

// The LOCAL API equipment payload: disabled rows (cylinder OFF) are OMITTED
// entirely — the domain payload reflects absence honestly. A kept typed
// cylinder round-trips its brand_name/model; everything else sends its
// catalog product id.
export const toWireEquipment = (equipment) => (equipment || [])
  .filter((row) => row.enabled !== false)
  .map((row) => {
    const base = { equipment_type: row.equipment_type, serial_number: row.serial_number || null };
    if (isTypedCylinderRow(row)) {
      return { ...base, product_id: null, brand_name: row.brand_name, model: row.model };
    }
    return { ...base, product_id: row.product?.id };
  });
