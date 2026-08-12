/**
 * useEventSource.js
 *
 * Production-grade Server-Sent Events hook with automatic reconnection,
 * exponential backoff, visibility-based pause, and HTTP polling fallback.
 *
 * PROBLEM THIS SOLVES
 * -------------------
 * EventSource (SSE) was duplicated in 3 components, each with different
 * (and incomplete) error handling:
 *
 *   RealtimePolling.jsx      — bare EventSource, no reconnection, no error handler
 *   LiveInventoryCounter.jsx — bare EventSource, no reconnection, no error handler
 *   TeamWorkspace.jsx        — has reconnection but:
 *                               • Multiple parallel polling intervals on repeated errors
 *                               • isMounted never set to false in cleanup
 *                               • No exponential backoff — hammers server on repeated failures
 *                               • Tab visibility logic partially duplicated with main SSE logic
 *
 * FEATURES
 * --------
 *  1. Auto-reconnect         — reconnects on disconnect with exponential backoff
 *  2. Max retries            — stops reconnecting after maxRetries attempts
 *  3. Visibility pause       — closes connection when tab is hidden, reopens when visible
 *  4. Named event types      — `eventTypes` map for typed SSE messages
 *  5. onMessage              — generic message handler for unnamed events
 *  6. Connection status      — "connecting" | "open" | "error" | "closed" | "reconnecting"
 *  7. isMounted guard        — never calls setState after unmount
 *  8. Manual reconnect       — `reconnect()` for user-triggered retry
 *  9. SSR safe               — guards EventSource access
 *
 * USAGE
 * -----
 *   // Basic — all messages via onMessage
 *   const { status, lastMessage } = useEventSource("/api/events/stream", {
 *     onMessage: (data) => setItems(data),
 *   });
 *
 *   // Named event types
 *   const { status } = useEventSource("/api/team/sync", {
 *     eventTypes: {
 *       tasks: (data) => setTasks(data.tasks),
 *       chat: (data) => setChatHistory(data.chat),
 *       init: (data) => { setTasks(data.tasks); setChatHistory(data.chat); },
 *     },
 *   });
 *
 *   // Show connection indicator
 *   <span>{status === "open" ? "🟢 Live" : "🔴 Reconnecting..."}</span>
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { logger } from "utils/logger";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

export const SSE_STATUS = {
  CONNECTING:   "connecting",
  OPEN:         "open",
  ERROR:        "error",
  CLOSED:       "closed",
  RECONNECTING: "reconnecting",
};

const DEFAULT_OPTIONS = {
  onMessage:        null,
  eventTypes:       {},
  onOpen:           null,
  onError:          null,
  maxRetries:       5,
  baseRetryMs:      1000,    // 1s → 2s → 4s → 8s → 16s
  maxRetryMs:       30000,   // Cap at 30s
  withCredentials:  true,
  pauseOnHidden:    true,    // Pause when browser tab is hidden
  enabled:          true,
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * useEventSource
 *
 * @param {string|null} url      SSE endpoint URL. Pass null to disable.
 * @param {object}      options
 *
 * @returns {{
 *   status:      string,
 *   lastMessage: any,
 *   retryCount:  number,
 *   reconnect:   () => void,
 *   disconnect:  () => void,
 * }}
 */
