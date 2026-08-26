/**
 * CATALOG SYNC SERVICE
 * Triggers/reads the ONE EasyGas catalog sync job (brands + products + cars
 * in one operation) that the Products/Brands/Cars admin pages' "Sync EasyGas
 * Catalog" button calls. See ezone-server/controllers/catalogSyncController.js.
 */

import client from '../api/client';

export const catalogSyncService = {
  run: () =>
    client.post('/catalog-sync/run'),

  getStatus: () =>
    client.get('/catalog-sync/status'),

  // Signed backend-to-backend connectivity check against EasyGas's GET
  // /verify endpoint (the browser never talks to EasyGas directly).
  verify: () =>
    client.get('/catalog-sync/verify'),
};
