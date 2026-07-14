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
