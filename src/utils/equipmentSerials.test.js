import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { EQUIPMENT_SERIAL_RULES } from '../config/equipmentSerialRules.js';
import { addSerial, removeSerial, editableSerialNumbers, serialValidationError } from './equipmentSerials.js';
import { toEditableEquipment, toWireEquipment } from '../config/equipmentCategories.js';
import { equipmentSlots } from './warrantyLookupDisplay.js';

test('historical single serial and stored lists load separate editable inputs', () => {
  assert.deepEqual(editableSerialNumbers({ serial_number: 'A' }), ['A']);
  assert.deepEqual(editableSerialNumbers({ serial_number: 'A,B,C' }), ['A', 'B', 'C']);
});
test('add/remove affects only the intended serial and preserves final input', () => {
  assert.deepEqual(addSerial('INJECTOR_RAIL', ['A']), ['A', '']);
  assert.deepEqual(removeSerial(['A', 'B', 'C'], 1), ['A', 'C']);
  assert.deepEqual(removeSerial(['A'], 0), ['A']);
});
test('injector max 12, cylinder has no count ceiling and can reach 40 inputs', () => {
  let injector = ['I'];
  let cylinder = ['C'];
  for (let i = 0; i < 39; i++) {
    injector = addSerial('INJECTOR_RAIL', injector);
    cylinder = addSerial('CYLINDER', cylinder);
  }
  assert.equal(injector.length, 12);
  assert.equal(cylinder.length, 40);
  assert.equal(EQUIPMENT_SERIAL_RULES.CYLINDER.max, null);
  assert.deepEqual(EQUIPMENT_SERIAL_RULES.REDUCER, { min: 1, max: 1 });
  assert.deepEqual(EQUIPMENT_SERIAL_RULES.CONTROLLER, { min: 1, max: 1 });
});
test('serial validation explains duplicates, empty values, separators, and individual length', () => {
  assert.equal(serialValidationError('INJECTOR_RAIL', ['A', ' A ']), 'serialDuplicate');
  assert.equal(serialValidationError('INJECTOR_RAIL', ['A', '']), 'serialEmpty');
  assert.equal(serialValidationError('INJECTOR_RAIL', ['A,B']), 'serialCommaNotAllowed');
  assert.equal(serialValidationError('INJECTOR_RAIL', ['A'.repeat(151)]), 'serialTooLong');
  assert.equal(serialValidationError('CYLINDER', Array.from({ length: 40 }, (_, i) => `C${i}`)), null);
});
test('shared employee/admin edit conversion preserves arrays and sends no serialized field', () => {
  const editable = toEditableEquipment([{ equipment_type: 'INJECTOR_RAIL', product_id: 1, serial_number: 'A,B,C', serial_numbers: ['A', 'B', 'C'] }]);
  const injector = editable.find((r) => r.equipment_type === 'INJECTOR_RAIL');
  assert.deepEqual(injector.serial_numbers, ['A', 'B', 'C']);
  const wire = toWireEquipment(editable).find((r) => r.equipment_type === 'INJECTOR_RAIL');
  assert.deepEqual(wire.serial_numbers, ['A', 'B', 'C']);
  assert.equal('serial_number' in wire, false);
  for (const page of ['EmployeeWarrantyHistoryModern', 'AdminWarrantyFormsModern']) {
    assert.match(readFileSync(new URL(`../pages/${page}.jsx`, import.meta.url), 'utf8'), /toEditableEquipment\(form.equipment\)/);
  }
});
test('customer and QR display resolve structured serial lists', () => {
  const slots = equipmentSlots({ equipment: [{ equipment_type: 'INJECTOR_RAIL', serial_number: 'A,B,C', serial_numbers: ['A', 'B', 'C'] }] });
  assert.deepEqual(slots.find((s) => s.type === 'INJECTOR_RAIL').serials, ['A', 'B', 'C']);
});
test('UZ/RU serial translations are present', () => {
  const source = readFileSync(new URL('../context/LanguageContext.jsx', import.meta.url), 'utf8');
  for (const key of ['serialNumbers', 'addSerial', 'removeSerial', 'serialUnitCount', 'serialInjectorMax', 'serialDuplicate', 'serialEmpty']) {
    assert.equal((source.match(new RegExp(`\\b${key}:`, 'g')) || []).length, 2);
  }
  assert.ok(source.includes('Seriya raqamlari'));
  assert.ok(source.includes('Серийные номера'));
});
test('obsolete my-points navigation is removed; statistics retains activity without points', () => {
  const navigation = readFileSync(new URL('../config/navigation.js', import.meta.url), 'utf8');
  assert.doesNotMatch(navigation.slice(navigation.indexOf('export const EMPLOYEE_NAV_ITEMS')), /my-points/);
  const app = readFileSync(new URL('../App.jsx', import.meta.url), 'utf8');
  assert.match(app, /path="\/my-points" element={<Navigate to="\/warranty-history" replace/);
  const stats = readFileSync(new URL('../pages/MyStatisticsModern.jsx', import.meta.url), 'utf8');
  assert.doesNotMatch(stats, /data\.(monthlyPoints|lifetimePoints)/);
  assert.match(stats, /data.totalWarranties/);
});
