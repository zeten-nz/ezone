/**
 * FILE DOWNLOAD UTILITY
 *
 * Creates a temporary anchor element to trigger a browser file download
 * from a Blob. Revokes the object URL afterward to prevent memory leaks.
 *
 * Used by AdminDashboardModern and EmployeeProfileModern for Excel exports.
 *
 * @param {Blob} blob - The raw file data returned by the export API
 * @param {string} filename - The filename the browser will save the file as
 */
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(new Blob([blob]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  // Release the object URL to free memory — forgetting this is a common leak
  window.URL.revokeObjectURL(url);
};

/**
 * Builds a timestamped export filename.
 *
 * @param {string} prefix - e.g. 'warranty_forms'
 * @param {string} days - '30', '90', or 'all'
 * @returns {string} e.g. 'warranty_forms_2024-01-15_last30days.xlsx'
 */
export const buildExportFilename = (prefix, days) => {
  const date = new Date().toISOString().split('T')[0];
  const range = days === 'all' ? 'all' : `last${days}days`;
  return `${prefix}_${date}_${range}.xlsx`;
};
