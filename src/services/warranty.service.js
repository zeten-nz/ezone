/**
 * WARRANTY SERVICE
 * All warranty form API calls: create, list, detail, delete, search.
 */

import client from '../api/client';

export const warrantyService = {
  create: (data) =>
    client.post('/warranty', data),

  update: (formId, data) =>
    client.put(`/warranty/${formId}`, data),

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
};
