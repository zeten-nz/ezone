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
//
// manual_verification/seller_name/seller_phone/comment/
// manual_verification_photo_filename: Manual Verification workflow fields —
// only meaningful when a row's barcode resolved to BARCODE_NOT_FOUND and the
// installer opted in (see EquipmentRow.jsx), but always passed through
// as-is; the server independently re-derives whether the manual path is
// actually allowed for this row (see validateBarcodeOrAcceptManual) rather
// than trusting the flag.
const toWirePayload = (data) => ({
  ...data,
  equipment: (data.equipment || []).map((e) => ({
    equipment_type: e.equipment_type,
    product_id: e.product?.id,
    serial_number: e.serial_number || null,
    manual_verification: e.manual_verification || false,
    seller_name: e.seller_name || null,
    seller_phone: e.seller_phone || null,
    comment: e.comment || null,
    manual_verification_photo_filename: e.manual_verification_photo_filename || null,
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

  // ── Manual Verification workflow (admin review) ─────────────────────────
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

  // Pre-upload for a Manual Verification equipment photo — returns
  // { filename }, which the caller then attaches to that equipment row's
  // manual_verification_photo_filename before submitting the warranty form
  // itself (see toWirePayload above and EquipmentRow.jsx). Same multipart
  // pattern as authService.updateProfilePhoto.
  uploadEquipmentPhoto: (photo) => {
    const formData = new FormData();
    formData.append('photo', photo);
    return client.post('/warranty/equipment-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // ADMIN-only — same authenticated-blob pattern as
  // registrationRequestsService.getPhotoBlob (can't be used directly as an
  // <img src>, see AuthenticatedPhoto).
  getEquipmentPhotoBlob: (equipmentId) =>
    client.get(`/warranty/equipment/${equipmentId}/photo`, { responseType: 'blob' }),
};
