import { useCallback, useEffect, useRef, useState } from "react";
import { sseMultiplexer } from "../utils/sseMultiplexer";

export const SSE_STATUS = {
  IDLE: "idle",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  RECONNECTING: "reconnecting",
};

/**
 * Manages an SSE (Server-Sent Events) connection by delegating to a
 * thread-safe, cross-tab multiplexer. This prevents browser connection pool
 * exhaustion (exceeding the HTTP/1.1 6-connection domain limit) by sharing a
 * single physical EventSource connection across all open tabs.
 *
 * @param {string} path - Endpoint path, e.g. "/stream/leaderboard" or "/stream/analytics"
 * @param {object} [options]
 * @param {function} [options.onMessage] - Called with (parsedData, eventType) on each event
 * @param {boolean} [options.enabled=true]  - Set false to disable the connection
 */
export default function useRealTimeConnection(path, { onMessage, enabled = true } = {}) {
  const [status, setStatus] = useState(SSE_STATUS.IDLE);
  
  // Stable reference to callback ensures the connection does not restart on prop changes
  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!enabled) {
      setStatus(SSE_STATUS.IDLE);
      return undefined;
    }

    const handleMessage = (data, eventType) => {
      onMessageRef.current?.(data, eventType);
    };

    const handleStatus = (updatedPath, newStatus) => {
      if (updatedPath === path) {
        setStatus(newStatus);
      }
    };

    // Register subscription with sseMultiplexer
    const unsubscribe = sseMultiplexer.subscribe(path, handleMessage, handleStatus);

    return () => {
      unsubscribe();
    };
  }, [path, enabled]);

  const reconnect = useCallback(() => {
    sseMultiplexer.reconnect(path);
  }, [path]);

  return { status, reconnect };
}
