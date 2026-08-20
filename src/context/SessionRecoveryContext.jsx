"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  saveSessionRecovery,
  updateSessionRecovery,
  getSessionRecoveryList,
  restoreSessionRecovery,
  deleteSessionRecovery,
  cleanupExpiredSessionRecovery,
} from "@/lib/api";

const SessionRecoveryContext = createContext();

const LOCAL_STORAGE_KEY = "eventra_recovery_sessions_v1";

export function SessionRecoveryProvider({ children }) {
  const [sessions, setSessions] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Helper to read local drafts
  const getLocalDrafts = () => {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  // Helper to write local drafts
  const saveLocalDrafts = (drafts) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(drafts));
    } catch (e) {
      console.warn("Failed to write recovery sessions to localStorage:", e);
    }
  };

  // Synchronize local and cloud sessions
  const syncSessions = useCallback(async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("eventra_token");

    const localDrafts = getLocalDrafts();

    if (!token) {
      setSessions(localDrafts);
      return;
    }

    setIsSyncing(true);
    try {
      // 1. Fetch remote cloud sessions
      const remoteSessions = await getSessionRecoveryList();
      
      // 2. Combine remote and local drafts without duplication
      const remoteMap = new Map((remoteSessions || []).map((s) => [s.sessionId, s]));
      localDrafts.forEach((local) => {
        if (!remoteMap.has(local.sessionId)) {
          remoteMap.set(local.sessionId, local);
        }
      });

      const merged = Array.from(remoteMap.values());
      setSessions(merged);
      saveLocalDrafts(merged);
    } catch (err) {
      console.warn("[SessionRecovery] Cloud sync failed, using local storage:", err);
      setSessions(localDrafts);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    syncSessions();
  }, [syncSessions]);

  // Save or Update a recovery session draft
  const saveDraft = async ({ sessionId, name = "Recovery Session", type = "generic", draftData = {} }) => {
    const id = sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const payload = { sessionId: id, name, type, draftData };

    // Update local state immediately
    const updatedLocal = getLocalDrafts().filter((s) => s.sessionId !== id);
    const updatedSession = { ...payload, lastUpdated: new Date().toISOString() };
    updatedLocal.unshift(updatedSession);
    saveLocalDrafts(updatedLocal);
    setSessions(updatedLocal);

    // Sync to cloud if authenticated
    if (typeof window !== "undefined" && localStorage.getItem("eventra_token")) {
      try {
        if (sessionId) {
          await updateSessionRecovery(id, payload);
        } else {
          await saveSessionRecovery(payload);
        }
      } catch (err) {
        console.warn("[SessionRecovery] Could not save draft to cloud:", err);
      }
    }

    return id;
  };

  // Restore session data by ID
  const restoreDraft = async (sessionId) => {
    if (typeof window !== "undefined" && localStorage.getItem("eventra_token")) {
      try {
        const restored = await restoreSessionRecovery(sessionId);
        if (restored) return restored;
      } catch (err) {
        console.warn("[SessionRecovery] Cloud restore failed, checking local:", err);
      }
    }
    const local = getLocalDrafts().find((s) => s.sessionId === sessionId);
    return local || null;
  };

  // Delete session draft by ID
  const removeDraft = async (sessionId) => {
    const updatedLocal = getLocalDrafts().filter((s) => s.sessionId !== sessionId);
    saveLocalDrafts(updatedLocal);
    setSessions(updatedLocal);

    if (typeof window !== "undefined" && localStorage.getItem("eventra_token")) {
      try {
        await deleteSessionRecovery(sessionId);
      } catch (err) {
        console.warn("[SessionRecovery] Could not delete cloud draft:", err);
      }
    }
  };

  // Clean up expired sessions
  const cleanupExpired = async () => {
    if (typeof window !== "undefined" && localStorage.getItem("eventra_token")) {
      try {
        await cleanupExpiredSessionRecovery();
        await syncSessions();
      } catch (err) {
        console.warn("[SessionRecovery] Cloud cleanup failed:", err);
      }
    }
  };

  return (
    <SessionRecoveryContext.Provider
      value={{
        sessions,
        isSyncing,
        syncSessions,
        saveDraft,
        restoreDraft,
        removeDraft,
        cleanupExpired,
      }}
    >
      {children}
    </SessionRecoveryContext.Provider>
  );
}

export function useSessionRecovery() {
  const context = useContext(SessionRecoveryContext);
  if (!context) {
    throw new Error("useSessionRecovery must be used within a SessionRecoveryProvider");
  }
  return context;
}
