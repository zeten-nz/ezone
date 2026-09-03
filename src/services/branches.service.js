/**
 * BRANCHES SERVICE
 * Branches are a real entity now (replacing the old placeholder static
 * list) — a small, admin-managed catalog of organizations/locations that
 * employees are assigned to. See ezone-server/controllers/branchController.js.
 */

import client from '../api/client';

export const branchesService = {
  // Unauthenticated — the registration form needs a branch picker before
  // the applicant has any account at all.
  // Beta-2.1: EXPLICIT Super-Admin-only branch-type correction — branchType
  // is one of the canonical types, or null to reset to unclassified.
  reclassify: (branchId, branchType) =>
    client.patch(`/branches/${branchId}/reclassify`, { branch_type: branchType }),

  getPublic: () =>
    client.get('/branches/public'),

  getAll: () =>
    client.get('/branches'),

  create: (data) =>
    client.post('/branches', data),

  update: (branchId, data) =>
    client.put(`/branches/${branchId}`, data),

  disable: (branchId) =>
    client.patch(`/branches/${branchId}/disable`),

  enable: (branchId) =>
    client.patch(`/branches/${branchId}/enable`),
};
