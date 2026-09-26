import { EQUIPMENT_SERIAL_RULES, SERIAL_MAX_LENGTH, SERIAL_STORAGE_MAX_BYTES } from '../config/equipmentSerialRules.js';

export const parseSerialNumbers = (value) => value == null || value === '' ? [] : String(value).split(',').map((serial) => serial.trim());
export const getSerialNumbers = (row) => Array.isArray(row.serial_numbers) ? row.serial_numbers : parseSerialNumbers(row.serial_number);
export const editableSerialNumbers = (row) => {
  const serials = getSerialNumbers(row);
  return serials.length ? [...serials] : [''];
};
export const addSerial = (type, serials) => {
  const max = EQUIPMENT_SERIAL_RULES[type].max;
  return max != null && serials.length >= max ? serials : [...serials, ''];
};
export const removeSerial = (serials, index) => serials.length <= 1 ? serials : serials.filter((_, i) => i !== index);
export const serialValidationError = (type, values) => {
  const rule = EQUIPMENT_SERIAL_RULES[type];
  if (values.length < rule.min) return 'serialEmpty';
  if (rule.max != null && values.length > rule.max) return type === 'INJECTOR_RAIL' ? 'serialInjectorMax' : 'serialSingleRequired';
  const serials = values.map((value) => typeof value === 'string' ? value.trim() : '');
  if (serials.some((value) => !value)) return 'serialEmpty';
  if (serials.some((value) => value.includes(','))) return 'serialCommaNotAllowed';
  if (serials.some((value) => [...value].length > SERIAL_MAX_LENGTH)) return 'serialTooLong';
  if (new Set(serials).size !== serials.length) return 'serialDuplicate';
  // Mirrors TEXT's UTF-8 capacity; this is not a unit-count maximum.
  const bytes = serials.reduce((total, value) => total + new TextEncoder().encode(value).length, Math.max(0, serials.length - 1));
  if (bytes > SERIAL_STORAGE_MAX_BYTES) return 'serialStorageTooLong';
  return null;
};
