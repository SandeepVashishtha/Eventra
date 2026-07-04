import { useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { isTokenValid, decodeTokenPayload } from "../utils/tokenUtils";
import { syncSecureStorage } from "../utils/secureStorage";

export const MAX_TOKEN_EXPIRY_TIMEOUT_MS = 2_147_483_647;
const TOKEN_EXPIRY_BUFFER_MS = 1_000;

export function getTokenExpiryDelayMs(expSeconds, nowMs = Date.now()) {
  return Math.max(expSeconds * 1000 - nowMs + TOKEN_EXPIRY_BUFFER_MS, 0);
}

export function getSafeTokenExpiryDelayMs(expSeconds, nowMs = Date.now()) {
  return Math.min(
    getTokenExpiryDelayMs(expSeconds, nowMs),
    MAX_TOKEN_EXPIRY_TIMEOUT_MS
  );
}

export function useTokenExpiry({ token, user, onExpired }) {
  const expiryToastShownRef = useRef(false);

  const clearExpiredSession = useCallback(() => {
    // Guard: window is only available in browser environments.
    if (typeof window === "undefined") return;

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
    setTimeout(() => {
      if (typeof window !== "undefined") window.location.replace("/login");
    }, 1500);
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
    let cancelled = false;

    if (typeof expSeconds === "number") {
      const scheduleExpiryCheck = () => {
        const delayMs = getSafeTokenExpiryDelayMs(expSeconds);

        timeoutId = setTimeout(() => {
          if (cancelled) return;

          if (token === "cookie-managed" ? Date.now() >= expSeconds * 1000 : !isTokenValid(token)) {
            clearExpiredSession();
            return;
          }

          scheduleExpiryCheck();
        }, delayMs);
      };

      scheduleExpiryCheck();
    } else if (token !== "cookie-managed") {
      timeoutId = setInterval(() => {
        if (!isTokenValid(token)) {
          clearExpiredSession();
        }
      }, 60_000);
      if (!isTokenValid(token)) clearExpiredSession();
    }

    return () => {
      cancelled = true;
      if (timeoutId) {
        if (typeof expSeconds === "number") clearTimeout(timeoutId);
        else clearInterval(timeoutId);
      }
    };
  }, [token, user?.exp, clearExpiredSession]);

  return { clearExpiredSession };
}
