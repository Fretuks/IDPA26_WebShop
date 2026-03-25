import { createContext, useContext, useMemo, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'webshop_token';
const USER_KEY = 'webshop_user';

const USER_ROLE = Object.freeze({
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN'
});

function readStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(readStoredUser);

  function persistSession(payload) {
    localStorage.setItem(TOKEN_KEY, payload.token);
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
    setToken(payload.token);
    setUser(payload.user);
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }

  async function login({ email, password }) {
    const payload = await api.login(email, password);
    persistSession(payload);
    return payload;
  }

  async function register(formData) {
    await api.register(formData);
    const payload = await api.login(formData.email, formData.password);
    persistSession(payload);
    return payload;
  }

  async function refreshUser() {
    const freshUser = await api.getMe();
    localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
    setUser(freshUser);
    return freshUser;
  }

  function updateStoredUser(nextUser) {
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }

  function hasRole(role) {
    return user?.role === role;
  }

  function hasAnyRole(roles) {
    return roles.includes(user?.role);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      roles: USER_ROLE,
      isAuthenticated: Boolean(token),
      hasRole,
      hasAnyRole,
      isAdmin: hasRole(USER_ROLE.ADMIN),
      login,
      logout: clearSession,
      register,
      refreshUser,
      setSession: persistSession,
      updateStoredUser
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
