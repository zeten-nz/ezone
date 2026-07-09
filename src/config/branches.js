/**
 * PLACEHOLDER BRANCH LIST
 *
 * There is no `branches` table in the database yet — this static list is a
 * stand-in so the registration form and admin UserFormModal have something
 * concrete to select from. Replace with a real API-backed list (and a
 * `branches` table) once the canonical branch registry exists; every
 * consumer of this file only needs BRANCHES to keep exporting
 * `{ value, label }[]`, so swapping the source later is a one-file change.
 */
export const BRANCHES = [
  { value: 'STAG_001', label: 'STAG_001' },
  { value: 'STAG_015', label: 'STAG_015' },
  { value: 'STAG_022', label: 'STAG_022' },
];
