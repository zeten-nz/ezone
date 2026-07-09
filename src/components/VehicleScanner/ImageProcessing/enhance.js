import { cloneCanvas, resizeCanvas, getImageData, putImageData } from '../Utils/canvasUtils';

const MIN_OCR_WIDTH = 1800; // upscale small captures so small print stays legible to Tesseract

/** Ensures the document image is large enough for Tesseract to read small text reliably. */
export function ensureMinResolution(canvas) {
  if (canvas.width >= MIN_OCR_WIDTH) return cloneCanvas(canvas);
  return resizeCanvas(canvas, MIN_OCR_WIDTH);
}

/** Converts to grayscale in place on a fresh canvas (luminance-weighted). */
export function toGrayscale(canvas) {
  const out = cloneCanvas(canvas);
  const imageData = getImageData(out);
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    data[i] = data[i + 1] = data[i + 2] = gray;
  }
  putImageData(out, imageData);
  return out;
}

/** 3x3 median filter — removes salt-and-pepper / camera-sensor noise without blurring edges much. */
export function denoise(canvas) {
  const out = cloneCanvas(canvas);
  const src = getImageData(canvas).data;
  const imageData = getImageData(out);
  const dst = imageData.data;
  const w = canvas.width;
  const h = canvas.height;
  const neighborhood = new Uint8ClampedArray(9);

  for (let y = 1; y < h - 1; y += 1) {
    for (let x = 1; x < w - 1; x += 1) {
      let n = 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const idx = ((y + dy) * w + (x + dx)) * 4;
          neighborhood[n] = src[idx];
          n += 1;
        }
      }
      neighborhood.sort();
      const idx = (y * w + x) * 4;
      dst[idx] = dst[idx + 1] = dst[idx + 2] = neighborhood[4];
    }
  }
  putImageData(out, imageData);
  return out;
}

/** Percentile-clipped contrast stretch — normalizes lighting so faint print becomes legible. */
export function normalizeContrast(canvas, clipPercent = 1) {
  const out = cloneCanvas(canvas);
  const imageData = getImageData(out);
  const { data } = imageData;

  const histogram = new Array(256).fill(0);
  for (let i = 0; i < data.length; i += 4) {
    histogram[data[i]] += 1;
  }
  const totalPixels = data.length / 4;
  const clip = totalPixels * (clipPercent / 100);

  let low = 0;
  let acc = 0;
  for (; low < 255; low += 1) {
    acc += histogram[low];
    if (acc > clip) break;
  }
  let high = 255;
  acc = 0;
  for (; high > 0; high -= 1) {
    acc += histogram[high];
    if (acc > clip) break;
  }
  if (high <= low) return out;

  const range = high - low;
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.min(255, Math.max(0, ((data[i] - low) / range) * 255));
    data[i] = data[i + 1] = data[i + 2] = v;
  }
  putImageData(out, imageData);
  return out;
}

/** Unsharp mask — sharpens text edges that get softened by camera autofocus/compression. */
export function sharpen(canvas, amount = 0.6) {
  const out = cloneCanvas(canvas);
  const src = getImageData(canvas).data;
  const imageData = getImageData(out);
  const dst = imageData.data;
  const w = canvas.width;
  const h = canvas.height;
  const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];

  for (let y = 1; y < h - 1; y += 1) {
    for (let x = 1; x < w - 1; x += 1) {
      let sum = 0;
      let k = 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const idx = ((y + dy) * w + (x + dx)) * 4;
          sum += src[idx] * kernel[k];
          k += 1;
        }
      }
      const idx = (y * w + x) * 4;
      const sharpened = src[idx] + (sum - src[idx]) * amount;
      const v = Math.min(255, Math.max(0, sharpened));
      dst[idx] = dst[idx + 1] = dst[idx + 2] = v;
    }
  }
  putImageData(out, imageData);
  return out;
}

/**
 * Adaptive (local-mean) threshold using an integral image for O(n) local
 * averages, so it stays fast even at ~1800px wide. Produces a binary
 * black-on-white image — used as a fallback OCR candidate when the plain
 * grayscale pass yields low confidence (hard shadows / uneven lighting).
 */
export function adaptiveThreshold(canvas, blockSize = 25, cValue = 10) {
  const out = cloneCanvas(canvas);
  const src = getImageData(canvas).data;
  const imageData = getImageData(out);
  const dst = imageData.data;
  const w = canvas.width;
  const h = canvas.height;
  const half = Math.floor(blockSize / 2);

  // Integral image (summed-area table) of grayscale values.
  const integral = new Float64Array((w + 1) * (h + 1));
  for (let y = 0; y < h; y += 1) {
    let rowSum = 0;
    for (let x = 0; x < w; x += 1) {
      rowSum += src[(y * w + x) * 4];
      integral[(y + 1) * (w + 1) + (x + 1)] = integral[y * (w + 1) + (x + 1)] + rowSum;
    }
  }

  const areaSum = (x0, y0, x1, y1) =>
    integral[(y1 + 1) * (w + 1) + (x1 + 1)] -
    integral[y0 * (w + 1) + (x1 + 1)] -
    integral[(y1 + 1) * (w + 1) + x0] +
    integral[y0 * (w + 1) + x0];

  for (let y = 0; y < h; y += 1) {
    const y0 = Math.max(0, y - half);
    const y1 = Math.min(h - 1, y + half);
    for (let x = 0; x < w; x += 1) {
      const x0 = Math.max(0, x - half);
      const x1 = Math.min(w - 1, x + half);
      const area = (x1 - x0 + 1) * (y1 - y0 + 1);
      const localMean = areaSum(x0, y0, x1, y1) / area;
      const idx = (y * w + x) * 4;
      const v = src[idx] > localMean - cValue ? 255 : 0;
      dst[idx] = dst[idx + 1] = dst[idx + 2] = v;
    }
  }
  putImageData(out, imageData);
  return out;
}

/**
 * Grayscale + contrast-enhanced OCR candidate. Kept as grayscale (not
 * binarized) because Tesseract's LSTM engine generally performs better on
 * clean grayscale than on hard-thresholded images.
 */
export function buildGrayscaleCandidate(documentCanvas) {
  let img = ensureMinResolution(documentCanvas);
  img = toGrayscale(img);
  img = denoise(img);
  img = normalizeContrast(img);
  img = sharpen(img);
  return img;
}

/** Binary candidate used as a fallback pass when the grayscale candidate scores low confidence. */
export function buildThresholdCandidate(grayscaleCandidate) {
  return adaptiveThreshold(grayscaleCandidate);
}
