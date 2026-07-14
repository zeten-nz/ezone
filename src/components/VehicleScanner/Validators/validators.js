export function isValidVin(value = '') {
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(value.toUpperCase());
}
