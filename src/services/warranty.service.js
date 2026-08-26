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
// Manual Verification fields are no longer sent — that workflow is disabled
// (temporary product decision); the server ignores them either way.
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

  getAll: (page = 1, limit = 20, search = '', employeeId, verificationStatus) =>
    client.get('/warranty', {
      params: {
        page,
        limit,
        ...(search ? { search } : {}),
        ...(employeeId ? { employeeId } : {}),
        ...(verificationStatus ? { verificationStatus } : {}),
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

  // ── Manual Verification review (HISTORICAL-ONLY) ────────────────────────
  // The active workflow can no longer produce a PENDING row (Manual
  // Verification is disabled), but warranties submitted under the old flow
  // may still hold rows awaiting review — these remain so the admin can
  // resolve that backlog.
  approveVerification: (equipmentId, notes) =>
    client.post(`/warranty/equipment/${equipmentId}/approve-verification`, { notes }),

  rejectVerification: (equipmentId, notes) =>
    client.post(`/warranty/equipment/${equipmentId}/reject-verification`, { notes }),

  // ── Warranty status workflow (admin review of the form itself) ──────────
  // Separate from approveVerification/rejectVerification above (Manual
  // Verification reviews one equipment row's barcode identity; this
  // reviews the warranty form's own lifecycle). Approving triggers an
  // EasyGas sync attempt server-side before responding, so this call can
  // take a few seconds longer than an ordinary request — expected, not a bug.
  approveForm: (formId, notes) =>
    client.post(`/warranty/${formId}/approve`, { notes }),

  rejectForm: (formId, notes) =>
    client.post(`/warranty/${formId}/reject`, { notes }),

  // ADMIN-only — same authenticated-blob pattern as
  // registrationRequestsService.getPhotoBlob (can't be used directly as an
  // <img src>, see AuthenticatedPhoto).
  getEquipmentPhotoBlob: (equipmentId) =>
    client.get(`/warranty/equipment/${equipmentId}/photo`, { responseType: 'blob' }),
};
