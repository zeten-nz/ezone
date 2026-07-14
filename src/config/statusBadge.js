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
};
