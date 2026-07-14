// Label keywords/anchors/fallbacks for VIN only — the scanner's one job is
// extracting field 11 (VIN/chassis number) from the registration
// certificate. Covers the Uzbek-Latin / Uzbek-Cyrillic / Russian variants
// seen on tex pasport certificates.
export const FIELD_KEYWORDS = {
  vin: ['shassi', 'kuzov', 'shassi/kuzov', 'кузов', 'шасси', 'vin', 'рама'],
};

// Numbered-field anchor matching the certificate's printed field 11. Fast
// path: works whenever OCR reads the leading digits correctly.
export const FIELD_ANCHORS = {
  vin: /(?:^|\n)\s*11[.\s]+([A-Z0-9]{10,30})/i,
};

// Whole-text fallback — last resort when neither the anchor nor the keyword
// line matched. Scans the entire OCR text for something shaped like a VIN
// (17-char alnum; ISO 3779 excludes I/O/Q).
export const FIELD_FALLBACKS = {
  vin: /\b[A-HJ-NPR-Z0-9]{17}\b/i,
};
