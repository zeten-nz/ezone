/**
 * AUTH STORAGE — single source of truth for persisted auth state.
 *
 * Token and user are always read/written/cleared together as one atomic
 * unit. Nothing outside this file should touch STORAGE_KEYS.TOKEN or
 * STORAGE_KEYS.USER directly — AuthContext and the axios client both go
 * through these functions so the two can never drift out of sync.
 */

import { STORAGE_KEYS } from '../config/constants';

/** Decodes a JWT's payload without verifying the signature (the client has
 * no secret to verify with) — enough to proactively catch an obviously
 * expired token instead of waiting for a server round-trip to find out. */
function decodeJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  if (!token) return true;
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

/** Returns the stored { token, user } pair, or both null if either half is
 * missing/corrupt/expired — a session is only ever restored as a whole. */
export function getStoredAuth() {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const rawUser = localStorage.getItem(STORAGE_KEYS.USER);

  if (!token || !rawUser) {
    clearStoredAuth();
    return { token: null, user: null };
  }

  if (isTokenExpired(token)) {
    clearStoredAuth();
    return { token: null, user: null };
  }

  try {
    const user = JSON.parse(rawUser);
    return { token, user };
  } catch {
    clearStoredAuth();
    return { token: null, user: null };
  }
}

export function setStoredAuth(user, token) {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export function clearStoredAuth() {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
}
