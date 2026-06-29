/**
 * APPLICATION ROOT
 *
 * Production improvements applied here:
 *
 *  1. LAZY LOADING — Each page is loaded with React.lazy so Vite splits it
 *     into its own chunk. The browser downloads only the code for the current
 *     page, not the entire app bundle. Tesseract.js (scanner) is especially
 *     heavy (~5 MB) and was always downloaded on every page — now it loads
 *     only when the employee visits the warranty form.
 *
 *  2. SUSPENSE — Wraps the lazy pages with a spinner fallback so there is
 *     a visible loading state during chunk download instead of a blank screen.
 *
 *  3. ERROR BOUNDARY — Catches any runtime error thrown by any page component
 *     and renders a user-friendly fallback instead of a white screen of death.
 *
 *  4. ROLE CONSTANTS — Role strings come from USER_ROLES constants, not magic
 *     string literals, so a typo won't silently break auth.
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }     from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { SidebarProvider }  from './context/SidebarContext';
import ProtectedRoute       from './components/ProtectedRoute';
import ErrorBoundary        from './components/ErrorBoundary';
import { USER_ROLES }       from './config/constants';

// ── Lazy-loaded pages ─────────────────────────────────────────────────────────
// Each import() becomes a separate Vite chunk — downloaded on demand.
const Login                    = lazy(() => import('./pages/Login'));
const EmployeeWarrantyFormModern = lazy(() => import('./pages/EmployeeWarrantyFormModern'));
const EmployeeProfileModern    = lazy(() => import('./pages/EmployeeProfileModern'));
const AdminDashboardModern     = lazy(() => import('./pages/AdminDashboardModern'));
const AdminUsersModern         = lazy(() => import('./pages/AdminUsersModern'));
const AdminWarrantyFormsModern = lazy(() => import('./pages/AdminWarrantyFormsModern'));

// ── Page loading fallback ─────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-neutral-50">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-neutral-200 border-t-blue-600" />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <SidebarProvider>
            <Router>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/login" element={<Login />} />

                  {/* Employee routes */}
                  <Route element={<ProtectedRoute role={USER_ROLES.EMPLOYEE} />}>
                    <Route path="/warranty-form" element={<EmployeeWarrantyFormModern />} />
                    <Route path="/profile"       element={<EmployeeProfileModern />} />
                  </Route>

                  {/* Admin routes */}
                  <Route element={<ProtectedRoute role={USER_ROLES.ADMIN} />}>
                    <Route path="/dashboard"      element={<AdminDashboardModern />} />
                    <Route path="/users"          element={<AdminUsersModern />} />
                    <Route path="/warranty-forms" element={<AdminWarrantyFormsModern />} />
                    <Route path="/admin/profile"  element={<EmployeeProfileModern />} />
                  </Route>

                  {/* Default redirect */}
                  <Route path="/" element={<Navigate to="/login" replace />} />
                </Routes>
              </Suspense>
            </Router>
          </SidebarProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
