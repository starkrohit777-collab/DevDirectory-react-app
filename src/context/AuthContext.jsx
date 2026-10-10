import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const AuthContext = createContext(null);
const KEY = 'devdirectory_user';
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(read);

  const login = useCallback((payload) => {
    const u = { ...payload, token: 'mock-token-' + Date.now() };
    localStorage.setItem(KEY, JSON.stringify(u));
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(KEY);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, isAuthenticated: !!user, login, logout }), [user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
