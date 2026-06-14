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
import { apiUtils, API_ENDPOINTS } from "../config/api";
import { safeLocalStorage } from "../utils/safeStorage";

const STORAGE_KEY = "eventra_waitlist_positions";

/**
 * Read the persisted waitlist map from localStorage.
 * Returns an object keyed by eventId with { position, joinedAt }.
 */
function readPersistedWaitlist() {
  try {
    const raw = safeLocalStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Persist the waitlist map.
 */
function persistWaitlist(map) {
  try {
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore quota errors
  }
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
export default function useWaitlist(eventId, { capacity, attendees } = {}) {
  const [waitlistMap, setWaitlistMap] = useState(readPersistedWaitlist);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const id = String(eventId);
  const entry = waitlistMap[id] ?? null;
  const isOnWaitlist = Boolean(entry);
  const position = entry?.position ?? null;

  // Persist on every change
  useEffect(() => {
    persistWaitlist(waitlistMap);
  }, [waitlistMap]);

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
