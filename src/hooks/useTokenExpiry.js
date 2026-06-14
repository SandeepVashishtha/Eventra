import { useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { isTokenValid, decodeTokenPayload } from "../utils/tokenUtils";
import { syncSecureStorage } from "../utils/secureStorage";

export function useTokenExpiry({ token, user, onExpired }) {
  const expiryToastShownRef = useRef(false);

  const clearExpiredSession = useCallback(() => {
    let hadPreviousSession = false;
    try { hadPreviousSession = !!syncSecureStorage.getItem("user"); } catch {}
    console.warn("[useTokenExpiry] Session expired. Clearing state.");
    onExpired();
    if (!hadPreviousSession) return;
    if (expiryToastShownRef.current) return;
    expiryToastShownRef.current = true;
    toast.info("Session expired. Please log in again.", {
      toastId: "session-expired",
      autoClose: 4000,
    });
    setTimeout(() => window.location.replace("/login"), 1500);
  }, [onExpired]);

  useEffect(() => {
    if (!token) return;
    expiryToastShownRef.current = false;

    let expSeconds;
    if (token === "cookie-managed") {
      expSeconds = user?.exp;
    } else {
      const payload = decodeTokenPayload(token);
      expSeconds = payload?.exp;
    }

    let timeoutId;
    // 🔥 CodeScene refactor: extracted to reduce the cyclomatic complexity
    // of the useTokenExpiry effect (was 18, threshold = 9).
    const armExpiryTimer = (expSecs) => {
      const MAX_TIMEOUT_MS = 2147483647; // 32-bit signed max (24.8 days)
      // 🔥 FIX: chain timers when the expiry is far in the future. Previously
      // the code clamped delayMs to MAX_TIMEOUT_MS and then forgot to re-arm,
      // so a 1-year token would fire the timer after 24.8 days, see the token
      // was still valid, do nothing, and the user would never be auto-logged-out.
      const stillOnToken = () =>
        token === "cookie-managed" ? Date.now() < expSecs * 1000 : isTokenValid(token);
      const scheduleSlice = (remainingMs) => {
        const clamped = Math.min(remainingMs, MAX_TIMEOUT_MS);
        timeoutId = setTimeout(() => {
          timeoutId = null;
          if (!isMountedRef.current) return;
          if (stillOnToken()) {
            // Re-arm for the next slice. If remainingMs was <= MAX_TIMEOUT_MS this
            // is a no-op; otherwise we chain another slice until expiry.
            scheduleSlice(Math.max(0, expSecs * 1000 - Date.now() - 1000));
          } else {
            clearExpiredSession();
          }
        }, clamped);
      };
      const initialDelay = Math.max(expSecs * 1000 - Date.now() + 1000, 0);
      if (initialDelay > 0) scheduleSlice(initialDelay);
    };

    const armPollingInterval = () => {
      timeoutId = setInterval(() => {
        if (!isTokenValid(token)) clearExpiredSession();
      }, 60_000);
      if (!isTokenValid(token)) clearExpiredSession();
    };

    if (typeof expSeconds === "number") {
      armExpiryTimer(expSeconds);
    } else if (token !== "cookie-managed") {
      armPollingInterval();
    }

    return () => {
      if (timeoutId) {
        if (typeof expSeconds === "number") clearTimeout(timeoutId);
        else clearInterval(timeoutId);
      }
    };
  }, [token, user?.exp, clearExpiredSession]);

  return { clearExpiredSession };
}
