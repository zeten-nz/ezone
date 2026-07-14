import { FIELD_KEYWORDS, FIELD_ANCHORS, FIELD_FALLBACKS } from './keywords';
import { findBestKeywordLine, extractValueAfterLabel } from './fuzzyMatch';
import { combineConfidence, makeField } from '../Confidence/confidence';
import { fixVinConfusions } from '../Normalizers/charConfusion';
import { isValidVin } from '../Validators/validators';

/** Tries the numbered-field regex anchor against each OCR'd line. */
function tryAnchor(field, lines) {
  const pattern = FIELD_ANCHORS[field];
  if (!pattern) return null;
  for (const line of lines) {
    const match = line.text.match(pattern);
    if (match?.[1]?.trim()) {
      return { text: match[1].trim(), confidence: line.confidence, source: 'anchor' };
    }
  }
  return null;
}

/** Fuzzy keyword-label search across lines. */
function tryKeyword(field, lines) {
  const keywords = FIELD_KEYWORDS[field];
  if (!keywords) return null;
  const match = findBestKeywordLine(lines, keywords);
  if (!match) return null;
  const { text } = extractValueAfterLabel(match, lines);
  if (!text) return null;
  return { text, confidence: match.line.confidence * match.score, source: 'keyword' };
}

/** Whole-text shape-based fallback (e.g. "some 17-char alnum string exists somewhere"). */
function tryFallback(field, fullText, avgWordConfidence) {
  const pattern = FIELD_FALLBACKS[field];
  if (!pattern) return null;
  const match = fullText.match(pattern);
  if (!match) return null;
  return { text: match[0].trim(), confidence: avgWordConfidence, source: 'fallback' };
}

function averageConfidence(words) {
  if (!words?.length) return 0;
  return words.reduce((sum, w) => sum + w.confidence, 0) / words.length;
}

/** Extracts one field from a single OCR pass (lines + words), before cross-pass comparison. */
function extractFieldFromPass(field, pass) {
  const fullText = pass.lines.map((l) => l.text).join('\n');
  const avgConf = averageConfidence(pass.words);

  const found = tryAnchor(field, pass.lines) || tryKeyword(field, pass.lines) || tryFallback(field, fullText, avgConf);
  if (!found) return makeField('', 0, 'fallback');

  return makeField(found.text, combineConfidence(found.source, found.confidence), found.source);
}

/** Runs extraction against both preprocessing candidates and keeps whichever scored higher. */
function extractField(field, dualPassData) {
  const fromGrayscale = extractFieldFromPass(field, dualPassData.grayscale);
  const fromThreshold = extractFieldFromPass(field, dualPassData.threshold);
  return fromGrayscale.confidence >= fromThreshold.confidence ? fromGrayscale : fromThreshold;
}

function finalizeVin(field) {
  if (!field.value) return field;
  const fixed = fixVinConfusions(field.value.replace(/\s+/g, ''));
  const valid = isValidVin(fixed);
  return { ...field, value: fixed, valid, confidence: valid ? field.confidence : Math.min(field.confidence, 40) };
}

/**
 * The scanner's one job: extract the VIN (field 11 on the registration
 * certificate) from dual-pass OCR data. Returns `{ fields: { vehicle_vin } }`
 * — no other fields are read or returned anymore (see the VehicleScanner
 * redesign: manual entry for everything else, this scans VIN only).
 */
export function parseVin(dualPassData) {
  const vin = finalizeVin(extractField('vin', dualPassData));
  return { fields: { vehicle_vin: vin } };
}
