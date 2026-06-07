/**
 * @fileoverview Theme sync utilities for cross-device theme persistence (#7653)
 *
 * Provides:
 *  - `syncThemeToProfile` — fire-and-forget PATCH to PUT /api/users/preferences
 *  - `getProfileTheme`    — safely reads theme from a user profile object
 *
 * Design decisions:
 *  - All network calls are non-blocking (fire-and-forget). The UI toggle
 *    remains instant; the PATCH happens in the background.
 *  - Failures are swallowed silently so the user experience is never degraded
 *    by backend unavailability (offline support).
 *  - Only "light" | "dark" | "system" are valid values — any other value from
 *    the profile is ignored and the localStorage/system fallback is used.
 */

import { apiUtils, API_ENDPOINTS } from "../config/api";

/** The set of valid theme values this app supports. */
const VALID_THEMES = new Set(["light", "dark", "system"]);

/**
 * Validate that a value is a supported theme string.
 *
 * @param {unknown} value
 * @returns {value is "light" | "dark" | "system"}
 */
export const isValidTheme = (value) => VALID_THEMES.has(value);

/**
 * Safely extract the theme preference from a user profile object returned
 * by `validateSession()` / `useAuth().user`.
 *
 * The backend may return `user.preferences.theme` or nothing at all.
 * Returns null when the profile contains no valid theme so the caller can
 * fall back to localStorage.
 *
 * @param {object | null | undefined} user - Authenticated user object
 * @returns {"light" | "dark" | "system" | null}
 */
export const getProfileTheme = (user) => {
  const theme = user?.preferences?.theme;
  return isValidTheme(theme) ? theme : null;
};

/**
 * Fire-and-forget: persist the new theme to the user's profile via
 * PUT /api/users/preferences.
 *
 * Intentionally does NOT return a Promise the caller needs to await.
 * The UI toggle has already applied locally; this call runs in the
 * background and its success or failure is transparent to the user.
 *
 * Silent failure modes (all non-fatal):
 *  - Network offline
 *  - 4xx/5xx from backend
 *  - Not authenticated (unauthenticated users have no profile to sync)
 *
 * @param {"light" | "dark" | "system"} theme - The new theme value
 * @param {boolean} [isAuthenticated=false] - Whether a user is logged in
 */
export const syncThemeToProfile = (theme, isAuthenticated = false) => {
  if (!isAuthenticated) return;
  if (!isValidTheme(theme)) return;

  // Intentional: no await, no catch re-throw — true fire-and-forget
  apiUtils
    .put(API_ENDPOINTS.USERS.PREFERENCES, { preferences: { theme } })
    .catch(() => {
      // Non-fatal: localStorage already has the correct value.
      // The next successful PUT will eventually reconcile the profile.
    });
};
