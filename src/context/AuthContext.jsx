import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import authService from '../services/authService.js';

const AuthContext = createContext(null);
const USER_KEY = 'devdirectory_user';
const TOKEN_KEY = 'devdirectory_token';

const readInitialUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readInitialUser);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [loading, setLoading] = useState(true);

  // Validate session with backend on initial load
  useEffect(() => {
    let isMounted = true;
    const verifySession = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (!savedToken) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const verifiedUser = await authService.getCurrentUser();
        if (isMounted && verifiedUser) {
          setUser(verifiedUser);
          localStorage.setItem(USER_KEY, JSON.stringify(verifiedUser));
        }
      } catch (err) {
        // If session expired or invalid on server, clear credentials
        console.warn('Session verification failed:', err.message);
        if (isMounted) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setUser(null);
          setToken('');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    verifySession();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    try {
      const data = await authService.login(email, password);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw err;
    }
  }, []);

  const signup = useCallback(async (formData) => {
    try {
      const data = await authService.register(formData);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore network errors during logout
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setToken('');
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!user,
      loading,
      login,
      signup,
      logout,
    }),
    [user, token, loading, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
