export function isValidVin(value = '') {
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(value.toUpperCase());
}

// Uzbek plate formats: "01 A 123 BB" (region, letter, 3 digits, 2 letters)
// or the older "01 A123BB" spacing variants — normalize spacing before testing.
export function isValidPlate(value = '') {
  const compact = value.toUpperCase().replace(/\s+/g, '');
  return /^\d{2}[A-Z]\d{3}[A-Z]{2}$/.test(compact);
}

export function isValidYear(value) {
  const year = parseInt(value, 10);
  const currentYear = new Date().getFullYear();
  return Number.isInteger(year) && year >= 1970 && year <= currentYear + 1;
}

export function isPlausibleName(value = '') {
  const cleaned = value.trim();
  return cleaned.length >= 3 && /[A-Za-zА-Яа-яЎўҚқҒғҲҳ]/.test(cleaned);
}

export function formatPlate(value = '') {
  const compact = value.toUpperCase().replace(/\s+/g, '');
  const match = compact.match(/^(\d{2})([A-Z])(\d{3})([A-Z]{2})$/);
  if (!match) return value;
  const [, region, letter, digits, suffix] = match;
  return `${region} ${letter} ${digits} ${suffix}`;
}
