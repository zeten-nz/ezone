import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ role }) => {
  const { user, logoutReason } = useAuth();

  if (!user) {
    // React Router's `state` is persisted via the browser History API, which
    // structured-clones it — only serializable primitives may ever go in
    // here. `logoutReason` should always be a string or null (see
    // AuthContext.logout's signature), but this guard is what actually
    // prevents a non-serializable value (e.g. a SyntheticEvent leaked in by
    // a `onClick={logout}`-style call-site bug) from ever reaching Navigate.
    const state = typeof logoutReason === 'string' ? { reason: logoutReason } : undefined;
    return <Navigate to="/login" replace state={state} />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
