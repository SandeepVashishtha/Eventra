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
 * @param {string} path - Endpoint path, e.g. "/stream/leaderboard"
 * @param {object} [options]
 * @param {string[]} [options.events=[]] - Array of custom event names to listen for
 * @param {function} [options.onMessage] - Called with (parsedData, eventType) on each event
 * @param {boolean} [options.enabled=true]  - Set false to disable the connection
 */
export default function useRealTimeConnection(path, { events = [], onMessage, enabled = true } = {}) {
  const [status, setStatus] = useState(SSE_STATUS.IDLE);
  
  // Stable reference to callback ensures the connection does not restart on prop changes
  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  // 🔥 FIX 1: Deep compare events array so inline arrays don't cause infinite reconnect loops
  const eventsKey = JSON.stringify(events);

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

    // 🔥 FIX 2: Parse the stable events array and pass it to the multiplexer 
    // so it knows to bind source.addEventListener for these custom events.
    const parsedEvents = JSON.parse(eventsKey);
    
    // Register subscription with sseMultiplexer
    const unsubscribe = sseMultiplexer.subscribe(path, handleMessage, handleStatus, parsedEvents);

    return () => {
      unsubscribe();
    };
  }, [path, enabled, eventsKey]);

  const reconnect = useCallback(() => {
    sseMultiplexer.reconnect(path);
  }, [path]);

  return { status, reconnect };
}