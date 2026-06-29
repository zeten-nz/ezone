/**
 * WARRANTY SERVICE
 * All warranty form API calls: create, list, detail, delete, search.
 */

import client from '../api/client';

export const warrantyService = {
  create: (data) =>
    client.post('/warranty', data),

  getAll: () =>
    client.get('/warranty'),

  getById: (formId) =>
    client.get(`/warranty/${formId}`),

  delete: (formId) =>
    client.delete(`/warranty/${formId}`),

  search: (search, filterType) =>
    client.get('/warranty/search', { params: { search, filterType } }),
};
