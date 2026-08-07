/**
 * useNetworkStatus.js
 *
 * Centralised reactive hook for network connectivity and connection quality.
 *
 * PROBLEM THIS SOLVES
 * -------------------
 * Before this hook, every component that needed to know about network status
 * duplicated the same boilerplate:
 *
 *   const [isOnline, setIsOnline] = useState(navigator.onLine);
 *   useEffect(() => {
 *     const handleOnline  = () => setIsOnline(true);
 *     const handleOffline = () => setIsOnline(false);
 *     window.addEventListener("online",  handleOnline);
 *     window.addEventListener("offline", handleOffline);
 *     return () => { ... };
 *   }, []);
 *
 * This pattern appeared identically in at least 5 files:
 *   - src/components/common/OfflineBanner.jsx
 *   - src/components/admin/TicketScanner.jsx
 *   - src/components/SessionRecovery.js
 *   - src/components/common/OfflineManager.jsx
 *   - src/components/user/UserDashboard.jsx
 *
 * Each copy registers its own pair of global event listeners, meaning N
 * mounted components = N×2 listeners for the same events. It also meant
 * that richer network information (connection type, effective speed,
 * offline duration) was unavailable to most components because adding it
 * to every copy was impractical.
 *
 * FEATURES
 * --------
 *  1. isOnline          — reactive boolean, updates on browser online/offline events
 *  2. connectionType    — "wifi" | "cellular" | "ethernet" | "none" | "unknown"
 *                         via the Network Information API (graceful fallback)
 *  3. effectiveType     — "slow-2g" | "2g" | "3g" | "4g" | undefined
 *  4. offlineSince      — Date when connectivity was lost, null when online
 *  5. offlineDuration   — human-readable string e.g. "3m 22s", updated every second
 *  6. wasOffline        — true if the connection was lost at least once this session,
 *                         useful for showing "back online — syncing…" banners
 *
 * USAGE
 * -----
 *   import useNetworkStatus from 'hooks/useNetworkStatus';
 *
 *   const { isOnline, offlineDuration, connectionType } = useNetworkStatus();
 *
 *   // Disable submit while offline
 *   <button disabled={!isOnline}>Save</button>
 *
 *   // Show offline duration
 *   {!isOnline && <p>Offline for {offlineDuration}</p>}
 */

import { useState, useEffect, useCallback, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format elapsed milliseconds into a compact human-readable string.
 * e.g. 0 → "0s", 65000 → "1m 5s", 3662000 → "1h 1m 2s"
 */
const formatDuration = (ms) => {
  if (!ms || ms < 0) return "0s";
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

/**
 * Read the current connection type from the Network Information API.
 * Falls back gracefully when the API is unsupported (Firefox, Safari).
 *
 * @returns {{ connectionType: string, effectiveType: string|undefined }}
 */
const readConnectionInfo = () => {
  const nav = navigator;
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;

  if (!conn) {
    // API not supported — infer from navigator.onLine only
    return {
      connectionType: nav.onLine ? "unknown" : "none",
      effectiveType: undefined,
    };
  }

  return {
    connectionType: conn.type ?? (nav.onLine ? "unknown" : "none"),
    effectiveType: conn.effectiveType,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * useNetworkStatus
 *
 * @returns {{
 *   isOnline:        boolean,
 *   connectionType:  string,
 *   effectiveType:   string | undefined,
 *   offlineSince:    Date | null,
 *   offlineDuration: string,
 *   wasOffline:      boolean,
 * }}
 */
const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [offlineSince, setOfflineSince] = useState(null);
  const [offlineDuration, setOfflineDuration] = useState("0s");
  const [wasOffline, setWasOffline] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState(readConnectionInfo);

  // Stable ref so the interval callback always reads the current offlineSince
  const offlineSinceRef = useRef(null);

  // Interval handle for the duration ticker
  const tickerRef = useRef(null);

  const stopTicker = useCallback(() => {
    if (tickerRef.current) {
      clearInterval(tickerRef.current);
      tickerRef.current = null;
    }
  }, []);

  const startTicker = useCallback(() => {
    stopTicker();
    tickerRef.current = setInterval(() => {
      if (offlineSinceRef.current) {
        setOfflineDuration(formatDuration(Date.now() - offlineSinceRef.current));
      }
    }, 1000);
  }, [stopTicker]);

  // ── Online handler ─────────────────────────────────────────────────────────
  const handleOnline = useCallback(() => {
    setIsOnline(true);
    setOfflineSince(null);
    setOfflineDuration("0s");
    offlineSinceRef.current = null;
    stopTicker();
    setConnectionInfo(readConnectionInfo());
  }, [stopTicker]);

  // ── Offline handler ────────────────────────────────────────────────────────
  const handleOffline = useCallback(() => {
    const now = Date.now();
    setIsOnline(false);
    setOfflineSince(new Date(now));
    setWasOffline(true);
    offlineSinceRef.current = now;
    setConnectionInfo({ connectionType: "none", effectiveType: undefined });
    startTicker();
  }, [startTicker]);

  // ── Connection change handler (Network Information API) ────────────────────
  const handleConnectionChange = useCallback(() => {
    setConnectionInfo(readConnectionInfo());
  }, []);

  // ── Register/deregister event listeners ───────────────────────────────────
  useEffect(() => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Network Information API — not supported everywhere
    const conn =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    if (conn) {
      conn.addEventListener("change", handleConnectionChange);
    }

    // If the component mounts while already offline, start the ticker
    if (!navigator.onLine) {
      const now = Date.now();
      offlineSinceRef.current = now;
      setOfflineSince(new Date(now));
      setWasOffline(true);
      startTicker();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (conn) {
        conn.removeEventListener("change", handleConnectionChange);
      }
      stopTicker();
    };
  }, [handleOnline, handleOffline, handleConnectionChange, startTicker, stopTicker]);

  return {
    isOnline,
    connectionType: connectionInfo.connectionType,
    effectiveType: connectionInfo.effectiveType,
    offlineSince,
    offlineDuration,
    wasOffline,
  };
};

export default useNetworkStatus;
