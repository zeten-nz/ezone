/**
 * Managed-username live-preview helper (Beta-2, §36 logic level). Pure —
 * run with: node --test src/utils/managedUsernamePreview.test.js
 * Presentation-only mirror; the backend parser stays authoritative.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseManagedUsernamePreview } from './managedUsernamePreview.js';

test('36.42 eg preview → EASYGAS', () => {
  const p = parseManagedUsernamePreview('eg_ali_01_1');
  assert.deepEqual(p, { managed: true, branchType: 'EASYGAS', branchCode: '01/1', humanPart: 'ali' });
});

test('36.43 st preview → STAG_SERVICE', () => {
  assert.equal(parseManagedUsernamePreview('st_ali_10_1').branchType, 'STAG_SERVICE');
});

test('36.44 bs preview → OTHER_SERVICE (multi-token human part)', () => {
  const p = parseManagedUsernamePreview('bs_service_master_12_14');
  assert.equal(p.branchType, 'OTHER_SERVICE');
  assert.equal(p.humanPart, 'service_master');
});

test('36.45 branch code reconstruction is exact (both-ends parse)', () => {
  assert.equal(parseManagedUsernamePreview('bs_service_master_12_14').branchCode, '12/14');
  assert.equal(parseManagedUsernamePreview('eg_a_b_c_07_3').branchCode, '07/3');
});

test('36.46/48 non-managed input yields managed:false (never blocks unrelated legacy edits client-side)', () => {
  for (const legacy of ['oldemployee', 'eg_ali', 'eg_ali_001_1', 'eg__01_1', '', null]) {
    assert.equal(parseManagedUsernamePreview(legacy).managed, false, `"${legacy}"`);
  }
  assert.equal(parseManagedUsernamePreview('xx_ali_01_1').managed, false); // unknown prefix → no preview
});
