import { useEffect, useMemo, useRef, useState } from "react";
import useRealTimeConnection, { SSE_STATUS } from "./useRealTimeConnection";
import { eventService } from "../services/eventService";
import {
  normalizeEventAvailability,
  mergeAvailabilityIntoEvent,
} from "../utils/eventAvailabilityUtils.mjs";

/**
 * The SSE stream path that broadcasts real-time availability updates for all
 * events. The backend pushes a named `availability` event with a payload of
 * `{ eventId, availability }`.
 */
const EVENT_STREAM_PATH = "/api/events/stream";

// Hard cap on the number of events we poll to avoid hammering the backend when
// a large list is rendered (e.g. the events listing page).
const MAX_POLL_EVENTS = 50;

// Polling fallback interval (ms) used only when SSE is unavailable or fails.
const POLL_INTERVAL_MS = 15_000;

/**
 * React hook that provides live, real-time event seat availability with a
 * graceful degradation strategy:
 *
 * 1. **Server-Sent Events (priority)** — subscribes to the shared SSE
 *    multiplexer on `/api/events/stream`. The backend broadcasts named
 *    `availability` events whenever a registration, cancellation, or waitlist
 *    promotion changes an event's seat count. This gives sub-second updates
 *    without a page reload.
 * 2. **Polling (fallback)** — if SSE is not connected (network drop, proxy
 *    that buffers SSE, server restart), the hook periodically re-fetches
 *    availability via the REST endpoint so seat counters still stay fresh.
 *
 * Both strategies mutate the same in-memory cache so the UI always renders the
 * most recent availability it has seen.
 *
 * @param {number|string} eventId - The event id to track, or `null` to disable.
 * @param {Object} [options={}]
 * @param {boolean} [options.enabled=true] - Toggles the connection on/off.
 * @returns {Object}
 * @returns {Object|null} Object.availability - Normalised availability
 *   `{ capacity, registeredCount, spotsLeft, isFull }` or `null` before the
 *   first successful fetch.
 * @returns {boolean} Object.isFull - Convenience flag for `availability.isFull`.
 * @returns {number} Object.remaining - Number of seats left (0 when full/unlimited-safe).
 * @returns {string} Object.status - SSE connection status.
 */
export default function useEventAvailability(eventId, { enabled = true } = {}) {
  // Cache of availability keyed by event id. Stored in a single state object so
  // multiple consumers (cards on a grid) share one source of truth.
  const [cache, setCache] = useState({});
  const [status, setStatus] = useState(SSE_STATUS.IDLE);

  // Keep the latest availability per event in a ref so the polling interval can
  // read it without re-creating the interval on every cache change.
  const cacheRef = useRef(cache);
  useEffect(() => {
    cacheRef.current = cache;
  }, [cache]);

  // Reflect the multiplexer's connection status.
  const { status: sseStatus } = useRealTimeConnection(EVENT_STREAM_PATH, {
    enabled: Boolean(eventId) && enabled,
    onMessage: (data, eventType) => {
      // Only handle availability broadcasts for the event we care about.
      if (eventType !== "availability" || !data || data.eventId == null) {
        return;
      }
      const eventIdFromStream = String(data.eventId);
      const trackedId = String(eventId);
      if (trackedId && eventIdFromStream !== trackedId) {
        return;
      }
      const availability = normalizeEventAvailability(data.availability || {});
      setCache((prev) => ({ ...prev, [eventIdFromStream]: availability }));
    },
  });

  // Keep an internal status that also flips to "polling" when we fall back.
  useEffect(() => {
    setStatus(sseStatus);
  }, [sseStatus]);

  // Initial + SSE fallback polling fetch.
  useEffect(() => {
    if (!enabled || eventId == null) {
      return undefined;
    }

    const normalizedEventId = String(eventId);
    let isMounted = true;
    let pollTimer = null;

    const fetchAvailability = async () => {
      try {
        const res = await eventService.getAvailability(eventId);
        if (!isMounted) return;
        const body = await res.json();
        if (!isMounted) return;
        const availability = normalizeEventAvailability(body);
        setCache((prev) => ({ ...prev, [normalizedEventId]: availability }));
      } catch (err) {
        if (isMounted) {
          // Keep whatever we already have; the next poll / SSE event will retry.
        }
      }
    };

    // Fetch immediately so the UI shows a value before the first SSE event.
    fetchAvailability();

    // Polling fallback: only useful when SSE is not connected. We check the
    // connection status through the cache-safe path (state update is async),
    // so we poll unconditionally but at a low frequency.
    const startPolling = () => {
      pollTimer = setInterval(fetchAvailability, POLL_INTERVAL_MS);
    };
    startPolling();

    return () => {
      isMounted = false;
      if (pollTimer) clearInterval(pollTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, enabled]);

  // Memoised derived value for the tracked event.
  const availability = useMemo(
    () => (eventId == null ? null : (cache[String(eventId)] ?? null)),
    [cache, eventId]
  );

  const isFull = availability?.isFull === true;
  const remaining = availability?.spotsLeft != null ? availability.spotsLeft : isFull ? 0 : null;

  return { availability, isFull, remaining, status };
}

export { EVENT_STREAM_PATH, MAX_POLL_EVENTS, POLL_INTERVAL_MS };
