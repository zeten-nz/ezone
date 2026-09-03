/**
 * Customer-lookup equipment slot resolution (Beta-1, Part I logic). Pure —
 * run with: node --test src/utils/warrantyLookupDisplay.test.js
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { equipmentSlots } from './warrantyLookupDisplay.js';

const row = (type, over = {}) => ({ equipment_type: type, product_name: `${type} P`, serial_number: `${type}-SN`, brand_name: null, model: null, ...over });

test('I40 all four slots resolve product + serial from normalized equipment', () => {
  const slots = equipmentSlots({ equipment: ['REDUCER', 'CYLINDER', 'CONTROLLER', 'INJECTOR_RAIL'].map((t) => row(t)) });
  assert.equal(slots.length, 4);
  for (const s of slots) {
    assert.equal(s.product, `${s.type} P`);
    assert.equal(s.serial, `${s.type}-SN`);
  }
});

test('I41 missing cylinder slot yields nulls (UI renders "Kiritilmagan"), never throws', () => {
  const slots = equipmentSlots({ equipment: ['REDUCER', 'CONTROLLER', 'INJECTOR_RAIL'].map((t) => row(t)) });
  const cyl = slots.find((s) => s.type === 'CYLINDER');
  assert.deepEqual(cyl, { type: 'CYLINDER', product: null, serial: null });
});

test('typed historical cylinder (no product_name) falls back to brand+model', () => {
  const slots = equipmentSlots({ equipment: [row('CYLINDER', { product_name: '', brand_name: 'GZWM', model: '60L Toroidal' })] });
  assert.equal(slots.find((s) => s.type === 'CYLINDER').product, 'GZWM 60L Toroidal');
});

test('legacy flat fields back-fill slots for pre-redesign warranties', () => {
  const slots = equipmentSlots({
    equipment: [],
    legacy_equipment: {
      reducer_manufacturer: 'Old Reducer', reducer_serial_number: 'OR1',
      stag_controller_manufacturer: 'Old STAG', stag_controller_serial_number: 'OK1',
    },
  });
  assert.equal(slots.find((s) => s.type === 'REDUCER').product, 'Old Reducer');
  assert.equal(slots.find((s) => s.type === 'CONTROLLER').serial, 'OK1');
  assert.equal(slots.find((s) => s.type === 'CYLINDER').product, null); // absent legacy slot → Kiritilmagan
});

test('completely empty / malformed item yields four null slots, no crash', () => {
  for (const item of [{}, { equipment: null }, null]) {
    const slots = equipmentSlots(item);
    assert.equal(slots.length, 4);
    assert.ok(slots.every((s) => s.product === null && s.serial === null));
  }
});
