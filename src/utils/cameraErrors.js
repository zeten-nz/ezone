/**
 * Maps a getUserMedia/decoder startup error to one of the scanner UI's
 * three error states. Pure and shared so QrScannerModal never carries
 * browser-quirk knowledge inline (Safari reports SecurityError where
 * Chrome reports NotAllowedError; Firefox uses the legacy *DeniedError
 * names) — and so the mapping is unit-testable without a camera.
 */
export const classifyCameraError = (error) => {
  const name = error?.name || '';
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError') {
    return 'permission';
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError' || name === 'OverconstrainedError' || name === 'ConstraintNotSatisfiedError') {
    return 'no-camera';
  }
  return 'init';
};

/** i18n key for each scanner error state — kept beside the classifier so the two can never drift. */
export const CAMERA_ERROR_LABEL_KEY = {
  permission: 'qrPermissionNeeded',
  'no-camera': 'qrNoCamera',
  init: 'qrCameraError',
};
