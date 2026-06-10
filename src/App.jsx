import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import EmployeeWarrantyFormModern from './pages/EmployeeWarrantyFormModern';
import EmployeeProfileModern from './pages/EmployeeProfileModern';
import AdminDashboardModern from './pages/AdminDashboardModern';
import AdminUsersModern from './pages/AdminUsersModern';
import AdminWarrantyFormsModern from './pages/AdminWarrantyFormsModern';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { SidebarProvider } from './context/SidebarContext';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <SidebarProvider>
          <Router>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute role="EMPLOYEE" />}>
              <Route path="/warranty-form" element={<EmployeeWarrantyFormModern />} />
              <Route path="/profile" element={<EmployeeProfileModern />} />
            </Route>

            <Route element={<ProtectedRoute role="ADMIN" />}>
              <Route path="/dashboard" element={<AdminDashboardModern />} />
              <Route path="/users" element={<AdminUsersModern />} />
              <Route path="/warranty-forms" element={<AdminWarrantyFormsModern />} />
              <Route path="/admin/profile" element={<EmployeeProfileModern />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
        </SidebarProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
