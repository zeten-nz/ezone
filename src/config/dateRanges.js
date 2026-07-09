import { DATE_RANGES } from './constants';

const LABEL_KEYS = {
  '7': 'last7Days',
  '30': 'last30Days',
  '90': 'last3Months',
  '180': 'last6Months',
  '365': 'last1Year',
  all: 'allData',
};

/** Translated date-range options for every export dialog (Dashboard, Profile) — one source of truth for which ranges exist. */
export function getDateRangeOptions(t) {
  return DATE_RANGES.map(({ value }) => ({ value, label: t(LABEL_KEYS[value] ?? value) }));
}
