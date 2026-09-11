/**
 * Pure QR scanner-session lifecycle — extracted from QrScannerModal so the
 * React StrictMode camera-blackout regression is testable deterministically
 * without a browser (see scannerSession.test.js). QrScannerModal's effect is
 * a thin wrapper around this; both run the exact same code path.
 *
 * THE BUG THIS ENCODES A FIX FOR: React StrictMode (dev) runs an effect
 * setup → cleanup → setup on a SINGLE mount, and both runs share one
 * <video> element. If each run opened the camera, the obsolete first run's
 * late getUserMedia would resolve and its teardown (zxing nulls the shared
 * video.srcObject) would kill the surviving run's live preview ~1s in — the
 * "camera visible for a second then black" bug.
 *
 * THE FIX: opening the camera is deferred past a microtask and guarded by
 * `cancelled`. StrictMode's synchronous cleanup flips `cancelled` before the
 * deferred body runs, so the throwaway run NEVER calls startDecoder — only
 * the surviving run opens the camera, and no obsolete session can stop it.
 *
 * `startDecoder({ onDecode }) => Promise<{ stop() }>` — the caller binds the
 * concrete <video> element inside startDecoder, so this module stays
 * DOM-free. `onStarted(session)` fires once, only for a session that
 * actually became the live one (never for a cancelled/obsolete run).
 */
export const startScannerSession = ({ startDecoder, onDecode, onStarted, onError }) => {
  let cancelled = false;
  let decoded = false;
  let session = null;

  (async () => {
    // Yield so a StrictMode throwaway run cancels before we open the camera.
    await Promise.resolve();
    if (cancelled) return;
    try {
      const started = await startDecoder({
        onDecode: (text) => {
          if (decoded) return;   // one decode per session — never a double lookup
          decoded = true;
          session?.stop();       // stop the camera IMMEDIATELY on success
          onDecode?.(text);
        },
      });
      if (cancelled || decoded) {
        started.stop();          // closed — or decoded — while starting up
        return;
      }
      session = started;
      onStarted?.(started);
    } catch (error) {
      if (!cancelled) onError?.(error);
    }
  })();

  return {
    cancel: () => {
      cancelled = true;
      session?.stop();           // genuine close / decode / unmount — stops the one real session
      session = null;
    },
  };
};
