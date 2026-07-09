/**
 * A tiny pub/sub bridge between the axios client (outside the React tree,
 * can't call useAuth()) and AuthContext (owns the actual state + storage).
 * The client fires this on a 401; AuthContext listens and reacts by logging
 * out — React Router's existing reactive redirect then takes over, no full
 * page reload needed.
 */
const AUTH_UNAUTHORIZED_EVENT = 'auth:unauthorized';

export function emitUnauthorized() {
  window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
}

export function onUnauthorized(handler) {
  window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handler);
  return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handler);
}
