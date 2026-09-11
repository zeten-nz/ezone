/**
 * Camera-error classification for the QR scanner (pure). Run with:
 * node --test src/utils/cameraErrors.test.js
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyCameraError, CAMERA_ERROR_LABEL_KEY } from './cameraErrors.js';

test('permission denials map to the permission state across browser vocabularies', () => {
  for (const name of ['NotAllowedError', 'PermissionDeniedError', 'SecurityError']) {
    assert.equal(classifyCameraError({ name }), 'permission');
  }
});

test('missing/unsatisfiable camera maps to the no-camera state', () => {
  for (const name of ['NotFoundError', 'DevicesNotFoundError', 'OverconstrainedError', 'ConstraintNotSatisfiedError']) {
    assert.equal(classifyCameraError({ name }), 'no-camera');
  }
});

test('anything else (incl. malformed errors) falls back to the generic init state — never crashes', () => {
  assert.equal(classifyCameraError(new Error('boom')), 'init');
  assert.equal(classifyCameraError({ name: 'AbortError' }), 'init');
  assert.equal(classifyCameraError(null), 'init');
  assert.equal(classifyCameraError(undefined), 'init');
  assert.equal(classifyCameraError('string error'), 'init');
});

test('every state has a translation key (classifier and labels can never drift)', () => {
  for (const state of ['permission', 'no-camera', 'init']) {
    assert.equal(typeof CAMERA_ERROR_LABEL_KEY[state], 'string');
  }
});
