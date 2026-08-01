/**
 * INVENTORY SERVICE
 * Physical-unit tracking on top of the local products catalog.
 * See ezone-server/controllers/inventoryController.js.
 */

import client from '../api/client';

export const inventoryService = {
  // Phase 4 adds installerId/branchId/importBatchId/installedFrom-To/
  // claimedFrom-To on top of the original productId/status/search filters
  // — a single `filters` object rather than growing the positional
  // parameter list further (getAll already had 5 positional args; a 6th
  // through 11th would be unreadable at call sites).
  getAll: (page, limit, filters = {}) =>
    client.get('/inventory', { params: { page, limit, ...filters } }),

  // CSV upload — multipart, same Content-Type-override pattern as
  // auth.service.js's photo uploads (axios fills in the real boundary itself).
  // branchId ("warehouse", Phase 4) is optional — omitting it keeps the
  // import unassigned, exactly like before Phase 4 existed.
  importCsv: (productId, file, branchId) => {
    const formData = new FormData();
    formData.append('productId', productId);
    formData.append('file', file);
    if (branchId) formData.append('branchId', branchId);
    return client.post('/inventory/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getImportBatches: (page, limit) =>
    client.get('/inventory/import-batches', { params: { page, limit } }),

  getImportBatchDetail: (batchId) =>
    client.get(`/inventory/import-batches/${batchId}`),

  // Any authenticated role — instant feedback as the installer scans/types
  // a barcode mid-warranty-form-fill. Read-only, never claims anything.
  validateBarcode: (barcode, productId, equipmentType) =>
    client.get(`/inventory/validate/${encodeURIComponent(barcode)}`, { params: { productId, equipmentType } }),

  // Phase 4 manual operations — Super Admin only (enforced server-side).
  // Every one requires `reason` in the body.
  changeStatus: (itemId, fromStatus, toStatus, reason) =>
    client.patch(`/inventory/${itemId}/status`, { fromStatus, toStatus, reason }),

  transferBranch: (itemId, branchId, reason) =>
    client.patch(`/inventory/${itemId}/branch`, { branchId, reason }),

  correctBarcode: (itemId, newBarcode, reason) =>
    client.patch(`/inventory/${itemId}/barcode`, { newBarcode, reason }),

  mergeDuplicate: (itemId, canonicalItemId, reason) =>
    client.post(`/inventory/${itemId}/merge`, { canonicalItemId, reason }),
};
