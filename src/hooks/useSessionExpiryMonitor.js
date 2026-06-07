import { useEffect, useRef } from "react";
import { isTokenValid, getTokenTTL } from "../utils/tokenUtils";
import { userService } from "../services/userService";

const COOKIE_PROBE_INTERVAL_MS = 30_000;
const JWT_RECHECK_INTERVAL_MS = 15_000;

/**
 * Proactively detects expired sessions so the UI updates without waiting
 * for the next API failure. Handles both JWT tokens and cookie-managed sessions.
 */
export const useSessionExpiryMonitor = ({ token, user, onExpired, enabled = true }) => {
  const onExpiredRef = useRef(onExpired);
  onExpiredRef.current = onExpired;

  useEffect(() => {
    if (!enabled || !token || !user) return undefined;

    if (token !== "cookie-managed") {
      if (!isTokenValid(token)) {
        onExpiredRef.current();
        return undefined;
      }

      const ttlSeconds = getTokenTTL(token);
      let timeoutId;
      let intervalId;

      if (ttlSeconds > 0) {
        timeoutId = setTimeout(() => {
          if (!isTokenValid(token)) {
            onExpiredRef.current();
          }
        }, ttlSeconds * 1000 + 250);
      } else if (ttlSeconds <= 0) {
        onExpiredRef.current();
        return undefined;
      }

      intervalId = setInterval(() => {
        if (!isTokenValid(token)) {
          onExpiredRef.current();
        }
      }, JWT_RECHECK_INTERVAL_MS);

      return () => {
        clearTimeout(timeoutId);
        clearInterval(intervalId);
      };
    }

    const probeSession = async () => {
      try {
        const res = await userService.getProfile();
        if (!res.ok) {
          onExpiredRef.current();
        }
      } catch (err) {
        if (err?.status === 401 || err?.status === 403) {
          onExpiredRef.current();
        }
      }
    };

    const intervalId = setInterval(probeSession, COOKIE_PROBE_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        probeSession();
      }
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", probeSession);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", probeSession);
    };
  }, [token, user, enabled]);
};

export default useSessionExpiryMonitor;
