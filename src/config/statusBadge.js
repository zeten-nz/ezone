/**
 * Single source of truth for every status pill in the app — user accounts
 * (ACTIVE/DISABLED) and registration requests (PENDING/APPROVED/REJECTED)
 * previously each had their own ad-hoc variant/label mapping; this is the one
 * place to add a new status or change a color going forward.
 */
export const STATUS_BADGE = {
  ACTIVE:    { variant: 'success', labelKey: 'active' },
  DISABLED:  { variant: 'danger',  labelKey: 'inactive' },
  PENDING:   { variant: 'warning', labelKey: 'statusPending' },
  APPROVED:  { variant: 'success', labelKey: 'statusApproved' },
  REJECTED:  { variant: 'neutral', labelKey: 'statusRejected' },
  // EasyGas warranty sync status (warranty_forms.easygas_sync_status) — own
  // label keys rather than reusing PENDING's statusPending, which reads
  // naturally for a registration request but not for a sync queue state.
  SYNC_PENDING: { variant: 'neutral', labelKey: 'syncStatusPending' },
  SYNC_SYNCING: { variant: 'warning', labelKey: 'syncStatusSyncing' },
  SYNC_SYNCED:  { variant: 'success', labelKey: 'syncStatusSynced' },
  SYNC_FAILED:  { variant: 'danger',  labelKey: 'syncStatusFailed' },
  // Physical inventory item status (inventory_items.status) — own label
  // keys. IN_STOCK's labelKey text was relabeled "Available" in Phase 4
  // (the ENUM value/all SQL/JS comparisons stay 'IN_STOCK' — display-only
  // change, see the Phase 4 plan's Critical Review #2).
  IN_STOCK:  { variant: 'success', labelKey: 'inventoryStatusInStock' },
  RESERVED:  { variant: 'warning', labelKey: 'inventoryStatusReserved' },
  INSTALLED: { variant: 'neutral', labelKey: 'inventoryStatusInstalled' },
  RETURNED:  { variant: 'warning', labelKey: 'inventoryStatusReturned' },
  DAMAGED:   { variant: 'danger',  labelKey: 'inventoryStatusDamaged' },
  LOST:      { variant: 'danger',  labelKey: 'inventoryStatusLost' },
  MERGED:    { variant: 'neutral', labelKey: 'inventoryStatusMerged' },
  // Point ledger transaction type (point_transactions.transaction_type) —
  // own label keys.
  WARRANTY_AWARD:     { variant: 'success', labelKey: 'pointsTypeWarrantyAward' },
  WARRANTY_REVERSAL:  { variant: 'neutral', labelKey: 'pointsTypeWarrantyReversal' },
  MANUAL_ADJUSTMENT:  { variant: 'warning', labelKey: 'pointsTypeManualAdjustment' },
  MANUAL_BONUS:       { variant: 'success', labelKey: 'pointsTypeManualBonus' },
  MANUAL_PENALTY:     { variant: 'danger',  labelKey: 'pointsTypeManualPenalty' },
  // Manual Verification workflow (warranty_equipment.verification_status) —
  // own label keys, same reasoning as SYNC_* above. No VERIFICATION_AUTO
  // entry: AUTO is the ordinary, unremarkable default (every row before this
  // feature existed, and most rows after) — callers simply don't render a
  // badge for it at all rather than adding visual noise to every equipment
  // row (see WarrantyDetailModal.jsx).
  VERIFICATION_PENDING:  { variant: 'warning', labelKey: 'verificationStatusPending' },
  VERIFICATION_APPROVED: { variant: 'success', labelKey: 'verificationStatusApproved' },
  VERIFICATION_REJECTED: { variant: 'danger',  labelKey: 'verificationStatusRejected' },
};
