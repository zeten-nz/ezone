/**
 * AXIOS HTTP CLIENT — SINGLE INSTANCE
 *
 * All API calls in the application go through this one axios instance.
 * This gives us a single place to configure:
 *   - Base URL (from env, never hardcoded)
 *   - Timeout (prevents hung requests)
 *   - Authorization header injection (every request automatically)
 *   - Automatic logout on 401 (token expired or revoked) — signaled via
 *     src/utils/authEvents.js so AuthContext (which owns storage + React
 *     state) reacts, rather than this file reaching into storage/routing
 *     itself. See src/utils/authStorage.js for the storage contract.
 *   - Error normalization — pages NEVER receive raw Axios errors
 *
 * Components and pages MUST NOT create their own axios instances or call
 * axios/fetch directly — always import a service from src/services/.
 * Pages MUST use err.message only; never access err.response directly.
 */

import axios from 'axios';
import { API_TIMEOUT_MS } from '../config/constants';
import { getStoredAuth, clearStoredAuth } from '../utils/authStorage';
import { emitUnauthorized } from '../utils/authEvents';
import { getErrorMessage } from '../config/errorCodes';

// client.js is a plain module, not a React component — it can't call
// useLanguage(). LanguageProvider persists to this same key (see
// src/context/LanguageContext.jsx), so reading it directly here is the same
// pattern src/components/ErrorBoundary.jsx uses for its GlobalBoundary branch.
const getLanguage = () => localStorage.getItem('ezone_language') || 'uz';

// 401s from these endpoints are the user simply typing a wrong password —
// login (wrong password), register (backend also validates here), and
// change-password (ezone-server/controllers/authController.js returns 401
// with "Current password is incorrect" for a mistyped current password).
// None of these are an expired session, so none should trigger the global
// logout-and-redirect below — that would incorrectly boot an authenticated
// user back to the login page just for fat-fingering a password field.
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/change-password'];
const isAuthEndpoint = (url) => AUTH_ENDPOINTS.some((path) => url?.includes(path));

// ── AppError ──────────────────────────────────────────────────────────────────
// Every rejected promise from this client rejects with an AppError, never a
// raw Axios error. Pages call err.message only — always a user-friendly string.
export class AppError extends Error {
  constructor(message, statusCode = 0, errorCode = 'UNKNOWN_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

// ── Axios instance ────────────────────────────────────────────────────────────
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor ───────────────────────────────────────────────────────
// Automatically attaches the JWT to every outgoing request.
client.interceptors.request.use(
  (config) => {
    // getStoredAuth() also clears storage if the token is already obviously
    // expired, so an expired token is never even sent — but the actual
    // logout/redirect only happens on a real 401 below (see AUTH_ENDPOINTS
    // comment above): the server stays the authority on token validity.
    const { token } = getStoredAuth();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Lets the backend localize response content that can't be translated
    // client-side after the fact — currently only CSV exports (see
    // ezone-server/config/csvLabels.js), generated server-side as a byte
    // stream, not JSON the frontend could run through LanguageContext's t().
    config.headers['X-Language'] = getLanguage();
    return config;
  },
  () => Promise.reject(new AppError(getErrorMessage('UNKNOWN_ERROR', 0, getLanguage())))
);

// ── Response interceptor ──────────────────────────────────────────────────────
client.interceptors.response.use(
  // Success: pass through untouched
  (response) => response,

  (error) => {
    const language = getLanguage();

    // Timeout — axios sets error.code = 'ECONNABORTED' on timeout
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(
        new AppError(getErrorMessage('TIMEOUT', 0, language), 0, 'TIMEOUT')
      );
    }

    // No response → network problem (offline, DNS failure, CORS)
    if (!error.response) {
      return Promise.reject(
        new AppError(getErrorMessage('NETWORK_ERROR', 0, language), 0, 'NETWORK_ERROR')
      );
    }

    const { status, data } = error.response;

    // 401 → token missing/invalid/expired (the backend doesn't distinguish
    // these — see ezone-server/middleware/auth.js). A 401 from the login or
    // register endpoint itself is just a wrong-password/duplicate-username
    // response, not a session expiring, so it's excluded here and left for
    // the calling page to display via err.message as usual.
    if (status === 401 && !isAuthEndpoint(error.config?.url)) {
      clearStoredAuth();
      emitUnauthorized();
      return Promise.reject(
        new AppError(getErrorMessage('UNAUTHORIZED', 401, language), 401, 'UNAUTHORIZED')
      );
    }

    // Log full details in dev only — never in production. The raw backend
    // `message` is for this console line alone; it must never reach AppError.
    if (import.meta.env.DEV) {
      console.error(
        `[API Error] ${status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        data
      );
    }

    const errorCode = data?.errorCode || `HTTP_${status}`;
    const message = getErrorMessage(errorCode, status, language);

    return Promise.reject(new AppError(message, status, errorCode));
  }
);

export default client;
