/**
 * Warranty form validation with optional cylinder (Beta-3, Part 25). Pure —
 * run with: node --test src/utils/warrantyFormValidation.test.js
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateWarrantyForm, isEquipmentSectionComplete } from './warrantyFormValidation.js';
import { EMPTY_EQUIPMENT_ROWS } from '../config/equipmentCategories.js';

const t = (key) => key;
const base = () => ({
  installation_date: '2026-09-01', fuel_type: 'LPG', vehicle_name: 'Cobalt',
  vehicle_production_year: 2021, vehicle_vin: 'VIN1', vehicle_mileage: 1000,
  owner_full_name: 'O', owner_phone: '+998901234567',
  equipment: EMPTY_EQUIPMENT_ROWS().map((r) => (r.equipment_type === 'CYLINDER' ? r : { ...r, product: { id: 1, name: 'X' }, serial_number: 'S' })),
});

test('25.49 form with cylinder OFF validates cleanly — no product error for the cylinder', () => {
  assert.deepEqual(validateWarrantyForm(base(), t), {});
  assert.equal(isEquipmentSectionComplete(base()), true);
});

test('25.48 the other 3 types remain required', () => {
  const form = base();
  form.equipment = form.equipment.map((r) => (r.equipment_type === 'CONTROLLER' ? { ...r, product: null } : r));
  const errors = validateWarrantyForm(form, t);
  assert.equal(errors.equipment.CONTROLLER, 'valProductRequired');
  assert.equal(isEquipmentSectionComplete(form), false);
});

test('25.51/52 enabling the cylinder activates normal validation — enabled empty cylinder rejected', () => {
  const form = base();
  form.equipment = form.equipment.map((r) => (r.equipment_type === 'CYLINDER' ? { ...r, enabled: true } : r));
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
