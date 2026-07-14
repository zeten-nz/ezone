/**
 * WARRANTY SERVICE
 * All warranty form API calls: create, list, detail, delete, search.
 */

import client from '../api/client';

// formData.equipment holds the 4 fixed rows as { equipment_type, brand,
// product (full object from the autocomplete), serial_number } — the API
// only wants product_id (product_name is always server-derived, never
// client-submitted, see warrantyService.resolveEquipment on the backend;
// brand is a client-side search filter only, never sent — the server
// derives brand from the resolved product_id). formData.fuel_type is
// already top-level (one fuel type for the whole installation, not per
// row), so `...data` carries it through unchanged. That shape translation
// happens here once rather than in every page that submits a warranty form.
const toWirePayload = (data) => ({
  ...data,
  equipment: (data.equipment || []).map((e) => ({
    equipment_type: e.equipment_type,
    product_id: e.product?.id,
    serial_number: e.serial_number || null,
  })),
});

export const warrantyService = {
  create: (data) =>
    client.post('/warranty', toWirePayload(data)),

  update: (formId, data) =>
    client.put(`/warranty/${formId}`, toWirePayload(data)),

  getAll: (page = 1, limit = 20, search = '') =>
    client.get('/warranty', {
      params: {
        page,
        limit,
        ...(search ? { search } : {}),
      },
    }),

  getById: (formId) =>
    client.get(`/warranty/${formId}`),

  delete: (formId) =>
    client.delete(`/warranty/${formId}`),

  getMyForms: (page = 1, limit = 20, search = '') =>
    client.get('/warranty/my', {
      params: {
        page,
        limit,
        ...(search ? { search } : {}),
      },
    }),

  search: (search, filterType) =>
    client.get('/warranty/search', { params: { search, filterType } }),

  // Admin-only manual retry for a warranty stuck in FAILED EasyGas sync
  // status — resets it to PENDING for the next sweep cycle.
  retrySync: (formId) =>
    client.post(`/warranty/${formId}/retry-sync`),
};
