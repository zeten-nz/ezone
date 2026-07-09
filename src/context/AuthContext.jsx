import { createContext, useContext, useState, useEffect } from 'react';
import { getStoredAuth, setStoredAuth, clearStoredAuth } from '../utils/authStorage';
import { onUnauthorized } from '../utils/authEvents';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Token and user are always restored/updated together as one unit — see
  // src/utils/authStorage.js. A lazy initializer keeps this synchronous, so
  // there is no loading flash on refresh and no async rehydration race.
  const [auth, setAuth] = useState(() => ({ ...getStoredAuth(), logoutReason: null }));

  const login = (userData, authToken) => {
    setStoredAuth(userData, authToken);
    setAuth({ token: authToken, user: userData, logoutReason: null });
  };

  // `reason` is surfaced to ProtectedRoute -> Login so a forced logout (session
  // expired / unauthorized) can explain itself, instead of silently dropping
  // the user back on a blank login form. Absent for an explicit user logout.
  const logout = (reason = null) => {
    clearStoredAuth();
    setAuth({ token: null, user: null, logoutReason: reason });
  };

  // The axios client can't call useAuth() (it lives outside the React tree),
  // so a 401 there is signaled via this event instead of the client reaching
  // into storage/React state itself — keeps storage mutation in one place.
  useEffect(() => onUnauthorized(() => logout('expired')), []);

  return (
    <AuthContext.Provider
      value={{ user: auth.user, token: auth.token, logoutReason: auth.logoutReason, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
