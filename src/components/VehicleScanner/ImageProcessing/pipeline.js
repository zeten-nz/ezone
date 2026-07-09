import { detectAndExtractDocument } from './documentDetector';
import { correctOrientation } from './orientation';
import { buildGrayscaleCandidate, buildThresholdCandidate } from './enhance';

/**
 * Full preprocessing pipeline: crop/deskew → auto-rotate → enhance.
 * Returns both OCR candidates (grayscale + adaptive-threshold) so the OCR
 * stage can run a dual pass and keep whichever scores higher per field.
 */
export async function processCapturedImage(rawCanvas, { onStage } = {}) {
  onStage?.('cropping');
  const { canvas: cropped, cropped: wasCropped } = await detectAndExtractDocument(rawCanvas);

  onStage?.('orienting');
  const oriented = await correctOrientation(cropped);

  onStage?.('enhancing');
  const grayscale = buildGrayscaleCandidate(oriented);
  const threshold = buildThresholdCandidate(grayscale);

  return { rawCanvas, cropped, oriented, grayscale, threshold, wasCropped };
}
