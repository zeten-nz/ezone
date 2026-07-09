// Tesseract frequently confuses visually-similar glyphs. Which correction to
// apply depends on context: a VIN/plate/year is numeric-heavy, an owner name
// is alpha-heavy — applying the wrong direction would corrupt good reads.

const TO_DIGIT = { O: '0', o: '0', I: '1', l: '1', i: '1', B: '8', S: '5', s: '5', Z: '2', z: '2' };
const TO_LETTER = { 0: 'O', 1: 'I', 8: 'B', 5: 'S', 2: 'Z' };

/** Use for fields that should be entirely numeric (year) or alnum-with-known-shape (VIN, plate digit groups). */
export function fixNumericConfusions(str) {
  return str
    .split('')
    .map((ch) => TO_DIGIT[ch] ?? ch)
    .join('');
}

/** Use sparingly on fields that are letter groups within an otherwise-numeric code (VIN, plate letter groups). */
export function fixAlphaConfusions(str) {
  return str
    .split('')
    .map((ch) => TO_LETTER[ch] ?? ch)
    .join('');
}

/**
 * VIN-specific fix: VINs never contain I, O or Q (excluded by the ISO 3779
 * standard to avoid confusion with 1/0), so any of those in an OCR'd VIN
 * candidate are near-certainly misreads of digits.
 */
export function fixVinConfusions(str) {
  return str
    .toUpperCase()
    .split('')
    .map((ch) => {
      if (ch === 'O' || ch === 'Q') return '0';
      if (ch === 'I') return '1';
      return ch;
    })
    .join('');
}
