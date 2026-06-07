import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { sessionService } from "../services/sessionService";
import { useAuth } from "../context/AuthContext";

const POLL_INTERVAL_MS = 30_000;

export const useActiveSessions = ({ autoRefresh = true } = {}) => {
  const { isAuthenticated, logout } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revokingId, setRevokingId] = useState(null);
  const [revokingAll, setRevokingAll] = useState(false);
  const notifiedDevicesRef = useRef(new Set());

  const fetchSessions = useCallback(async () => {
    if (!isAuthenticated()) {
      setSessions([]);
      setLoading(false);
      return;
    }

    setError(null);

    try {
      const res = await sessionService.list();
      const list = res.data?.sessions || [];
      setSessions(list);

      list.forEach((session) => {
        if (session.suspicious && session.isNewDevice && !notifiedDevicesRef.current.has(session.id)) {
          notifiedDevicesRef.current.add(session.id);
          toast(
            `New login detected on ${session.browser} (${session.os})`,
            { icon: "🔐", duration: 5000 },
          );
        }
      });
    } catch (err) {
      setError(err?.message || "Failed to load active sessions.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const revokeSession = useCallback(
    async (sessionId) => {
      setRevokingId(sessionId);
      try {
        const res = await sessionService.revoke(sessionId);
        if (res.data?.revokedCurrentSession) {
          sessionService.clearLocalSession();
          logout();
          toast.success("You have been logged out from this device.");
          return { loggedOut: true };
        }

        toast.success("Device logged out successfully.");
        await fetchSessions();
        return { loggedOut: false };
      } catch (err) {
        toast.error(err?.message || "Failed to revoke session.");
        return { loggedOut: false, error: err };
      } finally {
        setRevokingId(null);
      }
    },
    [fetchSessions, logout],
  );

  const revokeAllOtherSessions = useCallback(async () => {
    setRevokingAll(true);
    try {
      await sessionService.revokeAll();
      toast.success("All other devices have been logged out.");
      await fetchSessions();
    } catch (err) {
      toast.error(err?.message || "Failed to log out other devices.");
    } finally {
      setRevokingAll(false);
    }
  }, [fetchSessions]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (!autoRefresh || !isAuthenticated()) return undefined;

    const intervalId = setInterval(fetchSessions, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [autoRefresh, fetchSessions, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated()) return undefined;

    const heartbeatId = setInterval(() => {
      sessionService.heartbeat().catch(() => {});
    }, POLL_INTERVAL_MS);

    return () => clearInterval(heartbeatId);
  }, [isAuthenticated]);

  return {
    sessions,
    loading,
    error,
    revokingId,
    revokingAll,
    refresh: fetchSessions,
    revokeSession,
    revokeAllOtherSessions,
  };
};

export default useActiveSessions;
