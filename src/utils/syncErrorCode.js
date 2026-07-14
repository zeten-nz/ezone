/**
 * Parses the leading `CODE: ` token ezone-server/services/easyGasSyncService.js's
 * classifyResult always prefixes onto a warranty's easygas_last_error, so the
 * UI can show a translated reason (config/errorCodes.js) instead of raw
 * English debug text. Returns null if no recognizable leading token exists.
 */
export const extractSyncErrorCode = (lastError) => {
  if (!lastError) return null;
  const match = lastError.match(/^([A-Z_]+):/);
  return match ? match[1] : null;
};
