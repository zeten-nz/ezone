/**
 * DASHBOARD SERVICE
 * Admin dashboard statistics endpoint.
 */

import client from '../api/client';

export const dashboardService = {
  getStats: () =>
    client.get('/dashboard'),
};
