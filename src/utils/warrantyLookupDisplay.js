// Explicit .js extension so this pure module also loads under raw `node
// --test` (Vite resolves it identically).
import { EQUIPMENT_TYPES } from '../config/equipmentCategories.js';

/**
 * Resolves a customer-lookup warranty item into the 4 fixed equipment slots
 * for display (Beta-1). Pure (no React) — covered by
 * warrantyLookupDisplay.test.js.
 *
 * Per slot: the normalized equipment row wins (product_name, or
 * brand_name+model for a typed historical cylinder); a historical
 * pre-equipment-redesign warranty falls back to its flat legacy_equipment
 * fields; an absent slot yields nulls — the UI renders "Kiritilmagan"
 * (never invented data, never a crash).
 */
const LEGACY_FIELDS = {
  REDUCER: ['reducer_manufacturer', 'reducer_serial_number'],
  CYLINDER: ['cylinder_manufacturer', 'cylinder_serial_number'],
  CONTROLLER: ['stag_controller_manufacturer', 'stag_controller_serial_number'],
  INJECTOR_RAIL: ['injector_rail_manufacturer', 'injector_rail_serial_number'],
};

export const equipmentSlots = (item) =>
  EQUIPMENT_TYPES.map((type) => {
    const row = (item?.equipment || []).find((e) => e.equipment_type === type);
    if (row) {
      const typedLabel = [row.brand_name, row.model].filter(Boolean).join(' ');
      return {
        type,
        product: row.product_name || typedLabel || null,
        serial: row.serial_number || null,
      };
    }
    const legacy = item?.legacy_equipment;
    if (legacy) {
      const [productField, serialField] = LEGACY_FIELDS[type];
      return { type, product: legacy[productField] || null, serial: legacy[serialField] || null };
    }
    return { type, product: null, serial: null };
  });
