/**
 * useWaitlist
 *
 * Custom hook for managing event waitlist state.
 *
 * Features:
 * - Join / leave waitlist with optimistic UI updates
 * - Persist waitlist positions to localStorage for offline resilience
 * - Exposes loading and error states
 * - SSR-safe (no window access at module level)
 */

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { apiUtils, API_ENDPOINTS } from "../config/api.js";
import { safeLocalStorage } from "../utils/safeStorage";
import { useAuth } from "../context/AuthContext";
import { getOrMigrateKey } from "../utils/storageKeyManager";

// Legacy unscoped key the hook used before #10388. Kept around so
// getOrMigrateKey can adopt any data left under it into the user's namespaced
// key on first login after this fix.
const LEGACY_STORAGE_KEY = "eventra_waitlist_positions";
const WAITLIST_NAMESPACE = "eventra_waitlist_positions";

/**
 * Read the persisted waitlist map for a given storage key.
 * Returns an object keyed by eventId with { position, joinedAt }.
 */
function readPersistedWaitlist(storageKey) {
  if (!storageKey) return {};
  try {
    const raw = safeLocalStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

let persistTimeout = null;

/**
 * Persist the waitlist map to the given storage key. No-op if the key is
 * falsy (e.g. logged-out state where we want in-memory only, so nothing
 * leaks to the next user of a shared browser).
 */
function persistWaitlist(map, storageKey) {
  if (typeof window === "undefined" || !storageKey) return;
  if (persistTimeout) {
    clearTimeout(persistTimeout);
  }
  persistTimeout = setTimeout(() => {
    const runWrite = () => {
      try {
        safeLocalStorage.setItem(storageKey, JSON.stringify(map));
      } catch {
        // ignore quota errors
      }
    };
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(() => runWrite(), { timeout: 100 });
    } else {
      runWrite();
    }
  }, 100);
}

/**
 * @param {string | number} eventId  - The event ID to manage
 * @param {Object}          [opts]
 * @param {number}          [opts.capacity]   - Event capacity (used for slot calc)
 * @param {number}          [opts.attendees]  - Current attendee count
 * @returns {{
 *   isOnWaitlist: boolean,
 *   position: number | null,
 *   estimatedWait: string | null,
 *   isLoading: boolean,
 *   error: string | null,
 *   join: () => Promise<void>,
 *   leave: () => Promise<void>,
 * }}
 */
export default function useWaitlist(eventId, { 
  // capacity: _capacity, attendees: _attendees 
} = {}) {
  const { user } = useAuth();
  const userId = user?.id;

  // Scope the persistence key to the authenticated user. For guests, `storageKey`
  // is `undefined` so `persistWaitlist` becomes a no-op — the state stays in
  // memory for the session and never touches localStorage, so a guest can't leak
  // their positions to the next person on a shared browser. Authenticated
  // users go through getOrMigrateKey, which also adopts anything left under the
  // legacy unscoped `eventra_waitlist_positions` key on first login.
  const storageKey = userId
    ? getOrMigrateKey(WAITLIST_NAMESPACE, userId, LEGACY_STORAGE_KEY)
    : undefined;

  const [waitlistMap, setWaitlistMap] = useState(() => readPersistedWaitlist(storageKey));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const id = String(eventId);
  const entry = waitlistMap[id] ?? null;
  const isOnWaitlist = Boolean(entry);
  const position = entry?.position ?? null;

  // On sign-in/out, re-seed the map from the new key so user B doesn't see
  // user A's in-memory state after a session swap on the same tab.
  useEffect(() => {
    setWaitlistMap(readPersistedWaitlist(storageKey));
  }, [storageKey]);

  // Persist on every change (no-op for guests via the storageKey check)
  useEffect(() => {
    persistWaitlist(waitlistMap, storageKey);
  }, [waitlistMap, storageKey]);

  /**
   * Estimate wait in human-readable form.
   * Assumes ~15 min average turnover per spot.
   */
  const estimatedWait = position
    ? position === 1
      ? "You're next!"
      : `~${Math.round(position * 15)} min wait`
    : null;

  const join = useCallback(async () => {
    if (isOnWaitlist || isLoading) return;
    setError(null);
    setIsLoading(true);

    // Optimistic update
    const optimisticEntry = { position: null, joinedAt: new Date().toISOString() };
    setWaitlistMap((prev) => ({ ...prev, [id]: optimisticEntry }));

    try {
      const res = await apiUtils.post(
        API_ENDPOINTS.EVENTS?.WAITLIST
          ? API_ENDPOINTS.EVENTS.WAITLIST(id)
          : `/api/events/${id}/waitlist`,
        {}
      );
      if (res.ok) {
        const data = res.data?.data ?? res.data ?? {};
        setWaitlistMap((prev) => ({
          ...prev,
          [id]: {
            position: data.position ?? null,
            joinedAt: data.joinedAt ?? new Date().toISOString(),
          },
        }));
        toast.success(
          data.position
            ? `You're on the waitlist at position #${data.position}!`
            : "You've been added to the waitlist!"
        );
      } else {
        throw new Error(res.data?.message || "Failed to join waitlist.");
      }
    } catch (err) {
      // Roll back optimistic update
      setWaitlistMap((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      const msg = err.message || "Unable to join waitlist right now.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [id, isOnWaitlist, isLoading]);

  const leave = useCallback(async () => {
    if (!isOnWaitlist || isLoading) return;
    setError(null);
    setIsLoading(true);

    // Optimistic update
    const prevEntry = waitlistMap[id];
    setWaitlistMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

    try {
      const res = await apiUtils.delete(
        API_ENDPOINTS.EVENTS?.WAITLIST
          ? API_ENDPOINTS.EVENTS.WAITLIST(id)
          : `/api/events/${id}/waitlist`,
        {}
      );
      if (!res.ok) {
        throw new Error(res.data?.message || "Failed to leave waitlist.");
      }
      toast.info("You've been removed from the waitlist.");
    } catch (err) {
      // Roll back
      setWaitlistMap((prev) => ({ ...prev, [id]: prevEntry }));
      const msg = err.message || "Unable to leave waitlist right now.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [id, isOnWaitlist, isLoading, waitlistMap]);

  return {
    isOnWaitlist,
    position,
    estimatedWait,
    isLoading,
    error,
    join,
    leave,
  };
}
