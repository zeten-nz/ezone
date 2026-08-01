/**
 * CARS SERVICE
 * Local ERP master data (vehicle models, e.g. "Chevrolet Cobalt") — admin
 * CRUD, plus a search endpoint that backs the warranty form's Vehicle Name
 * catalog-first-with-free-text-fallback autocomplete.
 * See ezone-server/controllers/carController.js.
 */

import client from '../api/client';

export const carsService = {
  // Any authenticated role — installers search mid-form-fill.
  search: (query) =>
    client.get('/cars/search', { params: { q: query } }),

  getAll: (page, limit, search) =>
    client.get('/cars', { params: { page, limit, search } }),

  create: (data) =>
    client.post('/cars', data),

  update: (carId, data) =>
    client.put(`/cars/${carId}`, data),

  activate: (carId) =>
    client.patch(`/cars/${carId}/activate`),

  deactivate: (carId) =>
    client.patch(`/cars/${carId}/deactivate`),

  delete: (carId) =>
    client.delete(`/cars/${carId}`),
};
