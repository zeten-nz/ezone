/**
 * WARRANTY SERVICE
 * All warranty form API calls: create, list, detail, delete, search.
 */

import client from '../api/client';
import { toWireEquipment } from '../config/equipmentCategories';

// formData.equipment holds the 4 canonical display rows; the wire mapping
// (config/equipmentCategories.toWireEquipment, Beta-3) OMITS a disabled
// cylinder entirely — a no-cylinder warranty submits exactly 3 equipment
// objects, never a null-placeholder row — and round-trips existing typed
// cylinders. product_name stays server-derived; brand is a client-side
// search filter only. formData.fuel_type is top-level and carried by
// `...data` unchanged.
const toWirePayload = (data) => ({
  ...data,
  equipment: toWireEquipment(data.equipment),
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

  // Authenticated customer lookup by phone (Beta-1) — any authenticated
  // role, cross-installer by design (a returning customer may visit a
  // different technician/branch). Returns the SAFE allowlisted lookup
  // shape, never the full admin DTO.
  lookupByPhone: (phone) =>
    client.get('/warranty/lookup', { params: { phone } }),

  // ── Manual Verification review (HISTORICAL-ONLY) ────────────────────────
  // The active workflow can no longer produce a PENDING row (Manual
  // Verification is disabled), but warranties submitted under the old flow
  // may still hold rows awaiting review — these remain so the admin can
  // resolve that backlog.
  approveVerification: (equipmentId, notes) =>
    client.post(`/warranty/equipment/${equipmentId}/approve-verification`, { notes }),

  rejectVerification: (equipmentId, notes) =>
    client.post(`/warranty/equipment/${equipmentId}/reject-verification`, { notes }),

  // ── Warranty status workflow (admin review — HISTORICAL-ONLY) ───────────
  // New warranties are created SUCCESSFUL and auto-submitted to EasyGas at
  // creation, so these only ever apply to warranties still at the old
  // PENDING state. Approving one triggers the EasyGas sync attempt
  // server-side before responding, so the call can take a few seconds
  // longer than an ordinary request — expected, not a bug.
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
