import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authService } from "../services/authService";
import { logger } from "../utils/logger";

/**
 * useAuthStore
 * 
 * Migration from AuthContext to Zustand for better performance and 
 * selector-based subscriptions.
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: localStorage.getItem("token") || null,
      isAuthenticated: !!localStorage.getItem("token"),
      isLoading: false,
      error: null,

      // Actions
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login({ email, password });
          const { user, token } = response.data;
          
          localStorage.setItem("token", token);
          set({ user, token, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || "Login failed";
          set({ error: message, isLoading: false });
          return { success: false, message };
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null, isAuthenticated: false });
        logger.info("User logged out");
      },

      updateProfile: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData }
        }));
      },

      setToken: (token) => {
        localStorage.setItem("token", token);
        set({ token, isAuthenticated: !!token });
      },
    }),
    {
      name: "eventra-auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
