/**
 * Optional-cylinder equipment model (Beta-3, Part 25). Pure — run with:
 * node --test src/config/equipmentCategories.test.js
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EMPTY_EQUIPMENT_ROWS, EQUIPMENT_TYPES, toEditableEquipment, toWireEquipment, isTypedCylinderRow } from './equipmentCategories.js';

const dtoRow = (type, over = {}) => ({ equipment_type: type, product_id: 5, product_name: `${type} P`, product_brand: 'STAG', serial_number: `${type}-SN`, brand_name: null, model: null, ...over });

test('UX hotfix: new warranty starts with ALL FOUR rows enabled (cylinder included), canonical order', () => {
  const rows = EMPTY_EQUIPMENT_ROWS();
  assert.equal(rows.length, 4);
  assert.deepEqual(rows.map((r) => r.equipment_type), EQUIPMENT_TYPES);
  assert.ok(rows.every((r) => r.enabled === true));
  assert.ok(rows.every((r) => r.product === null && r.serial_number === '' && r.brand_name === null && r.model === null));
});

test('explicitly REMOVED cylinder is OMITTED from the wire payload — exactly 3 objects, never a null-placeholder row', () => {
  // simulate "Tsilindrni olib tashlash": enabled:false + cleared fields
  const rows = EMPTY_EQUIPMENT_ROWS().map((r) => (r.equipment_type === 'CYLINDER'
    ? { ...r, enabled: false }
    : { ...r, product: { id: 9, name: 'X' }, serial_number: 'S' }));
  const wire = toWireEquipment(rows);
  assert.equal(wire.length, 3);
  assert.ok(!wire.some((w) => w.equipment_type === 'CYLINDER'));
  assert.ok(wire.every((w) => w.product_id === 9 && w.serial_number === 'S'));
});

test('default-enabled cylinder goes to the wire as a normal catalog row', () => {
  const rows = EMPTY_EQUIPMENT_ROWS().map((r) => ({ ...r, product: { id: 7, name: 'X' }, serial_number: 'S' }));
  const wire = toWireEquipment(rows);
  assert.equal(wire.length, 4);
  assert.deepEqual(wire.find((w) => w.equipment_type === 'CYLINDER'), { equipment_type: 'CYLINDER', serial_number: 'S', product_id: 7 });
});

test('typed cylinder round-trips brand_name/model on the wire (frontend never destroys typed identity)', () => {
  const rows = toEditableEquipment([
    dtoRow('REDUCER'), dtoRow('CONTROLLER'), dtoRow('INJECTOR_RAIL'),
    dtoRow('CYLINDER', { product_id: null, product_name: 'GZWM 60L', brand_name: 'GZWM', model: '60L' }),
  ]);
  const cylEditable = rows.find((r) => r.equipment_type === 'CYLINDER');
  assert.equal(isTypedCylinderRow(cylEditable), true);
  const wire = toWireEquipment(rows);
  assert.deepEqual(wire.find((w) => w.equipment_type === 'CYLINDER'), { equipment_type: 'CYLINDER', serial_number: 'CYLINDER-SN', product_id: null, brand_name: 'GZWM', model: '60L' });
});

test('25.53 editing a warranty WITH a cylinder opens the slot enabled', () => {
  const rows = toEditableEquipment([dtoRow('REDUCER'), dtoRow('CYLINDER'), dtoRow('CONTROLLER'), dtoRow('INJECTOR_RAIL')]);
  assert.equal(rows.find((r) => r.equipment_type === 'CYLINDER').enabled, true);
});

test('25.54/58/59 a 3-row no-cylinder warranty normalizes onto ALL 4 canonical slots in stable order, cylinder DISABLED, no positional shift', () => {
  // deliberately shuffled DB order — normalization must key by type
  const rows = toEditableEquipment([dtoRow('INJECTOR_RAIL'), dtoRow('REDUCER'), dtoRow('CONTROLLER')]);
  assert.deepEqual(rows.map((r) => r.equipment_type), EQUIPMENT_TYPES); // REDUCER, CYLINDER, CONTROLLER, INJECTOR_RAIL
  const cyl = rows[1];
  assert.equal(cyl.equipment_type, 'CYLINDER');
  assert.equal(cyl.enabled, false);
  assert.equal(cyl.product, null);
  assert.equal(rows[2].product.name, 'CONTROLLER P'); // controller stayed in its own slot
  assert.equal(rows[3].serial_number, 'INJECTOR_RAIL-SN');
});

test('a legacy-partial warranty (missing a REQUIRED slot) yields an enabled empty slot so it can be completed', () => {
  const rows = toEditableEquipment([dtoRow('REDUCER'), dtoRow('CONTROLLER')]); // injector missing historically
  const inj = rows.find((r) => r.equipment_type === 'INJECTOR_RAIL');
  assert.equal(inj.enabled, true);
  assert.equal(inj.product, null);
});

test('EDIT differs from CREATE by design: a warranty with NO equipment rows opens the cylinder DISABLED', () => {
  for (const legacy of [[], null, undefined]) {
    const rows = toEditableEquipment(legacy);
    assert.equal(rows.find((r) => r.equipment_type === 'CYLINDER').enabled, false);
    assert.ok(['REDUCER', 'CONTROLLER', 'INJECTOR_RAIL'].every((t2) => rows.find((r) => r.equipment_type === t2).enabled === true));
  }
});
