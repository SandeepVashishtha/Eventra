import { createContext, useContext, useEffect, useMemo, useCallback, useRef, useState } from "react";
import { setOnUnauthorizedHandler, setAuthToken } from "../config/api";
import { authService } from "../services/authService";
import { userService } from "../services/userService";
import { syncSecureStorage } from "../utils/secureStorage";
import { usePermissions } from "../hooks/usePermissions";
import { useTokenExpiry } from "../hooks/useTokenExpiry";
import { isTokenValid } from "../utils/tokenUtils";
import { toast } from "react-toastify";
import { normalizeRoles } from "../hooks/usePermissions";
import { ROLES, ROLE_PERMISSIONS } from "../config/roles";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
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
  const isMountedRef = useRef(true);

  const isMountedRef = useRef(true);
  const expiryToastShownRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const clearSession = useCallback(() => {
    if (!isMountedRef.current) return false;
    setUser(null);
    setToken(null);
    setAuthToken(null);
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; SameSite=Strict";
    syncSecureStorage.removeItem("user");
    return true;
  }, []);

  const { clearExpiredSession } = useTokenExpiry({ token, user, onExpired: clearSession });
  const permissions = usePermissions(user);

  const normalizeRoles = useCallback((roles = []) =>
    roles.map((r) => {
      const n = String(r).toUpperCase();
      return n === "EVENT_MANAGER" ? ROLES.ORGANIZER : n;
    }), []);

  const extractSession = useCallback((res, data, fallbackEmail) => {
    const sessionToken = "cookie-managed";
    const rawUser = data?.user ?? data?.data ?? data ?? null;
    const rawRoles = rawUser?.roles ?? (rawUser?.role ? [rawUser.role] : []);
    const resolvedRoles = normalizeRoles(rawRoles);
    const tokenPermissions = Array.isArray(rawUser?.permissions)
      ? rawUser.permissions.map(String) : [];
    const rolePermissions = resolvedRoles.flatMap((role) => ROLE_PERMISSIONS[role] || []);
    const perms = Array.from(new Set([...tokenPermissions, ...rolePermissions]));
    const scopes = rawUser?.scopes ?? (
      resolvedRoles.includes(ROLES.SUPER_ADMIN) || resolvedRoles.includes(ROLES.ADMIN)
        ? ["admin:all", "event:write", "event:read", "hackathon:write", "hackathon:read"]
        : resolvedRoles.includes(ROLES.ORGANIZER)
          ? ["event:write", "event:read", "hackathon:write", "hackathon:read"]
          : ["event:read", "hackathon:read"]
    );
    return {
      sessionToken,
      sessionUser: {
        ...(rawUser || {}),
        firstName: rawUser?.firstName ?? "",
        lastName: rawUser?.lastName ?? "",
        email: rawUser?.email ?? fallbackEmail ?? "",
        username: rawUser?.username ?? fallbackEmail ?? "",
        role: rawUser?.role ?? resolvedRoles[0] ?? "",
        roles: resolvedRoles,
        permissions: perms,
        scopes,
      },
    };
  }, [normalizeRoles]);
  const clearExpiredSession = useCallback(() => {
    let hadPreviousSession = false;
    try {
      hadPreviousSession = !!syncSecureStorage.getItem("user");
    } catch {}
    clearSession();
    if (!hadPreviousSession || expiryToastShownRef.current) return;
    expiryToastShownRef.current = true;
    toast.info("Session expired. Please log in again.", {
      toastId: "session-expired",
      autoClose: 4000,
    });
    setTimeout(() => window.location.replace("/login"), 1500);
  }, [clearSession]);

  useEffect(() => {
    const validate = async () => {
      try {
        const res = await userService.getProfile();
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
            const cachedUser = syncSecureStorage.getItem("user");
            if (cachedUser) {
              setUser(JSON.parse(cachedUser));
              setToken("cookie-managed");
            } else {
              clearSession();
            }
          } catch { clearSession(); }
        }
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    };
    validate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
    validateSession();
  }, [clearSession]);

  const clearExpiredSessionRef = useRef(clearExpiredSession);
  useEffect(() => { clearExpiredSessionRef.current = clearExpiredSession; }, [clearExpiredSession]);
  useEffect(() => {
    setOnUnauthorizedHandler(() => clearExpiredSessionRef.current());
    return () => setOnUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    if (!token || token === "cookie-managed") return;
    expiryToastShownRef.current = false;
    const expSeconds = token === "cookie-managed" ? user?.exp : decodeTokenPayload(token)?.exp;
    let id;
    if (typeof expSeconds === "number") {
      id = setTimeout(() => { clearExpiredSession(); },
        Math.max(expSeconds * 1000 - Date.now() + 1000, 0));
    } else if (token !== "cookie-managed") {
      id = setInterval(() => { if (!isTokenValid(token)) clearExpiredSession(); }, 60_000);
    }
    return () => { if (typeof expSeconds === "number") clearTimeout(id); else if (id) clearInterval(id); };
  }, [token, user?.exp, clearExpiredSession]);

  const persistSession = useCallback(async (_, sessionUser) => {
    setToken("cookie-managed");
    setUser(sessionUser);
    setAuthToken(sessionToken);
    try {
      const { roles, permissions: perms, scopes, ...display } = sessionUser;
      await syncSecureStorage.setItem("user", JSON.stringify(display));
    } catch (err) {
      console.error("[AuthContext] Error persisting user:", err);
    setAuthToken("cookie-managed");
    try {
      const { roles, permissions, scopes, ...displayProfile } = sessionUser;
      await syncSecureStorage.setItem("user", JSON.stringify(displayProfile));
    } catch (error) {
      console.error("[AuthContext] Error persisting user profile:", error);
    }
    return true;
  }, []);

  const setAuthSession = useCallback((t, u) => persistSession(t, u), [persistSession]);
  const getAuthErrorMessage = (error, fallbackMessage) =>
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage;

  const login = useCallback(async (usernameOrEmail, password) => {
    if (!isMountedRef.current) return false;
    setAuthRequest({ loading: true, error: null });
    try {
      const res = await authService.login({ usernameOrEmail, password });
      const data = res.data;
      if (res.status !== 200) throw new Error(data?.message || data?.error || "Invalid credentials");
      const { sessionUser } = extractSession(data, usernameOrEmail);
      const persisted = await persistSession("cookie-managed", sessionUser);
      if (!persisted) return false;
      setAuthRequest({ loading: false, error: null });
      return true;
    } catch (error) {
      if (!isMountedRef.current) return false;
      setAuthRequest({ loading: false, error: getAuthErrorMessage(error, "Login failed. Please try again.") });
      return false;
    }
  }, [persistSession]);

  const logout = useCallback(async () => {
    try {
      const res = await authService.login({ usernameOrEmail, password });
      if (res.status !== 200) throw new Error(res.data?.message || res.data?.error || "Invalid credentials");
      const { sessionToken, sessionUser } = extractSession(res, res.data, usernameOrEmail);
      if (!(await persistSession(sessionToken, sessionUser))) return false;
      setAuthRequest({ loading: false, error: null });
      return true;
    } catch (error) {
      if (!isMountedRef.current) return false;
      const msg = error?.response?.data?.message || error?.response?.data?.error || error?.message || "Login failed";
      setAuthRequest({ loading: false, error: msg });
      return false;
    }
  }, [extractSession, persistSession]);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch { /* best-effort */ }
    clearSession();
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

  const value = useMemo(() => ({
    user, token, loading, authRequest,
    login, logout, setAuthSession, setUser,
    isAuthenticated,
    ...permissions,
  }), [user, token, loading, authRequest, login, logout, setAuthSession, setUser, isAuthenticated, permissions]);
  const hasRole = useCallback((roleName) => {
    if (!user?.roles) return false;
    const targetRole = String(roleName).toUpperCase();
    return normalizeRoles(user.roles).includes(targetRole);
  }, [user]);

  const hasPermission = useCallback((permissionName) => {
    if (!user?.permissions) return false;
    return user.permissions.includes(permissionName);
  }, [user]);

  const hasAnyRole = useCallback((...roleNames) => roleNames.some((r) => hasRole(r)), [hasRole]);
  const hasAnyPermission = useCallback((...ps) => ps.some((p) => hasPermission(p)), [hasPermission]);

  const isAdmin = () => hasRole(ROLES.ADMIN);
  const isEventManager = () => hasRole(ROLES.ORGANIZER);
  const isSuperAdmin = () => hasRole(ROLES.SUPER_ADMIN);
  const isOrganizer = () => hasRole(ROLES.ORGANIZER);
  const isVolunteer = () => hasRole(ROLES.VOLUNTEER);
  const isAttendee = () => hasRole(ROLES.ATTENDEE);

  const value = useMemo(() => ({
    user, token, loading, authRequest, login, logout, setUser,
    isAuthenticated, hasRole, hasPermission, hasAnyRole, hasAnyPermission,
    isAdmin, isEventManager, isSuperAdmin, isOrganizer, isVolunteer, isAttendee,
  }), [
    user, token, loading, authRequest, login, logout,
    isAuthenticated, hasRole, hasPermission, hasAnyRole, hasAnyPermission,
    isAdmin, isEventManager, isSuperAdmin, isOrganizer, isVolunteer, isAttendee,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