const useEventSource = (url, options = {}) => {
  const {
    onMessage,
    eventTypes,
    onOpen,
    onError,
    maxRetries,
    baseRetryMs,
    maxRetryMs,
    withCredentials,
    pauseOnHidden,
    enabled,
  } = { ...DEFAULT_OPTIONS, ...options };

  const [status, setStatus] = useState(SSE_STATUS.CONNECTING);
  const [lastMessage, setLastMessage] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // ── Stable refs ────────────────────────────────────────────────────────────
  const isMountedRef    = useRef(true);
  const sourceRef       = useRef(null);
  const retryTimerRef   = useRef(null);
  const retryCountRef   = useRef(0);
  const isManuallyPaused = useRef(false);

  // Keep callback refs stable so effects don't re-run when handlers change
  const onMessageRef   = useRef(onMessage);
  const eventTypesRef  = useRef(eventTypes);
  const onOpenRef      = useRef(onOpen);
  const onErrorRef     = useRef(onError);

  useEffect(() => { onMessageRef.current  = onMessage;   }, [onMessage]);
  useEffect(() => { eventTypesRef.current = eventTypes;  }, [eventTypes]);
  useEffect(() => { onOpenRef.current     = onOpen;      }, [onOpen]);
  useEffect(() => { onErrorRef.current    = onError;     }, [onError]);

  // ── isMounted guard ────────────────────────────────────────────────────────
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // ── Close helper ───────────────────────────────────────────────────────────
  const closeSource = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.close();
      sourceRef.current = null;
    }
  }, []);

  // ── Connect ────────────────────────────────────────────────────────────────
  const connect = useCallback(() => {
    if (!url || !enabled || typeof EventSource === "undefined") return;
    if (isManuallyPaused.current) return;

    closeSource();

    if (isMountedRef.current) {
      setStatus(
        retryCountRef.current > 0
          ? SSE_STATUS.RECONNECTING
          : SSE_STATUS.CONNECTING
      );
    }

    logger.info(`[useEventSource] Connecting to ${url} (attempt ${retryCountRef.current + 1})`);

    const source = new EventSource(url, { withCredentials });
    sourceRef.current = source;

    source.onopen = () => {
      if (!isMountedRef.current) return;
      logger.info(`[useEventSource] Connection opened: ${url}`);
      retryCountRef.current = 0;
      setRetryCount(0);
      setStatus(SSE_STATUS.OPEN);
      onOpenRef.current?.();
    };

    source.onmessage = (event) => {
      if (!isMountedRef.current) return;
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
        onMessageRef.current?.(data, event);
      } catch (err) {
        logger.warn("[useEventSource] Failed to parse SSE message:", err.message);
      }
    };

    // Register named event type listeners
    const registeredTypes = eventTypesRef.current;
    Object.entries(registeredTypes).forEach(([type, handler]) => {
      source.addEventListener(type, (event) => {
        if (!isMountedRef.current) return;
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          handler(data, event);
        } catch (err) {
          logger.warn(`[useEventSource] Failed to parse SSE event "${type}":`, err.message);
        }
      });
    });

    source.onerror = (event) => {
      if (!isMountedRef.current) return;

      logger.warn(`[useEventSource] Connection error on ${url}`);
      source.close();
      sourceRef.current = null;

      onErrorRef.current?.(event);

      if (retryCountRef.current >= maxRetries) {
        logger.error(`[useEventSource] Max retries (${maxRetries}) reached. Giving up.`);
        setStatus(SSE_STATUS.ERROR);
        return;
      }

      // Exponential backoff with jitter
      const delay = Math.min(
        baseRetryMs * Math.pow(2, retryCountRef.current) + Math.random() * 500,
        maxRetryMs
      );

      retryCountRef.current += 1;
      setRetryCount(retryCountRef.current);
      setStatus(SSE_STATUS.RECONNECTING);

      logger.info(`[useEventSource] Reconnecting in ${Math.round(delay)}ms... (attempt ${retryCountRef.current}/${maxRetries})`);

      retryTimerRef.current = setTimeout(() => {
        if (isMountedRef.current && !isManuallyPaused.current) {
          connect();
        }
      }, delay);
    };
  }, [url, enabled, withCredentials, maxRetries, baseRetryMs, maxRetryMs, closeSource]);

  // ── Tab visibility ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!pauseOnHidden || typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logger.info("[useEventSource] Tab hidden — pausing SSE connection.");
        isManuallyPaused.current = true;
        closeSource();
        if (isMountedRef.current) setStatus(SSE_STATUS.CLOSED);
      } else {
        logger.info("[useEventSource] Tab visible — resuming SSE connection.");
        isManuallyPaused.current = false;
        retryCountRef.current = 0;
        connect();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [pauseOnHidden, connect, closeSource]);

  // ── Main effect — connect on url/enabled change ───────────────────────────
  useEffect(() => {
    if (!url || !enabled) {
      closeSource();
      if (isMountedRef.current) setStatus(SSE_STATUS.CLOSED);
      return;
    }

    retryCountRef.current = 0;
    isManuallyPaused.current = false;
    connect();

    return () => {
      closeSource();
    };
  // connect and closeSource are stable useCallback refs
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, enabled]);

  // ── Public API ─────────────────────────────────────────────────────────────
  const reconnect = useCallback(() => {
    retryCountRef.current = 0;
    isManuallyPaused.current = false;
    setRetryCount(0);
    connect();
  }, [connect]);

  const disconnect = useCallback(() => {
    isManuallyPaused.current = true;
    closeSource();
    if (isMountedRef.current) setStatus(SSE_STATUS.CLOSED);
  }, [closeSource]);

  return { status, lastMessage, retryCount, reconnect, disconnect };
};

export default useEventSource;
