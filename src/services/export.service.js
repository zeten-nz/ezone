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
  allForms: (days = 'all', lang = 'uz') =>
    client.get('/export/warranty', { params: { days, lang }, responseType: 'blob' }),

  byBranch: (branch, days = 'all', lang = 'uz') =>
    client.get('/export/branch', { params: { branch, days, lang }, responseType: 'blob' }),

  byEmployee: (employeeId, days = 'all', lang = 'uz') =>
    client.get('/export/employee', { params: { employeeId, days, lang }, responseType: 'blob' }),
};
