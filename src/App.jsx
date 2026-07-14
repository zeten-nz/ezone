/**
 * APPLICATION ROOT
 *
 * Error Boundary architecture:
 *
 *   GlobalErrorBoundary          ← full-screen fallback, catches provider crashes
 *     Router
 *       Suspense                 ← spinner during lazy-chunk download
 *         per-route boundaries   ← inline fallback; a crash on one page
 *           Page component         never unmounts the rest of the app
 *
 * Each page element is wrapped in its own <ErrorBoundary inline> so a runtime
 * crash on /warranty-forms, for example, does NOT affect /dashboard.
 * When a boundary catches, the user sees a "Try Again / Home" card within
 * the viewport; they can navigate away via the browser's back button.
 *
 * API request failures are NOT handled here — they use page-level error
 * state + the ErrorState component, not ErrorBoundary.
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { SidebarProvider }  from './context/SidebarContext';
import ProtectedRoute       from './components/ProtectedRoute';
import ErrorBoundary        from './components/ErrorBoundary';
import { USER_ROLES }       from './config/constants';
import { getHomePath }      from './config/navigation';

// ── Lazy-loaded pages ─────────────────────────────────────────────────────────
const Login                         = lazy(() => import('./pages/Login'));
const Register                      = lazy(() => import('./pages/Register'));
const EmployeeWarrantyFormModern    = lazy(() => import('./pages/EmployeeWarrantyFormModern'));
const EmployeeWarrantyHistoryModern = lazy(() => import('./pages/EmployeeWarrantyHistoryModern'));
const EmployeeProfileModern         = lazy(() => import('./pages/EmployeeProfileModern'));
const AdminDashboardModern          = lazy(() => import('./pages/AdminDashboardModern'));
const AdminUsersModern              = lazy(() => import('./pages/AdminUsersModern'));
const AdminWarrantyFormsModern      = lazy(() => import('./pages/AdminWarrantyFormsModern'));
const AdminRegistrationRequestsModern = lazy(() => import('./pages/AdminRegistrationRequestsModern'));
const AdminBranchesModern           = lazy(() => import('./pages/AdminBranchesModern'));
const AdminProductsModern           = lazy(() => import('./pages/AdminProductsModern'));
const AdminReportsModern            = lazy(() => import('./pages/AdminReportsModern'));

// ── Page loading fallback ─────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-neutral-50">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-neutral-200 border-t-blue-600" />
  </div>
);

// The bare "/" path used to unconditionally <Navigate to="/login" /> without
// ever checking auth state — so a logged-in user landing on the root URL
// (e.g. a fresh tab) was sent to the login page regardless of having a valid
// session. This reads the real auth state and sends the user somewhere that
// actually reflects it.
const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={getHomePath(user.role)} replace />;
};

function App() {
  return (
    <ErrorBoundary name="GlobalBoundary">
      <LanguageProvider>
        <AuthProvider>
          <SidebarProvider>
            <Router>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public routes */}
                  <Route
                    path="/login"
                    element={
                      <ErrorBoundary name="LoginBoundary" inline>
                        <Login />
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <ErrorBoundary name="RegisterBoundary" inline>
                        <Register />
                      </ErrorBoundary>
                    }
                  />

                  {/* Employee routes */}
                  <Route element={<ProtectedRoute role={USER_ROLES.EMPLOYEE} />}>
                    <Route
                      path="/warranty-form"
                      element={
                        <ErrorBoundary name="WarrantyFormBoundary" inline>
                          <EmployeeWarrantyFormModern />
                        </ErrorBoundary>
                      }
                    />
                    <Route
                      path="/warranty-history"
                      element={
                        <ErrorBoundary name="WarrantyHistoryBoundary" inline>
                          <EmployeeWarrantyHistoryModern />
                        </ErrorBoundary>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ErrorBoundary name="ProfileBoundary" inline>
                          <EmployeeProfileModern />
                        </ErrorBoundary>
                      }
                    />
                  </Route>

                  {/* Admin routes */}
                  <Route element={<ProtectedRoute role={USER_ROLES.ADMIN} />}>
                    <Route
                      path="/dashboard"
                      element={
                        <ErrorBoundary name="DashboardBoundary" inline>
                          <AdminDashboardModern />
                        </ErrorBoundary>
                      }
                    />
                    <Route
                      path="/users"
                      element={
                        <ErrorBoundary name="UsersBoundary" inline>
                          <AdminUsersModern />
                        </ErrorBoundary>
                      }
                    />
                    <Route
                      path="/warranty-forms"
                      element={
                        <ErrorBoundary name="AdminWarrantyBoundary" inline>
                          <AdminWarrantyFormsModern />
                        </ErrorBoundary>
                      }
                    />
                    <Route
                      path="/admin/profile"
                      element={
                        <ErrorBoundary name="AdminProfileBoundary" inline>
                          <EmployeeProfileModern />
                        </ErrorBoundary>
                      }
                    />
                    <Route
                      path="/registration-requests"
                      element={
                        <ErrorBoundary name="RegistrationRequestsBoundary" inline>
                          <AdminRegistrationRequestsModern />
                        </ErrorBoundary>
                      }
                    />
                    <Route
                      path="/branches"
                      element={
                        <ErrorBoundary name="BranchesBoundary" inline>
                          <AdminBranchesModern />
                        </ErrorBoundary>
                      }
                    />
                    <Route
                      path="/products"
                      element={
                        <ErrorBoundary name="ProductsBoundary" inline>
                          <AdminProductsModern />
                        </ErrorBoundary>
                      }
                    />
                    <Route
                      path="/reports"
                      element={
                        <ErrorBoundary name="ReportsBoundary" inline>
                          <AdminReportsModern />
                        </ErrorBoundary>
                      }
                    />
                  </Route>

                  {/* Root path — must check auth state, not hardcode /login (see RootRedirect above) */}
                  <Route path="/" element={<RootRedirect />} />
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
