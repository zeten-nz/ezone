/**
 * Branch selector filtering (Beta-1, Part H). Pure logic behind
 * UI/BranchSelect — run with: node --test src/utils/branchSearch.test.js
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterBranches, isActiveBranch } from './branchSearch.js';

const BRANCHES = [
  { id: 1, code: '01/1', name: 'EASY GAS SERVICE MCHJ', region: 'Toshkent', district: 'Chilonzor', is_active: 1 },
  { id: 2, code: '01/2', name: 'Yangi Sergeli filiali', region: 'Toshkent', district: 'Sergeli', is_active: 1 },
  { id: 3, code: '20/5', name: 'Sirdaryo GAZ', region: 'Sirdaryo', district: 'Guliston', is_active: 0 },
  { id: 4, code: '07/3', name: 'Andijon servis', region: 'Andijon', district: null, is_active: 1 },
];

test('H23 finds branch by code', () => {
  const r = filterBranches(BRANCHES, '01/2');
  assert.equal(r.length, 1);
  assert.equal(r[0].id, 2);
});

test('H24 finds branch by name', () => {
  const r = filterBranches(BRANCHES, 'Sergeli filiali');
  assert.deepEqual(r.map((b) => b.id), [2]);
});

test('H25 matching is case-insensitive', () => {
  assert.equal(filterBranches(BRANCHES, 'easy gas')[0].id, 1);
  assert.equal(filterBranches(BRANCHES, 'ANDIJON')[0].id, 4);
});

test('H26 region and district are searchable (null-safe)', () => {
  assert.deepEqual(filterBranches(BRANCHES, 'Chilonzor').map((b) => b.id), [1]);
  // district: null on id 4 must not crash, and region still matches it
  assert.deepEqual(filterBranches(BRANCHES, 'andijon').map((b) => b.id), [4]);
});

test('H27 inactive branch is excluded by default (Inventory Import semantics)', () => {
  const r = filterBranches(BRANCHES, '');
  assert.ok(!r.some((b) => b.id === 3));
  assert.equal(filterBranches(BRANCHES, 'Sirdaryo').length, 0);
});

test('H27b includeInactive restores inactive branches (user-edit semantics)', () => {
  assert.ok(filterBranches(BRANCHES, 'Sirdaryo', { includeInactive: true }).some((b) => b.id === 3));
});

test('H28 active branch is selectable and H29 keeps its exact original object/id', () => {
  const r = filterBranches(BRANCHES, '01/1');
  assert.equal(r[0], BRANCHES[0]); // same reference — id 1 flows through untouched
});

test('H30 empty query returns every (active) branch — the "unassigned" empty state stays reachable', () => {
  assert.equal(filterBranches(BRANCHES, '').length, 3);
  assert.equal(filterBranches(BRANCHES, '   ').length, 3);
});

test('H31 no-result state for an unknown query', () => {
  assert.deepEqual(filterBranches(BRANCHES, 'does-not-exist'), []);
});

test('rows without is_active (the /public endpoint shape) count as active', () => {
  assert.equal(isActiveBranch({ id: 9, code: 'X', name: 'Y' }), true);
  assert.equal(isActiveBranch({ id: 9, is_active: 0 }), false);
  assert.equal(filterBranches([{ id: 9, code: 'X', name: 'Y' }], '').length, 1);
});

test('scales to 250+ branches without issue', () => {
  const many = Array.from({ length: 300 }, (_, i) => ({ id: i, code: `${i}/1`, name: `Branch ${i}`, is_active: 1 }));
  assert.equal(filterBranches(many, '').length, 300);
  assert.deepEqual(filterBranches(many, 'branch 299').map((b) => b.id), [299]);
});
