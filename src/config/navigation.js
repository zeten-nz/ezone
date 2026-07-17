import { LayoutDashboard, FileText, Users, FilePlus2, History, UserCog, ClipboardList, Building2, Package, Boxes, BarChart3, Coins, Award, Warehouse, TrendingUp } from 'lucide-react';
import { USER_ROLES } from './constants';

/**
 * Single source of truth for role-based navigation — consumed by Sidebar
 * (menu), Navbar (breadcrumb label lookup), and the header's quick-jump
 * search, so all three always agree on what pages exist and what they're called.
 */
export const ADMIN_NAV_ITEMS = [
  { labelKey: 'dashboard', path: '/dashboard', icon: LayoutDashboard },
  { labelKey: 'warrantyForms', path: '/warranty-forms', icon: FileText },
  { labelKey: 'users', path: '/users', icon: Users },
  { labelKey: 'registrationRequests', path: '/registration-requests', icon: ClipboardList },
  { labelKey: 'branches', path: '/branches', icon: Building2 },
  { labelKey: 'products', path: '/products', icon: Package },
  { labelKey: 'inventory', path: '/inventory', icon: Boxes },
  { labelKey: 'installerPoints', path: '/installer-points', icon: Award },
  { labelKey: 'pointsConfig', path: '/points-config', icon: Coins },
  { labelKey: 'reports', path: '/reports', icon: BarChart3 },
  { labelKey: 'installerStatistics', path: '/installer-statistics', icon: TrendingUp },
  { labelKey: 'productStatistics', path: '/product-statistics', icon: Package },
  { labelKey: 'warehouseStatistics', path: '/warehouse-statistics', icon: Warehouse },
];

export const EMPLOYEE_NAV_ITEMS = [
  { labelKey: 'warrantyForm', path: '/warranty-form', icon: FilePlus2 },
  { labelKey: 'navWarrantyHistory', path: '/warranty-history', icon: History },
  { labelKey: 'myPoints', path: '/my-points', icon: Award },
  { labelKey: 'myStatistics', path: '/my-statistics', icon: TrendingUp },
  { labelKey: 'profile', path: '/profile', icon: UserCog },
];

export function getNavItems(role) {
  return role === USER_ROLES.ADMIN ? ADMIN_NAV_ITEMS : EMPLOYEE_NAV_ITEMS;
}

export function getProfilePath(role) {
  return role === USER_ROLES.ADMIN ? '/admin/profile' : '/profile';
}

/** The landing page for an authenticated user of this role — used by the root route and the header breadcrumb's Home link. */
export function getHomePath(role) {
  return role === USER_ROLES.ADMIN ? '/dashboard' : '/warranty-form';
}

/** Pages reachable by the given role, including profile — used for the breadcrumb label lookup and the quick-jump search. */
export function getReachablePages(role) {
  return [...getNavItems(role), { labelKey: 'profile', path: getProfilePath(role), icon: UserCog }];
}
