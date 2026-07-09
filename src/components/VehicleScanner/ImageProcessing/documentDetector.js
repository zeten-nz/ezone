// jscanify's default export ("main") is a Node.js entry that requires jsdom +
// node-canvas — huge and pointless in a browser bundle. The package exposes a
// dedicated "./client" export for the real browser build (relies on the
// global `cv` from opencv.js, same as we already load in opencvLoader.js).
import jscanify from 'jscanify/client';
import { loadOpenCv } from './opencvLoader';
import { cloneCanvas } from '../Utils/canvasUtils';

// The Uzbek "tex pasport" is issued as a plastic ID-1 card (same format as a
// bank card / driving licence), aspect ratio ~85.6mm x 54mm = 1.586.
const CARD_ASPECT = 85.6 / 54;
const OUTPUT_WIDTH = 1600;
const OUTPUT_HEIGHT = Math.round(OUTPUT_WIDTH / CARD_ASPECT);

let scannerInstance = null;

async function getScanner() {
  await loadOpenCv();
  if (!scannerInstance) {
    scannerInstance = new jscanify();
  }
  return scannerInstance;
}

/**
 * Detects the document's quadrilateral border in the captured frame and
 * warps it to a flat, upright rectangle (perspective correction), removing
 * background clutter in the process.
 *
 * Falls back to returning the original frame untouched if OpenCV fails to
 * load or no clear document contour is found (e.g. low-contrast background) —
 * the rest of the pipeline still runs on the raw frame rather than failing.
 */
export async function detectAndExtractDocument(sourceCanvas) {
  try {
    const scanner = await getScanner();
    const extracted = scanner.extractPaper(sourceCanvas, OUTPUT_WIDTH, OUTPUT_HEIGHT);
    if (!extracted) {
      return { canvas: cloneCanvas(sourceCanvas), cropped: false };
    }
    return { canvas: extracted, cropped: true };
  } catch (err) {
    console.warn('[VehicleScanner] document border detection failed, using full frame', err);
    return { canvas: cloneCanvas(sourceCanvas), cropped: false };
  }
}
