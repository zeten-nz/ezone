/**
 * The camera-QR decode boundary. One place owns the scanning library and
 * the MediaStream lifecycle so the UI (QrScannerModal) never touches
 * either directly.
 *
 * Library: @zxing/browser — a maintained cross-browser QR decoder that
 * works from a live camera stream everywhere getUserMedia does.
 * Deliberately NOT the native BarcodeDetector API: Firefox (and older
 * Safari) don't ship it, and production must not assume it. Dynamically
 * imported so the customer-lookup page doesn't pay for the decoder until a
 * scan actually starts (same pattern as the VIN scanner's OCR pipeline).
 */

/** Stops every track of the element's current stream — safe to call twice. */
export const stopVideoTracks = (videoElement) => {
  const stream = videoElement?.srcObject;
  if (stream && typeof stream.getTracks === 'function') {
    for (const track of stream.getTracks()) track.stop();
  }
  if (videoElement) videoElement.srcObject = null;
};

/**
 * Starts continuous decoding into `videoElement`, preferring the
 * rear/environment camera (ideal, not exact — a laptop with only a front
 * camera must still work). `onDecode(text)` fires for every successful
 * decode — the CALLER is responsible for locking against repeats (it knows
 * when a lookup is in flight). Returns `{ stop }`; stop() halts the decode
 * loop AND stops all MediaStream tracks (belt-and-braces: zxing's own
 * controls.stop() plus an explicit track teardown).
 */
export const startQrDecoder = async ({ videoElement, onDecode }) => {
  const { BrowserQRCodeReader } = await import('@zxing/browser');
  const reader = new BrowserQRCodeReader(undefined, { delayBetweenScanAttempts: 250 });
  const controls = await reader.decodeFromConstraints(
    { audio: false, video: { facingMode: { ideal: 'environment' } } },
    videoElement,
    (result) => {
      if (result) onDecode(result.getText());
    }
  );
  return {
    stop: () => {
      try { controls.stop(); } catch { /* already stopped */ }
      stopVideoTracks(videoElement);
    },
  };
};

/**
 * DELIBERATE TEST SEAM: browser-automation tests (no physical camera) can
 * inject a fake decoder via window.__EZONE_QR_DECODER__ before the page
 * loads. Production code paths never set it, so real users always get
 * startQrDecoder above.
 */
export const resolveQrDecoder = () =>
  (typeof window !== 'undefined' && window.__EZONE_QR_DECODER__) || startQrDecoder;
