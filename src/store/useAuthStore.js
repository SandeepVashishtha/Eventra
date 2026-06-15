import { create } from "zustand";
import { apiUtils, API_ENDPOINTS } from "../config/api";
import { logger } from "../utils/logger";
import inMemoryTokenStore from "../utils/httpOnlyStorage";

/**
 * useAuthStore
 *
 * Zustand store for auth state.
 *
 * Security: JWT tokens are held in memory only via `inMemoryTokenStore`.
 * They are never written to localStorage, sessionStorage, or any JS-readable
 * cookie. See `src/utils/httpOnlyStorage.js` for the full security rationale.
 *
 * NOTE: This store is a supplementary layer. The primary authentication flow
 * runs through `AuthContext` (HttpOnly cookie + `withCredentials: true`).
 * This store exists for selector-based subscriptions in components that need
 * fine-grained re-render control without subscribing to the full context.
 */
export const useAuthStore = create((set) => ({
  user: null,
  // Token lives in memory, not in store state, to prevent it from being
  // serialised by React DevTools, Redux DevTools, or any storage middleware.
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiUtils.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
      const { user, token } = response.data;

      // Store token in memory only — never in Web Storage.
      inMemoryTokenStore.setToken(token);

      set({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  logout: () => {
    // Clear the in-memory token immediately.
    inMemoryTokenStore.clearToken();
    set({ user: null, isAuthenticated: false });
    logger.info("User logged out");
  },

  updateProfile: (userData) => {
    set((state) => ({
      user: { ...state.user, ...userData },
    }));
  },

  /**
   * Sets the token in memory and marks the store as authenticated.
   * Does NOT write to any persistent storage.
   *
   * @param {string} token
   */
  setToken: (token) => {
    inMemoryTokenStore.setToken(token);
    set({ isAuthenticated: !!token });
  },
}));
