/**
 * Client-side branch filtering for BranchSelect (Beta-1). ~260 branches
 * total, so in-memory search beats a server round-trip — searches code,
 * name, region, and district, case-insensitively. Pure (no React), covered
 * by branchSearch.test.js.
 */

// GET /api/branches rows carry is_active (1/0); GET /api/branches/public
// rows omit the field entirely because that endpoint is already
// active-only — treat "field absent" as active.
export const isActiveBranch = (branch) => branch?.is_active === undefined || !!branch.is_active;

// Beta-2: business-type filter. 'ALL' passes everything; 'UNCLASSIFIED'
// matches branch_type NULL/undefined ("Tayinlanmagan" — a TYPE state,
// deliberately independent of is_active: an active unclassified branch
// stays fully selectable); a concrete type matches exactly.
const matchesType = (branch, type) => {
  if (!type || type === 'ALL') return true;
  if (type === 'UNCLASSIFIED') return branch.branch_type === null || branch.branch_type === undefined;
  return branch.branch_type === type;
};

export const filterBranches = (branches, query, { includeInactive = false, type = 'ALL' } = {}) => {
  const candidates = (includeInactive ? (branches || []) : (branches || []).filter(isActiveBranch))
    .filter((b) => matchesType(b, type));
  const q = String(query || '').trim().toLowerCase();
  if (!q) return candidates;
  return candidates.filter((b) =>
    [b.code, b.name, b.region, b.district].some(
      (field) => field && String(field).toLowerCase().includes(q)
    )
  );
};
