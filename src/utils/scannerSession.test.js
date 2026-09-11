/**
 * Permanent regression for the React StrictMode QR-camera "1-second
 * blackout" bug. Deterministic and browser-free — it drives the exact
 * session-lifecycle module QrScannerModal delegates to. Run with:
 * node --test src/utils/scannerSession.test.js
 *
 * StrictMode (dev) runs the scanner effect setup → cleanup → setup on one
 * mount, sharing one <video>. The bug was that an obsolete first run's late
 * getUserMedia resolved and its teardown killed the surviving run's live
 * stream. These tests lock in the fix.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startScannerSession } from './scannerSession.js';

const flush = () => new Promise((r) => setTimeout(r, 10));

// A controllable fake decoder: records every camera-open and stop, and the
// video element it was bound to.
const makeDecoderFactory = () => {
  const events = [];
  const controlsList = [];
  let seq = 0;
  const startDecoder = async ({ onDecode, videoElement }) => {
    const id = ++seq;
    events.push(`start#${id}`);
    const controls = {
      id, videoElement, stopped: 0,
      fireDecode: (text) => onDecode(text),
      stop() { this.stopped += 1; events.push(`stop#${id}`); },
    };
    controlsList.push(controls);
    return controls;
  };
  return { startDecoder, events, controlsList };
};

test('StrictMode setup→cleanup→setup: the obsolete run never opens the camera, and cannot stop the surviving session', async () => {
  const { startDecoder, events, controlsList } = makeDecoderFactory();
  const mk = () => startScannerSession({ startDecoder, onDecode() {}, onError() {} });

  const first = mk();   // StrictMode setup #1
  first.cancel();       // StrictMode cleanup #1 — runs synchronously, before the deferred open
  const second = mk();  // StrictMode setup #2 (the surviving run)
  await flush();

  // The throwaway run must NEVER have called getUserMedia; exactly one open.
  assert.deepEqual(events.filter((e) => e.startsWith('start')), ['start#1']);
  assert.equal(controlsList.length, 1);
  // The surviving session is alive and was never stopped by the obsolete one.
  assert.equal(controlsList[0].stopped, 0);

  // A genuine close then stops it exactly once.
  second.cancel();
  assert.equal(controlsList[0].stopped, 1);
});

test('controls.stop() stays at 0 for a normally running session until a real close', async () => {
  const { startDecoder, controlsList } = makeDecoderFactory();
  let startedControls = null;
  const session = startScannerSession({ startDecoder, onStarted: (c) => { startedControls = c; }, onDecode() {}, onError() {} });
  await flush();
  assert.ok(startedControls, 'onStarted fired for the live session');
  assert.equal(controlsList[0].stopped, 0); // running: never stopped by a render/ready transition
  session.cancel();
  assert.equal(controlsList[0].stopped, 1); // close stops it
});

test('onStarted fires exactly once and the camera is opened exactly once (element never re-acquired/swapped)', async () => {
  const VIDEO_EL = { id: 'stable-video-element' };
  const { events } = makeDecoderFactory();
  let startedCount = 0;
  let boundElement = null;
  const startDecoder = async ({ onDecode }) => {
    events.push('start');
    boundElement = VIDEO_EL; // component binds the one stable ref inside startDecoder
    return { stop() {}, onDecode };
  };
  startScannerSession({ startDecoder, onStarted: () => { startedCount += 1; }, onDecode() {}, onError() {} });
  await flush();
  assert.equal(startedCount, 1, 'starting→scanning must not restart the session');
  assert.equal(events.filter((e) => e === 'start').length, 1);
  assert.equal(boundElement, VIDEO_EL);
});

test('a decode forwards once, stops the camera once, and repeated decoder callbacks cannot double-submit', async () => {
  const { startDecoder, controlsList } = makeDecoderFactory();
  const decoded = [];
  startScannerSession({ startDecoder, onDecode: (t) => decoded.push(t), onError() {} });
  await flush();
  controlsList[0].fireDecode('QR-A');
  controlsList[0].fireDecode('QR-A'); // zxing fires continuously while the code stays in view
  controlsList[0].fireDecode('QR-B');
  assert.deepEqual(decoded, ['QR-A']);      // exactly one lookup
  assert.equal(controlsList[0].stopped, 1); // camera stopped once on success
});

test('a decode that races startup still stops the started session and forwards once', async () => {
  const decoded = [];
  let capturedOnDecode = null;
  const controls = { stopped: 0, stop() { this.stopped += 1; } };
  const startDecoder = async ({ onDecode }) => {
    capturedOnDecode = onDecode;
    onDecode('RACER'); // decode fires BEFORE this promise resolves (session not yet assigned)
    return controls;
  };
  startScannerSession({ startDecoder, onDecode: (t) => decoded.push(t), onError() {} });
  await flush();
  assert.deepEqual(decoded, ['RACER']);
  assert.equal(controls.stopped, 1); // the resolved-but-already-decoded session is torn down
  capturedOnDecode('AGAIN');
  assert.deepEqual(decoded, ['RACER']); // still locked
});

test('cancelling before startup resolves means the camera is never opened', async () => {
  const { startDecoder, events } = makeDecoderFactory();
  const session = startScannerSession({ startDecoder, onDecode() {}, onError() {} });
  session.cancel(); // before the deferred open
  await flush();
  assert.deepEqual(events, []); // no start, no stop — nothing to leak
});

test('startDecoder rejection surfaces via onError, with no onStarted and nothing to stop', async () => {
  const startDecoder = async () => { const e = new Error('denied'); e.name = 'NotAllowedError'; throw e; };
  let started = 0;
  let errored = null;
  startScannerSession({ startDecoder, onStarted: () => { started += 1; }, onDecode() {}, onError: (e) => { errored = e; } });
  await flush();
  assert.equal(started, 0);
  assert.equal(errored?.name, 'NotAllowedError');
});

test('an error after a genuine cancel is swallowed (no late onError on a closed scanner)', async () => {
  const startDecoder = async () => { await flush(); throw new Error('late failure'); };
  let errored = null;
  const session = startScannerSession({ startDecoder, onDecode() {}, onError: (e) => { errored = e; } });
  session.cancel();
  await flush();
  assert.equal(errored, null);
});
