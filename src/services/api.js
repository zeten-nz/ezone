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

import { authService }                 from './auth.service';
import { usersService }                from './users.service';
import { warrantyService }             from './warranty.service';
import { dashboardService }            from './dashboard.service';
import { exportService }               from './export.service';
import { registrationRequestsService } from './registrationRequests.service';
import { branchesService }             from './branches.service';
import { productsService }             from './products.service';
import { reportsService }              from './reports.service';
import { carsService }                 from './cars.service';

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register:            (data)                    => authService.register(data),
  login:               (username, password)      => authService.login(username, password),
  getProfile:          ()                        => authService.getProfile(),
  changePassword:      (currentPw, newPw)        => authService.changePassword(currentPw, newPw),
  getProfilePhotoBlob: ()                        => authService.getProfilePhotoBlob(),
  updateProfilePhoto:  (photo)                   => authService.updateProfilePhoto(photo),
  removeProfilePhoto:  ()                        => authService.removeProfilePhoto(),
};

// ── Users (admin) ─────────────────────────────────────────────────────────────
export const userAPI = {
  getAllUsers:    ()                         => usersService.getAll(),
  getUser:       (userId)                   => usersService.getById(userId),
  createUser:    (data)                     => usersService.create(data),
  updateUser:    (userId, data)             => usersService.update(userId, data),
  disableUser:   (userId)                   => usersService.disable(userId),
  enableUser:    (userId)                   => usersService.enable(userId),
  resetPassword: (userId, newPassword)      => usersService.resetPassword(userId, newPassword),
};

// ── Warranty forms ────────────────────────────────────────────────────────────
export const warrantyAPI = {
  createForm:    (data)                     => warrantyService.create(data),
  updateForm:    (formId, data)             => warrantyService.update(formId, data),
  getAllForms:   (page, limit, search)       => warrantyService.getAll(page, limit, search),
  getMyForms:   (page, limit, search)       => warrantyService.getMyForms(page, limit, search),
  getFormDetail: (formId)                   => warrantyService.getById(formId),
  deleteForm:    (formId)                   => warrantyService.delete(formId),
  searchForms:   (search, filterType)       => warrantyService.search(search, filterType),
  retrySync:     (formId)                   => warrantyService.retrySync(formId),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getDashboard: () => dashboardService.getStats(),
};

// ── Excel export ──────────────────────────────────────────────────────────────
export const exportAPI = {
  exportWarrantyForms: (days, lang)               => exportService.allForms(days, lang),
  exportByBranch:      (branch, days, lang)       => exportService.byBranch(branch, days, lang),
  exportEmployeeData:  (employeeId, days, lang)   => exportService.byEmployee(employeeId, days, lang),
};

// ── Registration requests (admin) ────────────────────────────────────────────
export const registrationRequestsAPI = {
  getAll:        ()             => registrationRequestsService.getAll(),
  getById:       (id)           => registrationRequestsService.getById(id),
  getPhotoBlob:  (id)           => registrationRequestsService.getPhotoBlob(id),
  approve:       (id)           => registrationRequestsService.approve(id),
  reject:        (id, notes)    => registrationRequestsService.reject(id, notes),
};

// ── Branches (admin) ─────────────────────────────────────────────────────────
export const branchAPI = {
  getPublic: ()                    => branchesService.getPublic(),
  getAll:    ()                    => branchesService.getAll(),
  create:    (data)                => branchesService.create(data),
  update:    (branchId, data)      => branchesService.update(branchId, data),
  disable:   (branchId)            => branchesService.disable(branchId),
  enable:    (branchId)            => branchesService.enable(branchId),
};

// ── Products (admin CRUD; search/brands usable by any authenticated role) ───
export const productAPI = {
  getAll:     (page, limit, search, category)          => productsService.getAll(page, limit, search, category),
  search:     (query, equipmentType, brand, fuelType)  => productsService.search(query, equipmentType, brand, fuelType),
  getBrands:  (equipmentType)                           => productsService.getBrands(equipmentType),
  create:     (data)                                    => productsService.create(data),
  update:     (productId, data)                         => productsService.update(productId, data),
  activate:   (productId)                               => productsService.activate(productId),
  deactivate: (productId)                               => productsService.deactivate(productId),
  delete:     (productId)                               => productsService.delete(productId),
};

// ── Reports (admin) ──────────────────────────────────────────────────────────
export const reportsAPI = {
  getTopInstallers:     (period, limit)     => reportsService.getTopInstallers(period, limit),
  getMonthlyActivity:   (year, employeeId)  => reportsService.getMonthlyActivity(year, employeeId),
  getProductsInstalled: (category)          => reportsService.getProductsInstalled(category),
  getBranchRanking:     (period)            => reportsService.getBranchRanking(period),
};

// ── Vehicle catalog (any authenticated role) ─────────────────────────────────
export const carAPI = {
  search: (query) => carsService.search(query),
};

// Re-export the raw client for edge cases (not for general component use)
export { default as apiClient } from '../api/client';
