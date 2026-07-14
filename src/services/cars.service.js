/**
 * CARS SERVICE
 * Read-only search over the locally mirrored EasyGas vehicle catalog — backs
 * the warranty form's Vehicle Name catalog-first-with-free-text-fallback
 * autocomplete. See ezone-server/controllers/carController.js.
 */

import client from '../api/client';

export const carsService = {
  search: (query) =>
    client.get('/cars/search', { params: { q: query } }),
};
