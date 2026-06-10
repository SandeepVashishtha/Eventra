import { create } from "zustand";

let warned = false;

/**
 * useAuthStore — DEPRECATED
 * 
 * This store previously persisted JWTs in localStorage, creating a critical
 * security vulnerability (XSS token theft) and a parallel auth state that
 * never synced with the canonical AuthContext.
 * 
 * Use `useAuth` from `src/context/AuthContext.js` instead.
 */
export const useAuthStore = create(() => ({
  get user() {
    if (!warned) {
      console.warn("[useAuthStore] Deprecated — use useAuth() from AuthContext instead");
      warned = true;
    }
    return null;
  },
  get token() { return null; },
  get isAuthenticated() { return false; },
  get isLoading() { return false; },
  get error() { return null; },
}));
