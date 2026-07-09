export const LOW_CONFIDENCE_THRESHOLD = 60;

const SOURCE_WEIGHT = {
  anchor: 1,
  keyword: 0.85,
  fuzzy: 0.7,
  fallback: 0.5,
};

/** Combines how the field was found (source) with the OCR engine's own confidence for that text. */
export function combineConfidence(source, ocrConfidence) {
  const weight = SOURCE_WEIGHT[source] ?? 0.5;
  return Math.round(weight * ocrConfidence);
}

export function makeField(value, confidence, source) {
  return { value: value ?? '', confidence: Math.max(0, Math.min(100, Math.round(confidence ?? 0))), source: source ?? 'fallback' };
}

export function isLowConfidence(field) {
  return !field || !field.value || field.confidence < LOW_CONFIDENCE_THRESHOLD;
}
