/**
 * REGISTRATION REQUESTS SERVICE (admin-only)
 * Review, approve, and reject pending self-registration requests.
 * See ezone-server/routes/registrationRequestRoutes.js.
 */

import client from '../api/client';

export const registrationRequestsService = {
  getAll: () =>
    client.get('/registration-requests'),

  getById: (id) =>
    client.get(`/registration-requests/${id}`),

  // The photo route requires the same Authorization header as every other
  // admin endpoint, so it can't be used directly as an <img src> — callers
  // fetch it as a blob and build an object URL (see AuthenticatedPhoto).
  getPhotoBlob: (id) =>
    client.get(`/registration-requests/${id}/photo`, { responseType: 'blob' }),

  approve: (id) =>
    client.post(`/registration-requests/${id}/approve`),

  reject: (id, notes) =>
    client.post(`/registration-requests/${id}/reject`, { notes }),
};
