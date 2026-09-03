/**
 * PRESENTATION-ONLY mirror of the backend's managed-username parser
 * (ezone-server/utils/managedUsername.js) — powers the admin user form's
 * live preview and inline mismatch hint. The backend remains authoritative:
 * nothing here is a security control, and no other frontend business logic
 * may branch on this (one helper, per the Beta-2 rule).
 *
 * Grammar: <prefix>_<human-part…>_<region 2 digits>_<branch-number 1+ digits>
 * parsed from BOTH ENDS (human part may contain underscores).
 */
const PREFIX_TO_BRANCH_TYPE = { eg: 'EASYGAS', st: 'STAG_SERVICE', bs: 'OTHER_SERVICE' };

export const parseManagedUsernamePreview = (username) => {
  const parts = String(username || '').split('_');
  if (parts.length < 4) return { managed: false };

  const prefix = parts[0];
  const branchNumber = parts[parts.length - 1];
  const regionCode = parts[parts.length - 2];
  const humanTokens = parts.slice(1, -2);

  if (
    !/^[A-Za-z]{2}$/.test(prefix) ||
    !/^\d{2}$/.test(regionCode) ||
    !/^\d+$/.test(branchNumber) ||
    humanTokens.length < 1 ||
    humanTokens.some((tkn) => tkn.length === 0)
  ) {
    return { managed: false };
  }

  const branchType = PREFIX_TO_BRANCH_TYPE[prefix.toLowerCase()];
  if (!branchType) return { managed: false, unknownPrefix: true };

  return {
    managed: true,
    branchType,
    branchCode: `${regionCode}/${branchNumber}`,
    humanPart: humanTokens.join('_'),
  };
};
