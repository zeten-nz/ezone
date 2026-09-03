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
import { brandsService }               from './brands.service';
import { productsService }             from './products.service';
import { reportsService }              from './reports.service';
import { carsService }                 from './cars.service';
import { inventoryService }            from './inventory.service';
import { pointsService }               from './points.service';
import { exportCsvService }            from './exportCsv.service';
import { catalogSyncService }          from './catalogSync.service';

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
  getAllForms:   (page, limit, search, employeeId, verificationStatus) => warrantyService.getAll(page, limit, search, employeeId, verificationStatus),
  getMyForms:   (page, limit, search)       => warrantyService.getMyForms(page, limit, search),
  getFormDetail: (formId)                   => warrantyService.getById(formId),
  deleteForm:    (formId)                   => warrantyService.delete(formId),
  searchForms:   (search, filterType)       => warrantyService.search(search, filterType),
  lookupByPhone: (phone)                    => warrantyService.lookupByPhone(phone),
  approveVerification:    (equipmentId, notes) => warrantyService.approveVerification(equipmentId, notes),
  rejectVerification:     (equipmentId, notes) => warrantyService.rejectVerification(equipmentId, notes),
  approveForm:            (formId, notes)       => warrantyService.approveForm(formId, notes),
  rejectForm:             (formId, notes)       => warrantyService.rejectForm(formId, notes),
  getEquipmentPhotoBlob:  (equipmentId)        => warrantyService.getEquipmentPhotoBlob(equipmentId),
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

// ── Brands (EasyGas-synced catalog; admin UI is read-only, but create/update/
// activate/deactivate/delete stay wired end-to-end — see
// ezone-server/middleware/catalogReadOnlyGuard.js, which 403s them
// server-side. Kept here, unused by any current page, so a future
// architecture change doesn't need to rebuild this client-side wiring.) ────
export const brandAPI = {
  getAll:     (page, limit, search)  => brandsService.getAll(page, limit, search),
  getActive:  ()                     => brandsService.getActive(),
  create:     (data)                 => brandsService.create(data),
  update:     (brandId, data)        => brandsService.update(brandId, data),
  activate:   (brandId)              => brandsService.activate(brandId),
  deactivate: (brandId)              => brandsService.deactivate(brandId),
  delete:     (brandId)              => brandsService.delete(brandId),
};

// ── Products (EasyGas-synced catalog; admin UI is read-only — same
// unused-but-wired reasoning as brandAPI above.) ─────────────────────────────
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

// ── Catalog sync (admin) ─────────────────────────────────────────────────────
// Triggers/reads the ONE brands+products+cars EasyGas sync job — see
// ezone-server/services/easyGasCatalogSyncService.js's runFullSync.
export const catalogSyncAPI = {
  run:       () => catalogSyncService.run(),
  getStatus: () => catalogSyncService.getStatus(),
  verify:    (query) => catalogSyncService.verify(query),
};

// ── Reports (admin) ──────────────────────────────────────────────────────────
export const reportsAPI = {
  getTopInstallers:     (period, limit)     => reportsService.getTopInstallers(period, limit),
  getMonthlyActivity:   (year, employeeId)  => reportsService.getMonthlyActivity(year, employeeId),
  getProductsInstalled: (category)          => reportsService.getProductsInstalled(category),
  getBranchRanking:     (period)            => reportsService.getBranchRanking(period),
  getDashboardTotals:         ()                    => reportsService.getDashboardTotals(),
  getPointsLeaderboard:       (period, limit)       => reportsService.getPointsLeaderboard(period, limit),
  getTopWarehouses:           ()                    => reportsService.getTopWarehouses(),
  getRecentImports:           (limit)               => reportsService.getRecentImports(limit),
  getRecentWarrantyActivity:  (limit)               => reportsService.getRecentWarrantyActivity(limit),
  getRecentInventoryActivity: (limit)               => reportsService.getRecentInventoryActivity(limit),
  getInstallerStatistics:     (installerId)         => reportsService.getInstallerStatistics(installerId),
  getMyStatistics:            ()                    => reportsService.getMyStatistics(),
  getProductStatistics:       (productId)           => reportsService.getProductStatistics(productId),
  getWarehouseStatistics:     (branchId)             => reportsService.getWarehouseStatistics(branchId),
};

// ── Vehicle catalog (EasyGas-synced catalog; admin UI is read-only — same
// unused-but-wired reasoning as brandAPI above.) ─────────────────────────────
export const carAPI = {
  search:     (query)                => carsService.search(query),
  getAll:     (page, limit, search)  => carsService.getAll(page, limit, search),
  create:     (data)                 => carsService.create(data),
  update:     (carId, data)          => carsService.update(carId, data),
  activate:   (carId)                => carsService.activate(carId),
  deactivate: (carId)                => carsService.deactivate(carId),
  delete:     (carId)                => carsService.delete(carId),
};

// ── Inventory (admin) ─────────────────────────────────────────────────────
export const inventoryAPI = {
  getAll:              (page, limit, filters)                    => inventoryService.getAll(page, limit, filters),
  importCsv:           (productId, file, branchId)                => inventoryService.importCsv(productId, file, branchId),
  getImportBatches:    (page, limit)                             => inventoryService.getImportBatches(page, limit),
  getImportBatchDetail: (batchId)                                => inventoryService.getImportBatchDetail(batchId),
  validateBarcode:      (barcode, productId, equipmentType)      => inventoryService.validateBarcode(barcode, productId, equipmentType),
  changeStatus:         (itemId, fromStatus, toStatus, reason)   => inventoryService.changeStatus(itemId, fromStatus, toStatus, reason),
  transferBranch:       (itemId, branchId, reason)                => inventoryService.transferBranch(itemId, branchId, reason),
  correctBarcode:       (itemId, newBarcode, reason)              => inventoryService.correctBarcode(itemId, newBarcode, reason),
  mergeDuplicate:       (itemId, canonicalItemId, reason)         => inventoryService.mergeDuplicate(itemId, canonicalItemId, reason),
};

// ── Installer points ──────────────────────────────────────────────────────
export const pointsAPI = {
  getMine:            (page, limit)                     => pointsService.getMine(page, limit),
  getForInstaller:     (installerId, page, limit)        => pointsService.getForInstaller(installerId, page, limit),
  getProductConfigs:   (page, limit, search)             => pointsService.getProductConfigs(page, limit, search),
  setProductConfig:    (productId, points)               => pointsService.setProductConfig(productId, points),
  getEquipmentTypeConfigs: ()                            => pointsService.getEquipmentTypeConfigs(),
  setEquipmentTypeConfig: (equipmentType, points)        => pointsService.setEquipmentTypeConfig(equipmentType, points),
  createAdjustment:    (installerId, points, type, reason) => pointsService.createAdjustment(installerId, points, type, reason),
};

// ── CSV export (Phase 4 — streamed, distinct from exportAPI's XLSX) ─────────
export const exportCsvAPI = {
  inventory:            () => exportCsvService.inventory(),
  warranty:              (employeeId, search, verificationStatus) => exportCsvService.warranty(employeeId, search, verificationStatus),
  points:                () => exportCsvService.points(),
  reports:                () => exportCsvService.reports(),
  installerStatistics:    () => exportCsvService.installerStatistics(),
  productStatistics:      () => exportCsvService.productStatistics(),
  warehouseStatistics:    () => exportCsvService.warehouseStatistics(),
};

// Re-export the raw client for edge cases (not for general component use)
export { default as apiClient } from '../api/client';
