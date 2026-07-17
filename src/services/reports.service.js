/**
 * REPORTS SERVICE (admin-only)
 * Installer scoring + branch/product performance — all computed live on the
 * backend (never a cached counter). See ezone-server/controllers/reportsController.js.
 */

import client from '../api/client';

export const reportsService = {
  getTopInstallers: (period, limit) =>
    client.get('/reports/top-installers', { params: { period, limit } }),

  getMonthlyActivity: (year, employeeId) =>
    client.get('/reports/monthly-activity', { params: { year, employeeId } }),

  getProductsInstalled: (category) =>
    client.get('/reports/products-installed', { params: { category } }),

  getBranchRanking: (period) =>
    client.get('/reports/branch-ranking', { params: { period } }),

  // ── Phase 4 ──
  getDashboardTotals: () =>
    client.get('/reports/dashboard-totals'),

  getPointsLeaderboard: (period, limit) =>
    client.get('/reports/points-leaderboard', { params: { period, limit } }),

  getTopWarehouses: () =>
    client.get('/reports/top-warehouses'),

  getRecentImports: (limit) =>
    client.get('/reports/recent-imports', { params: { limit } }),

  getRecentWarrantyActivity: (limit) =>
    client.get('/reports/recent-warranty-activity', { params: { limit } }),

  getRecentInventoryActivity: (limit) =>
    client.get('/reports/recent-inventory-activity', { params: { limit } }),

  getInstallerStatistics: (installerId) =>
    client.get(`/reports/installer/${installerId}/statistics`),

  // Any authenticated role — always scoped to req.user.id server-side.
  getMyStatistics: () =>
    client.get('/reports/my-statistics'),

  getProductStatistics: (productId) =>
    client.get(`/reports/product/${productId}/statistics`),

  getWarehouseStatistics: (branchId) =>
    client.get(`/reports/warehouse/${branchId}/statistics`),
};
