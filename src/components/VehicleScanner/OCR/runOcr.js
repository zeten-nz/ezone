import { PSM } from 'tesseract.js';
import { recognizeWithConfidence, setOcrProgressListener, flattenWords } from './ocrEngine';

/**
 * Runs OCR on both preprocessing candidates (clean grayscale + adaptive
 * threshold). Returns both results, flattened, so the parser can pick
 * whichever candidate reads better on a per-field basis rather than
 * committing to one globally-best pass.
 */
export async function runDualPassOcr({ grayscale, threshold }, onProgress) {
  setOcrProgressListener((m) => {
    if (m.status === 'recognizing text') {
      onProgress?.(Math.round(m.progress * 50));
    }
  });
  const grayscaleData = await recognizeWithConfidence(grayscale, { psm: PSM.SINGLE_BLOCK });

  setOcrProgressListener((m) => {
    if (m.status === 'recognizing text') {
      onProgress?.(50 + Math.round(m.progress * 50));
    }
  });
  const thresholdData = await recognizeWithConfidence(threshold, { psm: PSM.SINGLE_BLOCK });

  setOcrProgressListener(null);

  return {
    grayscale: { raw: grayscaleData, ...flattenWords(grayscaleData) },
    threshold: { raw: thresholdData, ...flattenWords(thresholdData) },
  };
}
