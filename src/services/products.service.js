/**
 * PRODUCTS SERVICE
 * A searchable model catalog (e.g. "STAG R02") — not serialized inventory.
 * `search` powers the warranty form's autocomplete; the rest is admin CRUD.
 * See ezone-server/controllers/productController.js.
 */

import client from '../api/client';

export const productsService = {
  getAll: (page, limit, search, category) =>
    client.get('/products', { params: { page, limit, search, category } }),

  // Any authenticated role — the warranty form's Product autocomplete.
  // equipmentType scopes results to that row's allowed categories, brand to
  // the installer's chosen Brand, fuelType excludes catalog products whose
  // own fuel type conflicts with the warranty's single installation-wide one.
  search: (query, equipmentType, brand, fuelType) =>
    client.get('/products/search', { params: { q: query, equipmentType, brand, fuelType } }),

  // Populates the Brand `Select` that gates the Product autocomplete.
  getBrands: (equipmentType) =>
    client.get('/products/brands', { params: { equipmentType } }),

  create: (data) =>
    client.post('/products', data),

  update: (productId, data) =>
    client.put(`/products/${productId}`, data),

  activate: (productId) =>
    client.patch(`/products/${productId}/activate`),

  deactivate: (productId) =>
    client.patch(`/products/${productId}/deactivate`),

  delete: (productId) =>
    client.delete(`/products/${productId}`),
};
