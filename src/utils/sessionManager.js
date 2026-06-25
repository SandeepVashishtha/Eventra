/**
 * sessionManager.js
 * Ensures complete session invalidation on logout.
 * Clears all auth tokens, cached data, and redirects to login.
 */

import { deleteAllCookies } from "./cookieUtils.js";

const SESSION_KEYS = [
  "token",
  "user",
  "authToken",
  "refreshToken",
  "session",
  "eventra_user",
  "eventra_token",
  "anonymous_user",
  "eventra_auth_attempts",
  "eventra_form_retry_queue",
];

const CACHE_KEYS_PREFIX = ["eventra_", "events_", "hackathon_"];

export const clearAuthStorage = () => {
  try {
    // Clear known session keys
    SESSION_KEYS.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    // Clear any eventra-prefixed cache keys
    const allLocalKeys = Object.keys(localStorage);
    allLocalKeys.forEach((key) => {
      if (CACHE_KEYS_PREFIX.some((prefix) => key.startsWith(prefix))) {
        localStorage.removeItem(key);
      }
    });

    const allSessionKeys = Object.keys(sessionStorage);
    allSessionKeys.forEach((key) => {
      if (CACHE_KEYS_PREFIX.some((prefix) => key.startsWith(prefix))) {
        sessionStorage.removeItem(key);
      }
    });

    return true;
  } catch {
    return false;
  }
};

export const clearAuthCookies = () => {
  return deleteAllCookies();
};

export const invalidateSession = async () => {
  try {
    // Notify backend to invalidate server-side session
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    }).catch(() => {
      // Silently fail if backend is unreachable — still clear client state
    });
  } finally {
    clearAuthStorage();
    clearAuthCookies();

    // Clear service worker caches for sensitive data
    if ("caches" in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      } catch {}
    }
  }
};

export const isSessionValid = () => {
  try {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("eventra_token") ||
      sessionStorage.getItem("token");

    if (!token) return false;

    // Basic JWT expiry check
    const parts = token.split(".");
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        clearAuthStorage();
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
};
