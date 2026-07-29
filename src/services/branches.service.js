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

  // ADMIN — live, uncached passthrough of EasyGas's real branch list
  // ({stag_code, name, region_id}), used to look up the value to enter as
  // easygas_stag_code below. Not a sync — just a reference lookup.
  getEasyGasBranches: () =>
    client.get('/branches/easygas'),
};
