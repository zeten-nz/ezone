/**
 * API BARREL — backward-compatible re-exports
 *
 * All page components import named API objects from this file:
 *   import { authAPI, userAPI, warrantyAPI } from '../services/api';
 *
 * The actual implementation lives in dedicated service files under services/.
 * The axios instance and interceptors live in src/api/client.js.
 *
 * This file is the stable public interface. Service internals can evolve
 * without touching the import statements in every page component.
 */

import { authService }      from './auth.service';
import { usersService }     from './users.service';
import { warrantyService }  from './warranty.service';
import { dashboardService } from './dashboard.service';
import { exportService }    from './export.service';

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:          (username, password)      => authService.login(username, password),
  getProfile:     ()                        => authService.getProfile(),
  changePassword: (currentPw, newPw)        => authService.changePassword(currentPw, newPw),
};

// ── Users (admin) ─────────────────────────────────────────────────────────────
export const userAPI = {
  getAllUsers:    ()                         => usersService.getAll(),
  getUser:       (userId)                   => usersService.getById(userId),
  createUser:    (data)                     => usersService.create(data),
  updateUser:    (userId, data)             => usersService.update(userId, data),
  disableUser:   (userId)                   => usersService.disable(userId),
  resetPassword: (userId, newPassword)      => usersService.resetPassword(userId, newPassword),
};

// ── Warranty forms ────────────────────────────────────────────────────────────
export const warrantyAPI = {
  createForm:    (data)                     => warrantyService.create(data),
  getAllForms:   ()                          => warrantyService.getAll(),
  getFormDetail: (formId)                   => warrantyService.getById(formId),
  deleteForm:    (formId)                   => warrantyService.delete(formId),
  searchForms:   (search, filterType)       => warrantyService.search(search, filterType),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getDashboard: () => dashboardService.getStats(),
};

// ── Excel export ──────────────────────────────────────────────────────────────
export const exportAPI = {
  exportWarrantyForms: (days)               => exportService.allForms(days),
  exportByBranch:      (branch, days)       => exportService.byBranch(branch, days),
  exportEmployeeData:  (employeeId, days)   => exportService.byEmployee(employeeId, days),
};

// Re-export the raw client for edge cases (not for general component use)
export { default as apiClient } from '../api/client';
