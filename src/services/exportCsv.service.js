/**
 * CSV EXPORT SERVICE (Phase 4)
 * Streamed CSV downloads — a deliberate departure from export.service.js's
 * XLSX pattern (see ezone-server/controllers/exportCsvController.js). Same
 * client-side blob/download mechanics as export.service.js, different
 * backend endpoints and file extension.
 */

import client from '../api/client';

export const exportCsvService = {
  inventory: () => client.get('/export-csv/inventory.csv', { responseType: 'blob' }),
  warranty: (employeeId) => client.get('/export-csv/warranty.csv', { responseType: 'blob', params: employeeId ? { employeeId } : {} }),
  points: () => client.get('/export-csv/points.csv', { responseType: 'blob' }),
  reports: () => client.get('/export-csv/reports.csv', { responseType: 'blob' }),
  installerStatistics: () => client.get('/export-csv/installer-statistics.csv', { responseType: 'blob' }),
  productStatistics: () => client.get('/export-csv/product-statistics.csv', { responseType: 'blob' }),
  warehouseStatistics: () => client.get('/export-csv/warehouse-statistics.csv', { responseType: 'blob' }),
};
