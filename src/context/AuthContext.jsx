import { createContext, useContext, useState } from 'react';
import { STORAGE_KEYS } from '../config/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Lazy initializers run once on mount — reading localStorage here avoids
  // the setToken/setUser-in-useEffect anti-pattern and removes the async
  // loading phase entirely (localStorage is synchronous).
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.TOKEN) || null);
  const [user, setUser]   = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      localStorage.removeItem(STORAGE_KEYS.USER);
      return null;
    }
  });
  const [loading] = useState(false);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem(STORAGE_KEYS.TOKEN, authToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
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
