import { createContext, useContext, useEffect, useMemo, useCallback, useRef, useState } from "react";
import { setOnUnauthorizedHandler, setRequiresReauthHandler, setAuthToken, apiUtils } from "../config/api.js";
import { authService } from "../services/authService.js";
import { syncSecureStorage } from "../utils/secureStorage.js";
import { usePermissions, normalizeRoles } from "../hooks/usePermissions.js";
import { useTokenExpiry } from "../hooks/useTokenExpiry.js";
import { isTokenValid } from "../utils/tokenUtils.js";
import { toast } from "react-toastify";
import { ROLES, ROLE_PERMISSIONS } from "../config/roles.js";
import { getSessionChannel, closeSessionChannel, SESSION_TERMINATED, broadcastSessionTerminated } from "../utils/sessionBroadcast.js";
import { deleteCookie, setCookie } from "../utils/cookieUtils.js";
import ReAuthModal from "../components/auth/ReAuthModal";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (typeof globalThis !== "undefined" && typeof globalThis.mockAuth === "function") {
    return globalThis.mockAuth();
  }
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const extractSession = (data, fallbackEmail) => {
  const rawUser = data?.user ?? data?.data ?? data ?? null;
  const rawRoles = rawUser?.roles ?? (rawUser?.role ? [rawUser.role] : []);
  const resolvedRoles = normalizeRoles(rawRoles);

  const tokenPermissions = Array.isArray(rawUser?.permissions)
    ? rawUser.permissions.map((p) => String(p))
    : [];
  const rolePermissions = resolvedRoles.flatMap((role) => ROLE_PERMISSIONS[role] || []);
  const permissions = Array.from(new Set([...tokenPermissions, ...rolePermissions]));

  const scopes =
    rawUser?.scopes ??
    (resolvedRoles.includes(ROLES.SUPER_ADMIN) || resolvedRoles.includes(ROLES.ADMIN)
      ? ["admin:all", "event:write", "event:read", "hackathon:write", "hackathon:read"]
      : resolvedRoles.includes(ROLES.ORGANIZER)
        ? ["event:write", "event:read", "hackathon:write", "hackathon:read"]
        : ["event:read", "hackathon:read"]);

  const sessionUser = {
    ...(rawUser || {}),
    firstName: rawUser?.firstName ?? "",
    lastName: rawUser?.lastName ?? "",
    email: rawUser?.email ?? fallbackEmail ?? "",
    username: rawUser?.username ?? fallbackEmail ?? "",
    role: rawUser?.role ?? resolvedRoles[0] ?? "",
    roles: resolvedRoles,
    permissions,
    scopes,
  };

  return { sessionUser };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authRequest, setAuthRequest] = useState({ loading: false, error: null });
  const [requiresReauth, setRequiresReauth] = useState(false);

  const isMountedRef = useRef(true);
  const expiryToastShownRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const clearSession = useCallback(() => {
    if (!isMountedRef.current) return false;
    setUser(null);
    setToken(null);
    setAuthToken(null);

    deleteCookie("token", { path: "/", secureVariants: true });
    syncSecureStorage.removeItem("user");
    return true;
  }, []);

  const clearSessionRef = useRef(null);
  useEffect(() => {
    clearSessionRef.current = clearSession;
  }, [clearSession]);

  useEffect(() => {
    const channel = getSessionChannel();
    if (!channel) return;

    const handleMessage = (event) => {
      if (event.data?.type === SESSION_TERMINATED) {
        clearSessionRef.current?.();
        window.location.replace("/login");
      }
    };

    channel.addEventListener("message", handleMessage);

    return () => {
      channel.removeEventListener("message", handleMessage);
      closeSessionChannel();
    };
  }, []);

  useTokenExpiry({ token, user, onExpired: clearSession });

  const clearExpiredSession = useCallback(() => {
    let hadPreviousSession = false;
    try {
      hadPreviousSession = !!syncSecureStorage.getItem("user");
    } catch (e) {
      console.warn("[AuthContext] Failed to read from secure storage during expiry check", e);
    }

    clearSession();

    if (!hadPreviousSession || expiryToastShownRef.current) return;
    expiryToastShownRef.current = true;
    toast.info(
      "Security notice: Your session has expired. Please log in again to continue securely.",
      { toastId: "session-expired", autoClose: 5000 }
    );

    setTimeout(() => {
      window.location.replace("/login");
    }, 1500);
  }, [clearSession]);

  useEffect(() => {
    const validate = async () => {
      try {
        const res = await apiUtils.get("/users/profile");
        if (!isMountedRef.current) return;

        if (res.ok && res.data) {
          const { sessionUser } = extractSession(res.data, null);
          if (!isMountedRef.current) return;
          setToken("cookie-managed");
          setUser(sessionUser);
        } else {
          clearSession();
        }
      } catch (err) {
        if (!isMountedRef.current) return;

        if (err?.status === 401 || err?.status === 403) {
          clearSession();
        } else {
          try {
            const cachedUser = await syncSecureStorage.getItemAsync("user");
            if (cachedUser) {
              setUser(JSON.parse(cachedUser));
              const cookieToken = document.cookie
                .split("; ")
                .find((row) => row.startsWith("token="))
                ?.split("=")[1];
              setToken(cookieToken || "cookie-managed");
            } else {
              clearSession();
            }
          } catch (storageErr) {
            console.error("[AuthContext] Secure storage fallback read failure:", storageErr);
            clearSession();
          }
        }
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    };

    validate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearExpiredSessionRef = useRef(clearExpiredSession);
  useEffect(() => {
    clearExpiredSessionRef.current = clearExpiredSession;
  }, [clearExpiredSession]);

  useEffect(() => {
    setOnUnauthorizedHandler(() => clearExpiredSessionRef.current());
    setRequiresReauthHandler(() => {
      setRequiresReauth(true);
    });
    return () => {
      setOnUnauthorizedHandler(null);
      setRequiresReauthHandler(null);
    };
  }, []);

  useEffect(() => {
    if (!token || token === "cookie-managed") return;
    expiryToastShownRef.current = false;

    const expSeconds = user?.exp;
    let timerId;

    if (typeof expSeconds === "number") {
      const msUntilExpiry = expSeconds * 1000 - Date.now() + 1000;
      timerId = setTimeout(() => {
        clearExpiredSession();
      }, Math.max(msUntilExpiry, 0));
    } else {
      timerId = setInterval(() => {
        if (!isTokenValid(token)) clearExpiredSession();
      }, 60000);
    }

    return () => {
      if (typeof expSeconds === "number") {
        clearTimeout(timerId);
      } else {
        clearInterval(timerId);
      }
    };
  }, [token, user?.exp, clearExpiredSession]);

  const persistSession = useCallback(async (sessionToken, sessionUser) => {
    setToken(sessionToken);
    setUser(sessionUser);
    setAuthToken(sessionToken);

    try {
      if (sessionToken && sessionToken !== "cookie-managed") {
        setCookie("token", sessionToken, {
          path: "/",
          secure: window.location.protocol === "https:",
        });
      }
    } catch (err) {
      console.warn("[AuthContext] Failed to write cookie:", err);
    }

    try {
      const { roles, permissions: perms, scopes, ...display } = sessionUser;
      await syncSecureStorage.setItem("user", JSON.stringify(display));
    } catch (error) {
      console.error("[AuthContext] Error persisting user profile safely:", error);
    }
    return true;
  }, []);

  const setAuthSession = useCallback(
    (sessionToken, sessionUser) => persistSession(sessionToken, sessionUser),
    [persistSession]
  );

  const getAuthErrorMessage = (error, fallbackMessage) => {
    const status = error?.status || error?.response?.status;
    if (status >= 500) {
      return "Something went wrong on our end. Please try again shortly.";
    }
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      fallbackMessage
    );
  };

  const login = useCallback(
    async (usernameOrEmail, password) => {
      setAuthRequest({ loading: true, error: null });

      try {
        const res = await authService.login({ usernameOrEmail, password });
        const data = res.data;
        const { sessionUser } = extractSession(data, usernameOrEmail);
        const tokenValue = data?.token || data?.data?.token || "cookie-managed";
        const persisted = await persistSession(tokenValue, sessionUser);
        if (!persisted) return false;

        setAuthRequest({ loading: false, error: null });
        return true;
      } catch (error) {
        if (!isMountedRef.current) return false;
        deleteCookie("token", { path: "/", secureVariants: true });

        const status = error?.status || error?.response?.status;
        if (status >= 500) {
          setAuthRequest({ loading: false, error: null });
          throw error;
        }

        setAuthRequest({
          loading: false,
          error: getAuthErrorMessage(error, "Login failed. Please try again."),
        });
        return false;
      }
    },
    [persistSession]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn("[AuthContext] Backend logout request failed (best-effort error):", error);
    }
    clearSession();
    broadcastSessionTerminated();
    setAuthRequest({ loading: false, error: null });
  }, [clearSession]);

  const isAuthenticated = useCallback(() => {
    if (!user || !token) return false;
    if (token === "cookie-managed") {
      if (typeof user.exp === "number" && Date.now() >= user.exp * 1000) {
        clearExpiredSession();
        return false;
      }
    } else if (!isTokenValid(token)) {
      clearExpiredSession();
      return false;
    }
    return true;
  }, [user, token, clearExpiredSession]);

  const permissions = usePermissions(user);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      authRequest,
      requiresReauth,
      setRequiresReauth,
      login,
      logout,
      setAuthSession,
      setUser,
      isAuthenticated,
      ...permissions,
    }),
    [
      user,
      token,
      loading,
      authRequest,
      requiresReauth,
      setRequiresReauth,
      login,
      logout,
      setAuthSession,
      setUser,
      isAuthenticated,
      permissions,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {requiresReauth && <ReAuthModal onSuccess={() => setRequiresReauth(false)} />}
    </AuthContext.Provider>
  );
};