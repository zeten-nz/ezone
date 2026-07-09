// Label keywords per field, covering the Uzbek-Latin / Uzbek-Cyrillic / Russian
// variants seen on tex pasport certificates. Used as the fuzzy-match fallback
// when the numbered-field regex anchor fails to read the label's number.
export const FIELD_KEYWORDS = {
  plate: ['davlat raqami', 'davlat', 'гос номер', 'гос. номер', 'nomer', 'plate'],
  brandModel: ['marka', 'model', 'марка', 'модель', 'марка, модель'],
  owner: ['egasi', 'mulkdor', 'владелец', 'собственник', 'sohibi'],
  year: ['ishlab chiqarilgan', 'yili', 'год выпуска', 'год изготовления', 'ишлаб чикарилган'],
  vin: ['shassi', 'kuzov', 'shassi/kuzov', 'кузов', 'шасси', 'vin', 'рама'],
  enginePower: ['dvigatel quvvati', 'dvigatel', 'мощность двигателя', 'мощность', 'quvvati'],
};

// Numbered-field anchors matching the certificate's printed field numbers.
// Fast path: works whenever OCR reads the leading digit(s) correctly.
export const FIELD_ANCHORS = {
  plate: /(?:^|\n)\s*1[.\s]+([A-Z0-9\s]{6,12})/i,
  brandModel: /(?:^|\n)\s*2[.\s]+(.+)/i,
  owner: /(?:^|\n)\s*4[.\s]+(.+)/i,
  year: /(?:^|\n)\s*9[.\s]+(\d{4})/,
  vin: /(?:^|\n)\s*11[.\s]+([A-Z0-9]{10,30})/i,
  enginePower: /(?:^|\n)\s*15[.\s]+(\d{2,4})/,
};

// Whole-text fallback regexes — last resort when neither the anchor nor a
// keyword line matched. Scans the entire OCR text for something shaped like
// the expected value.
export const FIELD_FALLBACKS = {
  vin: /\b[A-HJ-NPR-Z0-9]{17}\b/i,
  plate: /\b\d{2}\s?[A-Z]\s?\d{3}\s?[A-Z]{2}\b/i,
  year: /\b(19[7-9]\d|20[0-4]\d)\b/,
};
