/**
 * Branch business-group classification (Beta-2) — frontend mirror of
 * ezone-server/config/branchTypes.js. The ONE frontend source for type
 * values, label keys, and filter options; components never hardcode these
 * strings. NULL/undefined branch_type = unclassified ("Tayinlanmagan") — a
 * valid state, independent of is_active.
 */
export const BRANCH_TYPES = ['EASYGAS', 'STAG_SERVICE', 'OTHER_SERVICE'];

const BRANCH_TYPE_LABEL_KEY = {
  EASYGAS: 'branchTypeEasyGas',
  STAG_SERVICE: 'branchTypeStagService',
  OTHER_SERVICE: 'branchTypeOtherService',
};

export const getBranchTypeLabel = (t, branchType) =>
  t(branchType ? BRANCH_TYPE_LABEL_KEY[branchType] || 'branchTypeUnclassified' : 'branchTypeUnclassified');

/** Filter dropdown options: All / the 3 types / Unclassified. */
export const branchTypeFilterOptions = (t) => [
  { value: 'ALL', label: t('branchTypeFilterAll') },
  { value: 'EASYGAS', label: t('branchTypeEasyGas') },
  { value: 'STAG_SERVICE', label: t('branchTypeStagService') },
  { value: 'OTHER_SERVICE', label: t('branchTypeOtherService') },
  { value: 'UNCLASSIFIED', label: t('branchTypeUnclassified') },
];
