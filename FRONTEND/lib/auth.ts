/**
 * Auth storage helper
 * Uses localStorage for client-side SPA token management.
 * Why localStorage?
 * 1. Simplicity & consistency: directly readable in Axios request interceptors without complex cookie parsing.
 * 2. Standard for REST API Bearer token architecture.
 * 3. Does not suffer from cross-domain cookie restrictions (SameSite/Secure) in decoupled local dev (FE:3000, BE:8000).
 */

const TOKEN_KEY = "lms_auth_token";
const USER_KEY = "lms_auth_user";

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
};

export const getUser = <T = unknown>(): T | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const setUser = (user: unknown): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuth = (): void => {
  removeToken();
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_KEY);
};
