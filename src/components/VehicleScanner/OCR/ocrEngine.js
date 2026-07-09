import { createWorker, PSM } from 'tesseract.js';

// Uzbek tex pasport text mixes Latin Uzbek, Russian and occasional Cyrillic
// Uzbek. Combining all three language models gives the LSTM engine the best
// chance of recognizing every field without knowing the script in advance.
const LANGS = 'uzb+rus+eng';

let workerPromise = null;
let progressListener = null;

export function setOcrProgressListener(fn) {
  progressListener = fn;
}

async function initWorker() {
  const worker = await createWorker(LANGS, 1, {
    logger: (m) => progressListener?.(m),
  });
  await worker.setParameters({
    tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
    preserve_interword_spaces: '1',
  });
  return worker;
}

export function getWorker() {
  if (!workerPromise) {
    workerPromise = initWorker();
    workerPromise.catch(() => {
      workerPromise = null;
    });
  }
  return workerPromise;
}

export async function terminateWorker() {
  if (!workerPromise) return;
  const worker = await workerPromise.catch(() => null);
  workerPromise = null;
  await worker?.terminate();
}

/**
 * Runs OCR and returns the raw Tesseract `data` object, including per-word
 * confidence (via `blocks: true`), for the parser to consume.
 */
export async function recognizeWithConfidence(image, { psm = PSM.SINGLE_BLOCK, whitelist = '' } = {}) {
  const worker = await getWorker();
  await worker.setParameters({
    tessedit_pageseg_mode: psm,
    tessedit_char_whitelist: whitelist,
  });
  const { data } = await worker.recognize(image, {}, { blocks: true });
  return data;
}

/** Fast, text-only, sparse-mode pass used only to score candidate rotations. */
export async function quickConfidenceProbe(image) {
  const worker = await getWorker();
  await worker.setParameters({
    tessedit_pageseg_mode: PSM.SPARSE_TEXT,
    tessedit_char_whitelist: '',
  });
  const { data } = await worker.recognize(image, {}, { text: true });
  return data.confidence ?? 0;
}

/** Flattens Tesseract's blocks→paragraphs→lines→words tree into simple arrays. */
export function flattenWords(data) {
  const words = [];
  const lines = [];
  for (const block of data?.blocks ?? []) {
    for (const paragraph of block.paragraphs ?? []) {
      for (const line of paragraph.lines ?? []) {
        lines.push({ text: line.text.trim(), confidence: line.confidence, words: line.words });
        for (const word of line.words ?? []) {
          words.push({ text: word.text, confidence: word.confidence, bbox: word.bbox });
        }
      }
    }
  }
  return { words, lines };
}
