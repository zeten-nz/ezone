/**
 * Warranty form validation with optional cylinder (Beta-3, Part 25). Pure —
 * run with: node --test src/utils/warrantyFormValidation.test.js
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateWarrantyForm, isEquipmentSectionComplete } from './warrantyFormValidation.js';
import { EMPTY_EQUIPMENT_ROWS } from '../config/equipmentCategories.js';

const t = (key) => key;
// base(): the other 3 rows filled; cylinder explicitly REMOVED ("Tsilindrni
// olib tashlash" — enabled:false), the deliberate no-cylinder state.
const base = () => ({
  installation_date: '2026-09-01', fuel_type: 'LPG', vehicle_name: 'Cobalt',
  vehicle_production_year: 2021, vehicle_vin: 'VIN1', vehicle_mileage: 1000,
  owner_full_name: 'O', owner_phone: '+998901234567',
  equipment: EMPTY_EQUIPMENT_ROWS().map((r) => (r.equipment_type === 'CYLINDER' ? { ...r, enabled: false } : { ...r, product: { id: 1, name: 'X' }, serial_number: 'S' })),
});

test('UX hotfix: a NEW untouched form (cylinder enabled by default, empty) is still incomplete — normal product validation applies', () => {
  const form = base();
  form.equipment = form.equipment.map((r) => (r.equipment_type === 'CYLINDER' ? { ...r, enabled: true } : r)); // default CREATE state
  const errors = validateWarrantyForm(form, t);
  assert.equal(errors.equipment.CYLINDER, 'valProductRequired');
  assert.equal(isEquipmentSectionComplete(form), false);
});

test('form with cylinder explicitly REMOVED validates cleanly — no product error for the cylinder', () => {
  assert.deepEqual(validateWarrantyForm(base(), t), {});
  assert.equal(isEquipmentSectionComplete(base()), true);
});

test('the other 3 types remain required', () => {
  const form = base();
  form.equipment = form.equipment.map((r) => (r.equipment_type === 'CONTROLLER' ? { ...r, product: null } : r));
  const errors = validateWarrantyForm(form, t);
  assert.equal(errors.equipment.CONTROLLER, 'valProductRequired');
  assert.equal(isEquipmentSectionComplete(form), false);
});

test('RESTORING the cylinder ("Tsilindr qo\'shish" after removal) re-activates normal validation on the clean row', () => {
  const form = base();
  form.equipment = form.equipment.map((r) => (r.equipment_type === 'CYLINDER'
    ? { ...r, enabled: true, product: null, serial_number: '', brand: '', brand_name: null, model: null }
    : r));
  const errors = validateWarrantyForm(form, t);
  assert.equal(errors.equipment.CYLINDER, 'valProductRequired');
});

test('enabled cylinder with a catalog product passes', () => {
  const form = base();
  form.equipment = form.equipment.map((r) => (r.equipment_type === 'CYLINDER' ? { ...r, enabled: true, product: { id: 4, name: 'CYL' }, serial_number: 'SC' } : r));
  assert.deepEqual(validateWarrantyForm(form, t), {});
});

test('enabled cylinder carrying existing TYPED identity passes without a catalog product', () => {
  const form = base();
  form.equipment = form.equipment.map((r) => (r.equipment_type === 'CYLINDER' ? { ...r, enabled: true, brand_name: 'GZWM', model: '60L', serial_number: 'SC' } : r));
  assert.deepEqual(validateWarrantyForm(form, t), {});
  assert.equal(isEquipmentSectionComplete(form), true);
});
