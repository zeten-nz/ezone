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
};
