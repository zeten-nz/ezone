function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) dp[i][0] = i;
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

/** 0..1 normalized similarity, 1 = identical. */
export function similarity(a, b) {
  if (!a.length && !b.length) return 1;
  const dist = levenshtein(a.toLowerCase(), b.toLowerCase());
  return 1 - dist / Math.max(a.length, b.length);
}

/**
 * Scans OCR'd lines for the one that best matches a set of label keywords
 * (e.g. "davlat raqami", "владелец"), tolerating OCR typos via fuzzy
 * similarity instead of requiring an exact substring match.
 */
export function findBestKeywordLine(lines, keywords, threshold = 0.55) {
  let best = null;
  lines.forEach((line, index) => {
    const words = line.text.split(/\s+/).filter(Boolean);
    for (let span = 1; span <= Math.min(3, words.length); span += 1) {
      const candidate = words.slice(0, span).join(' ');
      for (const keyword of keywords) {
        const score = similarity(candidate, keyword);
        if (score >= threshold && (!best || score > best.score)) {
          best = { index, line, score, matchedKeyword: keyword, labelSpan: span };
        }
      }
    }
  });
  return best;
}

/** Extracts the value portion of a label line: text after ':' / digits-prefix, or falls back to the next line. */
export function extractValueAfterLabel(match, lines) {
  const { line, labelSpan } = match;
  const words = line.text.split(/\s+/).filter(Boolean);
  const afterLabel = words.slice(labelSpan).join(' ').replace(/^[:.\-–\s]+/, '').trim();
  if (afterLabel) return { text: afterLabel, line };

  const next = lines[match.index + 1];
  if (next?.text) return { text: next.text.trim(), line: next };

  return { text: '', line };
}
