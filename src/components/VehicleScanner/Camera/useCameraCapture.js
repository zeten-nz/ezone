import { useEffect, useRef, useState, useCallback } from 'react';
import { sharpnessScore, frameDiff } from '../Utils/imageStability';
import { canvasFromImageSource } from '../Utils/canvasUtils';

const SAMPLE_INTERVAL_MS = 200;
const SHARPNESS_THRESHOLD = 35;
const MOTION_THRESHOLD = 6; // mean abs pixel diff below this = "still"
const STABLE_FRAMES_REQUIRED = 4; // ~800ms of stillness+focus before auto-capture

/**
 * Polls the live video feed to detect when the frame is both still and in
 * focus, so we stop handing Tesseract blurry, motion-smeared captures.
 * Exposes live status for the alignment UI plus a manual capture escape hatch.
 */
export function useCameraCapture(webcamRef, { autoCapture = true, onReady } = {}) {
  const [status, setStatus] = useState('positioning'); // positioning | steadying | ready
  const previousFrameRef = useRef(null);
  const stableCountRef = useRef(0);
  const intervalRef = useRef(null);
  const firedRef = useRef(false);

  useEffect(() => {
    firedRef.current = false;
    stableCountRef.current = 0;

    intervalRef.current = setInterval(() => {
      const video = webcamRef.current?.video;
      if (!video || video.readyState < 2 || !video.videoWidth) return;

      const sharpness = sharpnessScore(video);
      const previous = previousFrameRef.current;
      const motion = previous ? frameDiff(previous, video) : Infinity;
      previousFrameRef.current = getSampleSource(video);

      const inFocus = sharpness >= SHARPNESS_THRESHOLD;
      const isStill = motion <= MOTION_THRESHOLD;

      if (inFocus && isStill) {
        stableCountRef.current += 1;
      } else {
        stableCountRef.current = 0;
      }

      if (stableCountRef.current >= STABLE_FRAMES_REQUIRED) {
        setStatus('ready');
        if (autoCapture && !firedRef.current) {
          firedRef.current = true;
          onReady?.();
        }
      } else if (inFocus || isStill) {
        setStatus('steadying');
      } else {
        setStatus('positioning');
      }
    }, SAMPLE_INTERVAL_MS);

    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only when the capture mode toggles
  }, [autoCapture]);

  const captureHighResFrame = useCallback(() => {
    const video = webcamRef.current?.video;
    if (!video) return null;
    return canvasFromImageSource(video);
  }, [webcamRef]);

  const reset = useCallback(() => {
    stableCountRef.current = 0;
    firedRef.current = false;
    previousFrameRef.current = null;
    setStatus('positioning');
  }, []);

  return { status, captureHighResFrame, reset };
}

// Keeping a small still image (not the live <video> element) as the "previous
// frame" reference avoids re-sampling a moving video element twice per tick.
function getSampleSource(video) {
  const canvas = document.createElement('canvas');
  canvas.width = 96;
  canvas.height = 96;
  canvas.getContext('2d').drawImage(video, 0, 0, 96, 96);
  return canvas;
}
