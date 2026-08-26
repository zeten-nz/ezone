/**
 * Pure decision for how a warranty's EasyGas section should render (§6). No React — unit-testable in isolation.
 *
 * Warranty DTO fields (all already returned by the warranty read APIs):
 *   - easygas_claim_url    : string | null
 *   - easygas_sync_result  : 'PENDING' | 'SUCCESS' | 'FAILED'   (NOTE: 'SUCCESS', not 'SUCCESSFUL')
 *   - status               : 'PENDING' | 'SUCCESSFUL' | 'REJECTED'  (the form's own review status — a DIFFERENT field)
 *   - easygas_sync_error   : string | null   (admin-only detail)
 *
 * Modes:
 *   - 'qr'           → a claim_url exists → show the QR (encodes the URL verbatim). Wins unconditionally.
 *   - 'inconsistent' → sync reported SUCCESS but there is NO claim_url → safe warning; never reconstruct a URL.
 *   - 'failed'       → the form was approved (status SUCCESSFUL) but the EasyGas sync FAILED (no claim_url) → failure state.
 *   - 'none'         → nothing to show yet (pending sync, not reviewed, rejected, etc.).
 */
export const hasClaimUrl = (form) =>
  typeof form?.easygas_claim_url === 'string' && form.easygas_claim_url.trim() !== '';

export const easyGasDisplayMode = (form) => {
  if (!form) return 'none';
  if (hasClaimUrl(form)) return 'qr';
  if (form.easygas_sync_result === 'SUCCESS') return 'inconsistent'; // SUCCESS but missing claim_url
  if (form.status === 'SUCCESSFUL' && form.easygas_sync_result === 'FAILED') return 'failed';
  return 'none';
};
