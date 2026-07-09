/**
 * Lightweight heuristic strength score (0-4) — length + character-class
 * variety. Not cryptographic, just enough to nudge users toward a better
 * password; a dedicated library (zxcvbn etc.) would add real bundle weight
 * for a purely cosmetic indicator.
 */
export function scorePasswordStrength(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}
