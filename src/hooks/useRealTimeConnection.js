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
 * 
 * By default, the base URL is derived from:
 * 1. REACT_APP_SSE_URL (explicit SSE endpoint)
 * 2. REACT_APP_API_URL (general API base URL, e.g. http://localhost:8080/api/v1)
 * 3. Fallback to "http://localhost:8080/api/v1"
 * 
 * When testing with the local sse-mock-server, set:
 * REACT_APP_SSE_URL=http://localhost:4001
 *
 * Reconnection schedule: 1s → 2s → 4s → … → 30s (capped), plus ±500ms jitter.
 * Retries indefinitely so the client self-heals when the backend adds SSE support.
 *
 * @param {string} path - Endpoint path, e.g. "/stream/leaderboard" or "/stream/analytics"
 * @param {object} [options]
 * @param {function} [options.onMessage] - Called with (parsedData, eventType) on each event
 * @param {boolean} [options.enabled=true]  - Set false to disable the connection
 */
export default function useRealTimeConnection(path, { onMessage, enabled = true } = {}) {
  const [status, setStatus] = useState(SSE_STATUS.IDLE);

  const sourceRef = useRef(null);
  const retryTimer = useRef(null);
  const attemptRef = useRef(0);
  // Keep callback stable across renders without restarting the connection
  const onMessageRef = useRef(onMessage);
  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);

  const teardown = useCallback(() => {
    clearTimeout(retryTimer.current);
    if (sourceRef.current) {
      // 🔥 FIX 1B: Explicitly strip listeners before closing to stop duplicate native tracking loops
      sourceRef.current.onopen = null;
      sourceRef.current.onmessage = null;
      sourceRef.current.onerror = null;
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

    // Shared message processor for standard and custom events
    const processMessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        onMessageRef.current?.(data, evt.type);
      } catch {
        // Forward raw string if JSON parsing fails
        onMessageRef.current?.(evt.data, evt.type);
      }
    };

    source.onmessage = processMessage;

    // 🔥 FIX 2: Intercept Custom Server-Sent Named Events
    // Native EventSource ignores .onmessage if the server transmits an explicit 'event: name' tag.
    // Overriding the default addEventListener allows us to process custom streams dynamically.
    const nativeAddEventListener = source.addEventListener.bind(source);
    source.addEventListener = (type, listener, options) => {
      if (type !== "open" && type !== "message" && type !== "error") {
        nativeAddEventListener(type, processMessage, options);
      } else {
        nativeAddEventListener(type, listener, options);
      }
    };

    source.onerror = () => {
      // EventSource fires onerror on any failure (network drop, 4xx, 5xx).
      // We close it manually so our backoff timer controls reconnection timing.
      
      // 🔥 FIX 1A: We must immediately strip the listeners and close the reference here.
      // Otherwise, the browser background thread automatically starts its own hidden retry stream
      // in parallel with our manual setTimeout loop, causing connection leakage and server DDOS spikes.
      teardown();

      const delay = computeBackoff(attemptRef.current);
      attemptRef.current += 1;
      setStatus(SSE_STATUS.RECONNECTING);
      retryTimer.current = setTimeout(connect, delay);
    };
  }, [path, teardown]);

  useEffect(() => {
    if (!enabled) {
      teardown();
      setStatus(SSE_STATUS.IDLE);
      return;
    }
    attemptRef.current = 0;
    connect();
    return teardown;
  }, [path, enabled, connect, teardown]);

  const reconnect = useCallback(() => {
    attemptRef.current = 0;
    connect();
  }, [connect]);

  return { status, reconnect };
}