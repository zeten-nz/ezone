// Lazy loader for @techstark/opencv-js. This is an ~8MB wasm build, so it must
// never be part of the main bundle — it's only pulled in once the scanner
// modal actually opens, and only loaded once per session (singleton promise).

let cvPromise = null;

export function loadOpenCv(timeoutMs = 20000) {
  if (!cvPromise) {
    cvPromise = Promise.race([
      import('@techstark/opencv-js').then((mod) => mod.default),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('OpenCV load timed out')), timeoutMs)
      ),
    ]).then((cv) => {
      // jscanify reads the global `cv`, so it must be exposed here.
      window.cv = cv;
      return cv;
    });

    // If loading fails, allow a retry on the next call instead of caching the rejection forever.
    cvPromise.catch(() => {
      cvPromise = null;
    });
  }
  return cvPromise;
}
