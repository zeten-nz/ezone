export function cleanWhitespace(str = '') {
  return str.replace(/\s+/g, ' ').replace(/[|_~`]/g, '').trim();
}

// Common vehicle brands sold/registered in Uzbekistan (UzAuto/Chevrolet-badged
// models dominate, plus common imports). Maps frequent OCR misreads to the
// canonical spelling. Extend this list as real scans reveal new variants.
const BRAND_CANON = [
  'Chevrolet', 'Daewoo', 'Isuzu', 'Hyundai', 'Kia', 'Toyota', 'Lexus', 'Nissan',
  'BMW', 'Mercedes-Benz', 'MAN', 'Kamaz', 'Cobalt', 'Nexia', 'Spark', 'Lacetti',
  'Malibu', 'Gentra', 'Damas', 'Labo', 'Tracker', 'Onix', 'Captiva', 'Ravon',
];

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

/** Fuzzy-matches the leading word of a brand/model string against the known brand list. */
export function normalizeBrandName(str = '') {
  const cleaned = cleanWhitespace(str);
  if (!cleaned) return { value: cleaned, matched: false };

  const firstWord = cleaned.split(/[\s/]+/)[0];
  let best = null;
  let bestScore = 0;
  for (const brand of BRAND_CANON) {
    const dist = levenshtein(firstWord.toLowerCase(), brand.toLowerCase());
    const score = 1 - dist / Math.max(firstWord.length, brand.length);
    if (score > bestScore) {
      bestScore = score;
      best = brand;
    }
  }

  if (best && bestScore >= 0.6) {
    const rest = cleaned.slice(firstWord.length).trim();
    return { value: rest ? `${best} ${rest}` : best, brand: best, matched: true, score: bestScore };
  }
  return { value: cleaned, matched: false };
}
