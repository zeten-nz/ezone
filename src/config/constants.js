/**
 * APPLICATION-WIDE CONSTANTS
 *
 * Centralizing magic strings here prevents:
 *   - Typos causing silent bugs (e.g., wrong localStorage key)
 *   - Inconsistency (some files using 'token', others 'auth_token')
 *   - Painful find-and-replace when a key needs to change
 *
 * Import only what you need:
 *   import { STORAGE_KEYS, USER_ROLES } from '../config/constants';
 */

// ── LocalStorage keys ─────────────────────────────────────────────────────────
// Prefixed with 'ezone_' to avoid collisions with other apps on the same origin.
export const STORAGE_KEYS = {
  TOKEN:    'ezone_token',
  USER:     'ezone_user',
  LANGUAGE: 'ezone_language',
};

// ── User roles ────────────────────────────────────────────────────────────────
// Mirrors the ENUM values used by the backend.
export const USER_ROLES = {
  ADMIN:    'ADMIN',
  EMPLOYEE: 'EMPLOYEE',
};

// ── Fuel types ────────────────────────────────────────────────────────────────
// Used in warranty form select inputs.
export const FUEL_TYPES = [
  { value: 'LPG', label: 'LPG' },
  { value: 'CNG', label: 'CNG' },
];

// ── Date range filter options ─────────────────────────────────────────────────
// Used in export dialogs on Dashboard and Employee Profile.
export const DATE_RANGES = [
  { value: '7',   label: 'Last 7 Days' },
  { value: '30',  label: 'Last 30 Days' },
  { value: '90',  label: 'Last 3 Months' },
  { value: '180', label: 'Last 6 Months' },
  { value: '365', label: 'Last 1 Year' },
  { value: 'all', label: 'All Data' },
];

// ── Pagination defaults ───────────────────────────────────────────────────────
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

// ── HTTP request timeout ──────────────────────────────────────────────────────
// 30 seconds — generous enough for Excel export queries, tight enough
// to surface network problems rather than hanging indefinitely.
export const API_TIMEOUT_MS = 30_000;
