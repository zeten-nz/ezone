/** Formats large counts compactly for stat tiles: 1284 -> "1,284", 12900 -> "12.9K". */
export function formatCompactNumber(value) {
  const n = Number(value) || 0;
  if (n < 1000) return n.toLocaleString();
  if (n < 1_000_000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}
