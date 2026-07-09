import { FIELD_KEYWORDS, FIELD_ANCHORS, FIELD_FALLBACKS } from './keywords';
import { findBestKeywordLine, extractValueAfterLabel } from './fuzzyMatch';
import { combineConfidence, makeField } from '../Confidence/confidence';
import { cleanWhitespace, normalizeBrandName } from '../Normalizers/textNormalize';
import { fixNumericConfusions, fixVinConfusions } from '../Normalizers/charConfusion';
import { isValidVin, isValidPlate, isValidYear, isPlausibleName, formatPlate } from '../Validators/validators';

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

function finalizePlate(field) {
  if (!field.value) return field;
  const compact = field.value.toUpperCase().replace(/\s+/g, '');
  const valid = isValidPlate(compact);
  return { ...field, value: valid ? formatPlate(compact) : field.value, valid, confidence: valid ? field.confidence : Math.min(field.confidence, 40) };
}

function finalizeYear(field) {
  if (!field.value) return field;
  const fixed = fixNumericConfusions(field.value).replace(/\D/g, '');
  const valid = isValidYear(fixed);
  return { ...field, value: fixed, valid, confidence: valid ? field.confidence : Math.min(field.confidence, 40) };
}

function finalizeOwner(field) {
  if (!field.value) return field;
  const cleaned = cleanWhitespace(field.value);
  const valid = isPlausibleName(cleaned);
  return { ...field, value: cleaned, valid, confidence: valid ? field.confidence : Math.min(field.confidence, 40) };
}

function finalizeBrandModel(field) {
  if (!field.value) return field;
  const { value, matched } = normalizeBrandName(field.value);
  return { ...field, value, valid: true, confidence: matched ? field.confidence : Math.min(field.confidence, 55) };
}

function finalizeEnginePower(field) {
  if (!field.value) return field;
  const fixed = fixNumericConfusions(field.value).replace(/\D/g, '');
  const valid = fixed.length > 0 && Number(fixed) > 0 && Number(fixed) < 2000;
  return { ...field, value: fixed, valid, confidence: valid ? field.confidence : Math.min(field.confidence, 40) };
}

const FINALIZERS = {
  vin: finalizeVin,
  plate: finalizePlate,
  year: finalizeYear,
  owner: finalizeOwner,
  brandModel: finalizeBrandModel,
  enginePower: finalizeEnginePower,
};

/**
 * Parses the front side (plate, brand/model, owner) from dual-pass OCR data.
 * Returns `{ fields, formValues }` — `formValues` is a flat plain object
 * matching the warranty form's field names, kept for backward compatibility
 * with `onComplete`.
 */
export function parseFrontSide(dualPassData) {
  const plate = FINALIZERS.plate(extractField('plate', dualPassData));
  const brandModel = FINALIZERS.brandModel(extractField('brandModel', dualPassData));
  const owner = FINALIZERS.owner(extractField('owner', dualPassData));

  const brandWord = brandModel.value.split(/[\s/]+/)[0] || '';

  return {
    fields: {
      vehicle_plate_number: plate,
      vehicle_brand: { ...brandModel, value: brandWord },
      vehicle_model: brandModel,
      owner_full_name: owner,
    },
  };
}

/** Parses the back side (year, VIN, engine power). */
export function parseBackSide(dualPassData) {
  const year = FINALIZERS.year(extractField('year', dualPassData));
  const vin = FINALIZERS.vin(extractField('vin', dualPassData));
  const enginePower = FINALIZERS.enginePower(extractField('enginePower', dualPassData));

  return {
    fields: {
      vehicle_production_year: year,
      vehicle_vin: vin,
      vehicle_engine_power: enginePower,
    },
  };
}
