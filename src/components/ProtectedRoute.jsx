import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ role }) => {
  const { user, logoutReason } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace state={logoutReason ? { reason: logoutReason } : undefined} />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
