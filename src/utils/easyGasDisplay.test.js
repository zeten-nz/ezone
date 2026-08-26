/**
 * EasyGas display-mode decision (§15). Pure logic, no React, no network (§15.35 — these tests never call EasyGas).
 * Run with: node --test src/utils/easyGasDisplay.test.js
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { easyGasDisplayMode, hasClaimUrl } from './easyGasDisplay.js';

test('§15.29 claim_url present → "qr" (QR rendered)', () => {
  assert.equal(
    easyGasDisplayMode({ easygas_claim_url: 'https://easygas.uz/w/1', status: 'SUCCESSFUL', easygas_sync_result: 'SUCCESS' }),
    'qr',
  );
});

test('§15.30 FAILED + no claim_url → "failed", never "qr" (no fake QR)', () => {
  const mode = easyGasDisplayMode({ easygas_claim_url: null, status: 'SUCCESSFUL', easygas_sync_result: 'FAILED' });
  assert.equal(mode, 'failed');
  assert.notEqual(mode, 'qr');
});

test('§15.31/32 failed state (mode "failed"); the raw sync error is present for the admin branch to render', () => {
  const form = { easygas_claim_url: '', status: 'SUCCESSFUL', easygas_sync_result: 'FAILED', easygas_sync_error: 'HTTP 422: PRODUCT_UNKNOWN' };
  assert.equal(easyGasDisplayMode(form), 'failed'); // modal: admin shows easygas_sync_error, installer shows a safe localized message
  assert.equal(form.easygas_sync_error, 'HTTP 422: PRODUCT_UNKNOWN');
});

test('§15.33 SUCCESS but missing claim_url → "inconsistent" (safe warning, no URL reconstructed)', () => {
  assert.equal(
    easyGasDisplayMode({ easygas_claim_url: null, status: 'SUCCESSFUL', easygas_sync_result: 'SUCCESS' }),
    'inconsistent',
  );
});

test('§15.34 exact claim_url passed through verbatim (ClaimUrlQr encodes it unchanged)', () => {
  const url = 'https://easygas.uz/w/exact-Token_123?x=1';
  const form = { easygas_claim_url: url, status: 'SUCCESSFUL', easygas_sync_result: 'SUCCESS' };
  assert.equal(easyGasDisplayMode(form), 'qr');
  assert.equal(hasClaimUrl(form), true);
  assert.equal(form.easygas_claim_url, url); // never trimmed/normalized/reconstructed
});

test('pending / rejected / null → "none" (nothing shown)', () => {
  assert.equal(easyGasDisplayMode({ easygas_claim_url: null, status: 'PENDING', easygas_sync_result: 'PENDING' }), 'none');
  assert.equal(easyGasDisplayMode({ easygas_claim_url: null, status: 'REJECTED', easygas_sync_result: 'PENDING' }), 'none');
  assert.equal(easyGasDisplayMode(null), 'none');
});

test('whitespace-only claim_url is treated as absent (not a QR)', () => {
  assert.equal(
    easyGasDisplayMode({ easygas_claim_url: '   ', status: 'SUCCESSFUL', easygas_sync_result: 'FAILED' }),
    'failed',
  );
});
