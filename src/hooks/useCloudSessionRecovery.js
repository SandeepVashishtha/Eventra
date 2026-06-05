import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createRecoveryPayload,
  deleteRecoverySession,
  fetchRecoverySessions,
  mergeRecoverySessions,
  queuePendingRecoverySession,
  readRecoverySessionsFromStorage,
  restoreRecoverySession,
  saveRecoverySession,
  syncPendingRecoverySessions,
  writeRecoverySessionsToStorage,
} from "../services/sessionRecoveryService";

const isBrowserOnline = () =>
  typeof navigator === "undefined" ? true : navigator.onLine !== false;

export const useCloudSessionRecovery = ({
  user = null,
  isAuthenticated = false,
  storage = globalThis.localStorage,
} = {}) => {
  const userId = user?.id || user?.userId || user?.email || "";
  const [cloudSessions, setCloudSessions] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState("");
  const mountedRef = useRef(true);

  const canSync = Boolean(isAuthenticated && userId && isBrowserOnline());

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setCloudSessions(readRecoverySessionsFromStorage(storage));
  }, [storage]);

  const refreshCloudSessions = useCallback(async () => {
    if (!canSync) {
      return readRecoverySessionsFromStorage(storage);
    }

    setIsSyncing(true);
    setSyncError("");
    try {
      const localSessions = readRecoverySessionsFromStorage(storage);
      const remoteSessions = await fetchRecoverySessions();
      const merged = mergeRecoverySessions(localSessions, remoteSessions);
      writeRecoverySessionsToStorage(merged, storage);
      if (mountedRef.current) setCloudSessions(merged);
      return merged;
    } catch (error) {
      if (mountedRef.current) {
        setSyncError(error?.message || "Unable to fetch recovery sessions.");
      }
      return readRecoverySessionsFromStorage(storage);
    } finally {
      if (mountedRef.current) setIsSyncing(false);
    }
  }, [canSync, storage]);

  const syncPending = useCallback(async () => {
    if (!canSync) return { synced: [], failed: [] };

    setIsSyncing(true);
    setSyncError("");
    try {
      const result = await syncPendingRecoverySessions(storage);
      const merged = mergeRecoverySessions(
        readRecoverySessionsFromStorage(storage),
        result.synced,
      );
      writeRecoverySessionsToStorage(merged, storage);
      if (mountedRef.current) setCloudSessions(merged);
      return result;
    } catch (error) {
      if (mountedRef.current) {
        setSyncError(error?.message || "Unable to sync recovery sessions.");
      }
      return { synced: [], failed: [] };
    } finally {
      if (mountedRef.current) setIsSyncing(false);
    }
  }, [canSync, storage]);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    refreshCloudSessions();
    syncPending();
  }, [isAuthenticated, refreshCloudSessions, syncPending, userId]);

  useEffect(() => {
    const handleOnline = () => {
      syncPending();
      refreshCloudSessions();
    };

    if (typeof window === "undefined") return undefined;
    window.addEventListener?.("online", handleOnline);
    return () => window.removeEventListener?.("online", handleOnline);
  }, [refreshCloudSessions, syncPending]);

  const saveCloudSession = useCallback(
    async (state, options = {}) => {
      const payload = createRecoveryPayload({
        state,
        userId,
        sessionId: options.sessionId || state?.sessionId,
        type: options.type || state?.recoveryType || state?.page,
        retentionDays: options.retentionDays,
      });

      if (!payload) return null;

      const localSessions = mergeRecoverySessions([payload], readRecoverySessionsFromStorage(storage));
      writeRecoverySessionsToStorage(localSessions, storage);
      if (mountedRef.current) setCloudSessions(localSessions);

      if (!canSync) {
        queuePendingRecoverySession(payload, storage);
        return payload;
      }

      try {
        const saved = await saveRecoverySession(payload);
        const merged = mergeRecoverySessions([saved], localSessions);
        writeRecoverySessionsToStorage(merged, storage);
        if (mountedRef.current) setCloudSessions(merged);
        return saved;
      } catch (error) {
        queuePendingRecoverySession(payload, storage);
        if (mountedRef.current) {
          setSyncError(error?.message || "Recovery session queued for later sync.");
        }
        return payload;
      }
    },
    [canSync, storage, userId],
  );

  const restoreCloudSession = useCallback(
    async (sessionId) => {
      const localSession = cloudSessions.find((session) => session.sessionId === sessionId);
      if (!canSync) return localSession || null;

      try {
        const restored = await restoreRecoverySession(sessionId);
        return restored || localSession || null;
      } catch {
        return localSession || null;
      }
    },
    [canSync, cloudSessions],
  );

  const dismissCloudSession = useCallback(
    async (sessionId) => {
      const remaining = cloudSessions.filter((session) => session.sessionId !== sessionId);
      writeRecoverySessionsToStorage(remaining, storage);
      setCloudSessions(remaining);

      if (canSync) {
        try {
          await deleteRecoverySession(sessionId);
        } catch {
          // Local dismissal should still succeed; the next refresh may reconcile.
        }
      }
    },
    [canSync, cloudSessions, storage],
  );

  return useMemo(
    () => ({
      cloudSessions,
      hasCloudSessions: cloudSessions.length > 0,
      isCloudSyncing: isSyncing,
      cloudSyncError: syncError,
      saveCloudSession,
      restoreCloudSession,
      dismissCloudSession,
      refreshCloudSessions,
      syncPending,
    }),
    [
      cloudSessions,
      dismissCloudSession,
      isSyncing,
      refreshCloudSessions,
      restoreCloudSession,
      saveCloudSession,
      syncError,
      syncPending,
    ],
  );
};

export default useCloudSessionRecovery;
