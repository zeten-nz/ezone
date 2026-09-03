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

export const filterBranches = (branches, query, { includeInactive = false } = {}) => {
  const candidates = includeInactive ? (branches || []) : (branches || []).filter(isActiveBranch);
  const q = String(query || '').trim().toLowerCase();
  if (!q) return candidates;
  return candidates.filter((b) =>
    [b.code, b.name, b.region, b.district].some(
      (field) => field && String(field).toLowerCase().includes(q)
    )
  );
};
