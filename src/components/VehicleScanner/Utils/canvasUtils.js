// Canvas helpers shared across the scanner pipeline.

export function canvasFromImageSource(source, maxDim) {
  const canvas = document.createElement('canvas');
  let width = source.videoWidth || source.naturalWidth || source.width;
  let height = source.videoHeight || source.naturalHeight || source.height;

  if (maxDim && Math.max(width, height) > maxDim) {
    const scale = maxDim / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(source, 0, 0, width, height);
  return canvas;
}

export function cloneCanvas(source) {
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  canvas.getContext('2d').drawImage(source, 0, 0);
  return canvas;
}

export function resizeCanvas(source, targetWidth) {
  if (source.width === targetWidth) return cloneCanvas(source);
  const scale = targetWidth / source.width;
  const targetHeight = Math.round(source.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, targetWidth, targetHeight);
  return canvas;
}

export function rotateCanvas(source, degrees) {
  if (degrees % 360 === 0) return cloneCanvas(source);
  const rad = (degrees * Math.PI) / 180;
  const swap = degrees % 180 !== 0;
  const canvas = document.createElement('canvas');
  canvas.width = swap ? source.height : source.width;
  canvas.height = swap ? source.width : source.height;
  const ctx = canvas.getContext('2d');
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rad);
  ctx.drawImage(source, -source.width / 2, -source.height / 2);
  return canvas;
}

export function canvasToDataURL(canvas, quality = 0.92) {
  return canvas.toDataURL('image/jpeg', quality);
}

export function getImageData(canvas) {
  const ctx = canvas.getContext('2d');
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

export function putImageData(canvas, imageData) {
  canvas.getContext('2d').putImageData(imageData, 0, 0);
  return canvas;
}
