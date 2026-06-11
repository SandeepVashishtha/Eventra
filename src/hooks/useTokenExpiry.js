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
    if (typeof expSeconds === "number") {
      const delayMs = Math.max(expSeconds * 1000 - Date.now() + 1000, 0);
      timeoutId = setTimeout(() => {
        if (token === "cookie-managed" ? Date.now() >= expSeconds * 1000 : !isTokenValid(token)) {
          clearExpiredSession();
        }
      }, delayMs);
    } else if (token !== "cookie-managed") {
      timeoutId = setInterval(() => {
        if (!isTokenValid(token)) clearExpiredSession();
      }, 60_000);
      if (!isTokenValid(token)) clearExpiredSession();
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
