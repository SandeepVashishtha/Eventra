import { useCallback, useEffect, useRef, useState } from "react";

const getSseBaseUrl = () => {
  const envUrl = process.env.REACT_APP_SSE_URL || process.env.REACT_APP_API_URL;
  if (envUrl) {
    return envUrl;
  }
  if (process.env.NODE_ENV === "production") {
    console.warn("REACT_APP_SSE_URL or REACT_APP_API_URL environment variable is missing in production. Defaulting to relative SSE connection.");
    return "/api/v1";
  }
  return "http://localhost:8080/api/v1";
};

const SSE_BASE_URL = getSseBaseUrl();

const BACKOFF_CAP_MS = 30_000;

function computeBackoff(attempt) {
  const exponential = Math.min(1_000 * 2 ** attempt, BACKOFF_CAP_MS);
  // Add up to 500ms of jitter to prevent thundering herd on reconnect
  return exponential + Math.random() * 500;
}

export const SSE_STATUS = {
  IDLE: "idle",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  RECONNECTING: "reconnecting",
};

/**
 * Manages an SSE (Server-Sent Events) connection with exponential backoff.
 * * By default, the base URL is derived from:
 * 1. REACT_APP_SSE_URL (explicit SSE endpoint)
 * 2. REACT_APP_API_URL (general API base URL, e.g. http://localhost:8080/api/v1)
 * 3. Fallback to "http://localhost:8080/api/v1"
 *
 * Reconnection schedule: 1s → 2s → 4s → … → 30s (capped), plus ±500ms jitter.
 *
 * @param {string} path - Endpoint path, e.g. "/stream/leaderboard"
 * @param {object} [options]
 * @param {string[]} [options.events=[]] - Array of custom event names to listen for
 * @param {function} [options.onMessage] - Called with (parsedData, eventType) on each event
 * @param {boolean} [options.enabled=true]  - Set false to disable the connection
 */
export default function useRealTimeConnection(path, { events = [], onMessage, enabled = true } = {}) {
  const [status, setStatus] = useState(SSE_STATUS.IDLE);

  const sourceRef = useRef(null);
  const retryTimer = useRef(null);
  const attemptRef = useRef(0);
  
  // Keep callback stable across renders without restarting the connection
  const onMessageRef = useRef(onMessage);
  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);

  // 🔥 FIX 1: Deep compare events array so inline arrays don't cause infinite reconnect loops
  const eventsKey = JSON.stringify(events);

  const teardown = useCallback(() => {
    clearTimeout(retryTimer.current);
    if (sourceRef.current) {
      sourceRef.current.close();
      sourceRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    teardown();

    const source = new EventSource(`${SSE_BASE_URL}${path}`, { withCredentials: true });
    sourceRef.current = source;
    setStatus(attemptRef.current === 0 ? SSE_STATUS.CONNECTING : SSE_STATUS.RECONNECTING);

    source.onopen = () => {
      attemptRef.current = 0;
      setStatus(SSE_STATUS.CONNECTED);
    };

    const handleEvent = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        onMessageRef.current?.(data, evt.type);
      } catch {
        // Forward raw string if JSON parsing fails
        onMessageRef.current?.(evt.data, evt.type);
      }
    };

    // Catch default messages (where event type is missing or exactly "message")
    source.onmessage = handleEvent;

    // 🔥 FIX 2: Catch custom named events which EventSource completely ignores by default
    try {
      const parsedEvents = JSON.parse(eventsKey);
      parsedEvents.forEach(eventType => {
        source.addEventListener(eventType, handleEvent);
      });
    } catch (e) {
      console.error("[useRealTimeConnection] Failed to bind custom events", e);
    }

    source.onerror = () => {
      // EventSource fires onerror on any failure (network drop, 4xx, 5xx).
      // We close it manually so our backoff timer controls reconnection timing.
      source.close();
      sourceRef.current = null;

      const delay = computeBackoff(attemptRef.current);
      attemptRef.current += 1;
      setStatus(SSE_STATUS.RECONNECTING);
      retryTimer.current = setTimeout(connect, delay);
    };
  }, [path, eventsKey, teardown]);

  useEffect(() => {
    if (!enabled) {
      teardown();
      setStatus(SSE_STATUS.IDLE);
      return;
    }
    attemptRef.current = 0;
    connect();
    return teardown;
  }, [path, enabled, eventsKey, connect, teardown]);

  const reconnect = useCallback(() => {
    attemptRef.current = 0;
    connect();
  }, [connect]);

  return { status, reconnect };
}