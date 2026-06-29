/**
 * AXIOS HTTP CLIENT — SINGLE INSTANCE
 *
 * All API calls in the application go through this one axios instance.
 * This gives us a single place to configure:
 *   - Base URL (from env, never hardcoded)
 *   - Timeout (prevents hung requests)
 *   - Authorization header injection (every request automatically)
 *   - Automatic logout on 401 (token expired or revoked)
 *   - Network error normalization (no raw axios error objects reaching UI)
 *
 * Components and pages MUST NOT create their own axios instances or call
 * axios/fetch directly — always import a service from src/services/.
 */

import axios from 'axios';
import { STORAGE_KEYS, API_TIMEOUT_MS } from '../config/constants';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor ───────────────────────────────────────────────────────
// Automatically attaches the JWT to every outgoing request.
// Reading from localStorage here (not React state) because axios interceptors
// live outside the React component tree.
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ──────────────────────────────────────────────────────
client.interceptors.response.use(
  // Success: pass through untouched
  (response) => response,

  (error) => {
    // No response at all → network problem (offline, DNS failure, CORS, timeout)
    if (!error.response) {
      return Promise.reject(
        new Error('Network error. Please check your internet connection.')
      );
    }

    // 401 Unauthorized → token expired or revoked.
    // Clear storage and redirect to login. A hard redirect (window.location)
    // is intentional here: it resets all React state cleanly, which is the
    // safest behaviour when authentication is lost.
    if (error.response.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      window.location.replace('/login');
      return Promise.reject(error);
    }

    // 403 Forbidden → user authenticated but doesn't have permission.
    // Let the component handle this (show a message, don't redirect).
    if (error.response.status === 403) {
      return Promise.reject(
        new Error('You do not have permission to perform this action.')
      );
    }

    // 5xx Server errors → normalize the message
    if (error.response.status >= 500) {
      return Promise.reject(
        new Error(error.response.data?.message || 'Server error. Please try again later.')
      );
    }

    // 4xx Client errors (400, 404, 422, etc.) → pass through so the
    // component can show the server's validation message.
    return Promise.reject(error);
  }
);

export default client;
