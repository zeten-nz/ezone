// Lightweight frame-quality metrics used by the camera hook to decide when to
// auto-capture: the frame must be both still (no motion vs. previous frame)
// and sharp (not blurred by camera shake / focus hunting).

const SAMPLE_SIZE = 96; // small grayscale sample keeps this cheap enough for ~5fps polling

function sampleGrayscale(source) {
  const canvas = document.createElement('canvas');
  canvas.width = SAMPLE_SIZE;
  canvas.height = SAMPLE_SIZE;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(source, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  const gray = new Float32Array(SAMPLE_SIZE * SAMPLE_SIZE);
  for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
    gray[p] = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
  }
  return gray;
}

/**
 * Variance of the Laplacian (simple 4-neighbour approximation) — a standard,
 * cheap blur metric. Higher = sharper. Values above ~40-60 on this sample
 * size are usually in-focus for a document under normal lighting.
 */
export function sharpnessScore(source) {
  const gray = sampleGrayscale(source);
  const n = SAMPLE_SIZE;
  let sum = 0;
  let sumSq = 0;
  let count = 0;
  for (let y = 1; y < n - 1; y += 1) {
    for (let x = 1; x < n - 1; x += 1) {
      const idx = y * n + x;
      const lap =
        gray[idx - 1] + gray[idx + 1] + gray[idx - n] + gray[idx + n] - 4 * gray[idx];
      sum += lap;
      sumSq += lap * lap;
      count += 1;
    }
  }
  const mean = sum / count;
  return sumSq / count - mean * mean;
}

/** Mean absolute pixel difference between two frames, 0-255 scale. */
export function frameDiff(sourceA, sourceB) {
  const a = sampleGrayscale(sourceA);
  const b = sampleGrayscale(sourceB);
  let total = 0;
  for (let i = 0; i < a.length; i += 1) {
    total += Math.abs(a[i] - b[i]);
  }
  return total / a.length;
}
