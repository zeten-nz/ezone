import { rotateCanvas, resizeCanvas } from '../Utils/canvasUtils';
import { quickConfidenceProbe } from '../OCR/ocrEngine';

const PROBE_WIDTH = 500; // small + fast; we only need relative confidence between rotations

/**
 * Detects the correct upright rotation (0/90/180/270) by running a cheap,
 * low-resolution OCR confidence probe at each angle and keeping the winner.
 * Avoids needing Tesseract's separate OSD/legacy engine data.
 */
export async function correctOrientation(canvas, onCandidateScored) {
  const angles = [0, 90, 180, 270];
  let best = { angle: 0, confidence: -1 };

  for (const angle of angles) {
    const rotated = angle === 0 ? canvas : rotateCanvas(canvas, angle);
    const probe = resizeCanvas(rotated, Math.min(PROBE_WIDTH, rotated.width));
    const confidence = await quickConfidenceProbe(probe);
    onCandidateScored?.(angle, confidence);
    if (confidence > best.confidence) {
      best = { angle, confidence };
    }
  }

  return best.angle === 0 ? canvas : rotateCanvas(canvas, best.angle);
}
