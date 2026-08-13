/**
 * useIdleDetection.js
 *
 * Detects user inactivity and calls configurable callbacks on idle/active
 * transitions. Throttles activity events to prevent CPU thrashing.
 *
 * PROBLEM THIS SOLVES
 * -------------------
 * Idle/activity detection was duplicated in SessionRecoveryContext.js:
 *
 *   - `lastActivityRef` + `lastActivity` useState — two sources of truth
 *   - `updateActivity` callback with 1s throttle (good) but tied to context
 *   - Activity events (mousemove, keydown, click, scroll) registered inside
 *     SessionRecoveryContext — these should be a standalone hook
 *   - Session timeout check runs every 60s via setInterval — separate from
 *     the activity tracking, meaning the timeout is only checked once/minute
 *     rather than immediately when idle threshold is crossed
 *
 * Other components that need idle detection (AdminDashboard, LiveEventDashboard)
 * have no access to this logic and would need to re-implement it.
 *
 * FEATURES
 * --------
 *  1. Throttled events   — activity events throttled to max once per second
 *  2. onIdle callback    — called when user has been inactive for `idleMs`
 *  3. onActive callback  — called when user returns from idle state
 *  4. isIdle             — reactive boolean
 *  5. lastActiveAt       — Date of last detected activity
 *  6. idleFor            — ms elapsed since last activity
 *  7. reset()            — manually reset idle timer (e.g. after API call)
 *  8. Configurable events — defaults: mousemove, keydown, click, touchstart, scroll
 *  9. SSR safe           — guards all window/document access
 *
 * USAGE
 * -----
 *   // Auto-logout after 30 minutes idle
 *   const { isIdle, lastActiveAt } = useIdleDetection({
 *     idleMs: 30 * 60 * 1000,
 *     onIdle: () => logout(),
 *     onActive: () => logger.info("User returned"),
 *   });
 *
 *   // Show warning after 25 minutes, logout after 30
 *   const { isIdle, reset } = useIdleDetection({
 *     idleMs: 25 * 60 * 1000,
 *     onIdle: () => setShowWarning(true),
 *   });
 *   // When user clicks "Stay logged in":
 *   const handleStayLoggedIn = () => { reset(); setShowWarning(false); };
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_EVENTS = [
  "mousemove",
  "keydown",
  "mousedown",
  "touchstart",
  "scroll",
  "wheel",
];

const DEFAULT_OPTIONS = {
  idleMs:        30 * 60 * 1000, // 30 minutes
  throttleMs:    1_000,           // throttle activity events to 1/s
  onIdle:        null,
  onActive:      null,
  events:        DEFAULT_EVENTS,
  enabled:       true,
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * useIdleDetection
 *
 * @param {object}   options
 * @param {number}   [options.idleMs=1800000]    Idle threshold in ms
 * @param {number}   [options.throttleMs=1000]   Activity event throttle in ms
 * @param {Function} [options.onIdle]            Called once when user goes idle
 * @param {Function} [options.onActive]          Called when user returns from idle
 * @param {string[]} [options.events]            DOM events that count as activity
 * @param {boolean}  [options.enabled=true]      Disable detection without unmounting
 *
 * @returns {{
 *   isIdle:       boolean,
 *   lastActiveAt: Date,
 *   idleFor:      number,   // ms since last activity (updated every second)
 *   reset:        () => void,
 * }}
 */
const useIdleDetection = (options = {}) => {
  const {
    idleMs,
    throttleMs,
    onIdle,
    onActive,
    events,
    enabled,
  } = { ...DEFAULT_OPTIONS, ...options };

  const [isIdle, setIsIdle] = useState(false);
  const [lastActiveAt, setLastActiveAt] = useState(() => new Date());
  const [idleFor, setIdleFor] = useState(0);

  const isMountedRef     = useRef(true);
  const isIdleRef        = useRef(false);
  const lastActivityRef  = useRef(Date.now());
  const lastThrottleRef  = useRef(0);

  // Stable callback refs so listeners don't re-register on every render
  const onIdleRef   = useRef(onIdle);
  const onActiveRef = useRef(onActive);
  useEffect(() => { onIdleRef.current  = onIdle;  }, [onIdle]);
  useEffect(() => { onActiveRef.current = onActive; }, [onActive]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // ── Activity handler ──────────────────────────────────────────────────────
  const handleActivity = useCallback(() => {
    if (!enabled) return;

    const now = Date.now();

    // Throttle — ignore events that arrive within throttleMs of each other
    if (now - lastThrottleRef.current < throttleMs) return;
    lastThrottleRef.current = now;
    lastActivityRef.current = now;

    if (!isMountedRef.current) return;

    setLastActiveAt(new Date(now));
    setIdleFor(0);

    // If previously idle — fire onActive callback once
    if (isIdleRef.current) {
      isIdleRef.current = false;
      setIsIdle(false);
      onActiveRef.current?.();
    }
  }, [enabled, throttleMs]);

  // ── Register/deregister activity listeners ────────────────────────────────
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const targetEvents = events?.length ? events : DEFAULT_EVENTS;

    targetEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      targetEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [enabled, events, handleActivity]);

  // ── Idle checker — runs every second ─────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      if (!isMountedRef.current) return;

      const elapsed = Date.now() - lastActivityRef.current;
      setIdleFor(elapsed);

      if (elapsed >= idleMs && !isIdleRef.current) {
        isIdleRef.current = true;
        setIsIdle(true);
        onIdleRef.current?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled, idleMs]);

  // ── reset ─────────────────────────────────────────────────────────────────
  /**
   * Manually reset the idle timer. Call this after a programmatic action
   * (e.g. API call, auto-save) that indicates the user is still active.
   */
  const reset = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    lastThrottleRef.current = now;
    isIdleRef.current = false;

    if (isMountedRef.current) {
      setIsIdle(false);
      setLastActiveAt(new Date(now));
      setIdleFor(0);
    }
  }, []);

  return { isIdle, lastActiveAt, idleFor, reset };
};

export default useIdleDetection;
