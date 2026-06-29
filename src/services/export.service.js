/**
 * EXPORT SERVICE
 * Excel file export endpoints. All return binary blobs.
 *
 * Usage with the downloadBlob utility:
 *   const { data } = await exportService.allForms('30');
 *   downloadBlob(data, 'warranty_forms.xlsx');
 */

import client from '../api/client';

export const exportService = {
  allForms: (days = 'all') =>
    client.get('/export/warranty', { params: { days }, responseType: 'blob' }),

  byBranch: (branch, days = 'all') =>
    client.get('/export/branch', { params: { branch, days }, responseType: 'blob' }),

  byEmployee: (employeeId, days = 'all') =>
    client.get('/export/employee', { params: { employeeId, days }, responseType: 'blob' }),
};
