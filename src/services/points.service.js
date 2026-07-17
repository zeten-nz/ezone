/**
 * POINTS SERVICE
 * Installer points ledger — see ezone-server/controllers/pointsController.js.
 */

import client from '../api/client';

export const pointsService = {
  // Any authenticated role — always scoped to req.user.id server-side.
  getMine: (page, limit) =>
    client.get('/points/mine', { params: { page, limit } }),

  // ADMIN — any installer's ledger + total.
  getForInstaller: (installerId, page, limit) =>
    client.get(`/points/installer/${installerId}`, { params: { page, limit } }),

  // ADMIN (view) — products with their current configured point value.
  getProductConfigs: (page, limit, search) =>
    client.get('/points/configs', { params: { page, limit, search } }),

  // Super Admin only.
  setProductConfig: (productId, points) =>
    client.put(`/points/configs/${productId}`, { points }),

  // Super Admin only. idempotencyKey is client-generated so a retried/
  // double-clicked submission can't create a duplicate manual transaction.
  createAdjustment: (installerId, points, type, reason) =>
    client.post('/points/adjustments', {
      installerId,
      points,
      type,
      reason,
      idempotencyKey: crypto.randomUUID(),
    }),
};
