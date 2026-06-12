import { useCallback, useEffect, useRef, useState } from "react";
import { sseMultiplexer } from "../utils/sseMultiplexer";

export const SSE_STATUS = {
  IDLE: "idle",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  RECONNECTING: "reconnecting",
};

/**
 * A custom React hook that establishes, tracks, and manages a Server-Sent Events (SSE) connection.
 *
 * ### Purpose
 * Rather than spawning independent `EventSource` connections for every component or browser tab, this
 * hook delegates to a centralized `sseMultiplexer`. This prevents browser connection pool exhaustion
 * (where HTTP/1.1 restricts browsers to a maximum of 6 concurrent connections per domain), enabling
 * multi-tab synchronization with minimal resource overhead.
 *
 * ### Connection Lifecycle
 * - **Establishment**: Runs automatically when the hook mounts, or when `path` or `enabled` transitions.
 *   If `enabled` is set to `false`, the connection remains in `idle` state.
 * - **Cleanup**: On component unmount or when `enabled` changes to `false`, the hook automatically calls
 *   the returned `unsubscribe` callback from the multiplexer. This cleans up event listeners and safely
 *   closes the underlying EventSource connection if no other tabs or components are listening to that path.
 *
 * ### Callback Stability Guard
 * To prevent connection teardown/restart loops when the user passes anonymous or unstable callback functions
 * as the `onMessage` handler, the hook stores `onMessage` in a mutable `useRef` object (`onMessageRef`).
 * The subscription only depends on the stable `path` and `enabled` parameters.
 *
 * ### Error Handling & Reconnection
 * - The connection status (`idle`, `connecting`, `connected`, `reconnecting`) is updated automatically
 *   via status change callbacks dispatched from the `sseMultiplexer`.
 * - The hook exposes a memoized `reconnect` function, which allows consumers to manually trigger a fresh
 *   connection attempt for the current path in case of network drops or timeout errors.
 *
 * @param {string} path - The endpoint URL path to stream events from (e.g., `"/stream/leaderboard"`).
 * @param {Object} [options={}] - Optional configuration parameters.
 * @param {function(*, string): void} [options.onMessage] - Callback triggered when a new message is received. Receives `(parsedData, eventType)` as arguments.
 * @param {boolean} [options.enabled=true] - Toggles the active state of the SSE stream. Bypasses connection when set to `false`.
 *
 * @returns {Object} Connection state and controls.
 * @returns {string} Object.status - The current SSE connection state, matching one of the values in {@link SSE_STATUS} (`'idle'`, `'connecting'`, `'connected'`, or `'reconnecting'`).
 * @returns {function(): void} Object.reconnect - A referentially stable callback function to manually trigger a reconnection sequence for the specified path.
 *
 * @example
 * import React, { useState } from 'react';
 * import useRealTimeConnection, { SSE_STATUS } from './hooks/useRealTimeConnection';
 *
 * const LiveAnalytics = () => {
 *   const [metrics, setMetrics] = useState(null);
 *
 *   const { status, reconnect } = useRealTimeConnection('/stream/analytics', {
 *     onMessage: (data) => setMetrics(data),
 *     enabled: true
 *   });
 *
 *   const isOffline = status === SSE_STATUS.IDLE || status === SSE_STATUS.RECONNECTING;
 *
 *   return (
 *     <div className="analytics-card">
 *       <h3>Live Visitors: {metrics ? metrics.visitors : 'Loading...'}</h3>
 *       <div className="status-badge">Connection: {status}</div>
 *       {isOffline && (
 *         <button onClick={reconnect} className="btn-retry">
 *           Reconnect Now
 *         </button>
 *       )}
 *     </div>
 *   );
 * };
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
