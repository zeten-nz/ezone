/**
 * BRANDS SERVICE
 * Local ERP master data (equipment brands like "STAG", "ADAX") — admin CRUD,
 * plus an active-only list that powers the Product form's Brand select.
 * See ezone-server/controllers/brandController.js.
 */

import client from '../api/client';

export const brandsService = {
  getAll: (page, limit, search) =>
    client.get('/brands', { params: { page, limit, search } }),

  // Any authenticated role — populates ProductFormModal's Brand select.
  getActive: () =>
    client.get('/brands/active'),

  create: (data) =>
    client.post('/brands', data),

  update: (brandId, data) =>
    client.put(`/brands/${brandId}`, data),

  activate: (brandId) =>
    client.patch(`/brands/${brandId}/activate`),

  deactivate: (brandId) =>
    client.patch(`/brands/${brandId}/deactivate`),

  delete: (brandId) =>
    client.delete(`/brands/${brandId}`),
};
