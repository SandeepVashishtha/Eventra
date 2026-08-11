/**
 * useCountdown.js
 *
 * Centralised countdown timer hook replacing 7 duplicate implementations.
 *
 * PROBLEM THIS SOLVES
 * -------------------
 * The same countdown pattern was duplicated across 7 files:
 *
 *   EventCountdown.js         — own calculateTimeLeft, no isMounted guard
 *   GSSoCContribution.js      — local useCountdown, same logic
 *   HackathonCard.js          — local useCountdown, uses getServerTime()
 *   FraudProofTicketing.jsx   — simple seconds-only countdown
 *   WaitlistPromotionBanner   — string-based output
 *   PomodoroTimer.jsx         — seconds-based with pause/resume
 *   CountdownTimer.jsx        — two variants (badge + card)
 *
 * Problems:
 *  1. None are coordinated — 7 separate setInterval calls tick independently
 *  2. 3 of 7 use plain `new Date()` instead of `getServerTime()` — vulnerable
 *     to client clock manipulation
 *  3. `EventCountdown.js` has no isMounted guard — setState after unmount
 *  4. `GSSoCContribution.js` uses `new Date()` — differs from HackathonCard
 *     which uses `getServerTime()` — inconsistent across the same page
 *  5. Each defines its own `calculateTimeLeft` function
 *
 * FEATURES
 * --------
 *  1. Server time   — uses `getServerTime()` from timeSync.js (where available)
 *  2. onEnd cb      — stable callback via ref, called exactly once when expired
 *  3. isMounted     — never calls setState after unmount
 *  4. Pause/resume  — optional for PomodoroTimer use case
 *  5. Seconds mode  — optional for FraudProofTicketing use case
 *  6. ended flag    — consumers can show "Event started" instead of 00:00:00
 *
 * USAGE
 * -----
 *   // Basic countdown to a date
 *   const { days, hours, minutes, seconds, ended } = useCountdown("2026-12-31T23:59:59Z");
 *
 *   // With onEnd callback
 *   const timer = useCountdown(deadline, { onEnd: () => toast.info("Event started!") });
 *
 *   // Seconds-only (for QR refresh / OTP timers)
 *   const { seconds, ended } = useCountdown(null, { totalSeconds: 15, loop: true });
 *
 *   // Pausable (for Pomodoro)
 *   const { seconds, paused, pause, resume, reset } = useCountdown(null, {
 *     totalSeconds: 25 * 60,
 *     pausable: true,
 *   });
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Time source
// ─────────────────────────────────────────────────────────────────────────────

let getTime;
try {
  // Use getServerTime when available — prevents client clock manipulation
  const { getServerTime } = require("utils/timeSync");
  getTime = getServerTime;
} catch {
  getTime = () => new Date();
}

// ─────────────────────────────────────────────────────────────────────────────
// Calculate time remaining to a deadline
// ─────────────────────────────────────────────────────────────────────────────

const calculateTimeLeft = (deadline) => {
  if (!deadline) return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true, total: 0 };

  const now = getTime();
  const end = deadline instanceof Date ? deadline : new Date(deadline);
  const diff = end - now;

  if (isNaN(diff) || diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true, total: 0 };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    ended: false,
    total: diff,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * useCountdown
 *
 * @param {string|Date|null} deadline     Target date/time (ISO string or Date)
 * @param {object}           [options]
 * @param {Function}         [options.onEnd]          Called once when countdown ends
 * @param {number}           [options.totalSeconds]   Seconds-only mode (ignores deadline)
 * @param {boolean}          [options.loop=false]     Auto-restart when totalSeconds reaches 0
 * @param {boolean}          [options.pausable=false] Enable pause/resume/reset controls
 * @param {boolean}          [options.enabled=true]   Skip countdown when false
 *
 * @returns {{
 *   days:    number,
 *   hours:   number,
 *   minutes: number,
 *   seconds: number,
 *   ended:   boolean,
 *   total:   number,   // ms remaining (0 in seconds mode)
 *   paused:  boolean,  // only when pausable=true
 *   pause:   Function, // only when pausable=true
 *   resume:  Function, // only when pausable=true
 *   reset:   Function, // only when pausable=true
 * }}
 */
const useCountdown = (deadline, options = {}) => {
  const {
    onEnd,
    totalSeconds,
    loop = false,
    pausable = false,
    enabled = true,
  } = options;

  const isSecondsMode = totalSeconds !== undefined;

  // ── State ────────────────────────────────────────────────────────────────
  const [timeLeft, setTimeLeft] = useState(() =>
    isSecondsMode
      ? { days: 0, hours: 0, minutes: 0, seconds: totalSeconds, ended: false, total: 0 }
      : calculateTimeLeft(deadline)
  );
  const [paused, setPaused] = useState(false);

  // ── Refs ─────────────────────────────────────────────────────────────────
  const isMountedRef = useRef(true);
  const onEndRef = useRef(onEnd);
  const remainingSecondsRef = useRef(totalSeconds ?? 0);
  const hasFiredOnEndRef = useRef(false);

  useEffect(() => { onEndRef.current = onEnd; }, [onEnd]);
  useEffect(() => { isMountedRef.current = true; return () => { isMountedRef.current = false; }; }, []);

  // ── Seconds mode interval ────────────────────────────────────────────────
  useEffect(() => {
    if (!isSecondsMode || !enabled || paused) return;

    const tick = () => {
      if (!isMountedRef.current) return;
      remainingSecondsRef.current -= 1;

      if (remainingSecondsRef.current <= 0) {
        if (!hasFiredOnEndRef.current) {
          hasFiredOnEndRef.current = true;
          onEndRef.current?.();
        }
        if (loop) {
          remainingSecondsRef.current = totalSeconds;
          hasFiredOnEndRef.current = false;
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: totalSeconds, ended: false, total: 0 });
        } else {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, ended: true, total: 0 });
        }
        return;
      }

      setTimeLeft({
        days: 0,
        hours: 0,
        minutes: Math.floor(remainingSecondsRef.current / 60),
        seconds: remainingSecondsRef.current % 60,
        ended: false,
        total: 0,
      });
    };

    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isSecondsMode, enabled, paused, loop, totalSeconds]);

  // ── Deadline mode interval ────────────────────────────────────────────────
  useEffect(() => {
    if (isSecondsMode || !enabled || paused) return;
    if (!deadline) return;

    const tick = () => {
      if (!isMountedRef.current) return;
      const next = calculateTimeLeft(deadline);
      setTimeLeft(next);

      if (next.ended && !hasFiredOnEndRef.current) {
        hasFiredOnEndRef.current = true;
        onEndRef.current?.();
      }
    };

    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline, isSecondsMode, enabled, paused]);

  // Reset hasFiredOnEnd when deadline changes
  useEffect(() => {
    hasFiredOnEndRef.current = false;
    if (!isSecondsMode) {
      setTimeLeft(calculateTimeLeft(deadline));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deadline]);

  // ── Pausable controls ────────────────────────────────────────────────────
  const pause = useCallback(() => setPaused(true), []);
  const resume = useCallback(() => setPaused(false), []);
  const reset = useCallback(() => {
    hasFiredOnEndRef.current = false;
    if (isSecondsMode) {
      remainingSecondsRef.current = totalSeconds;
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: totalSeconds, ended: false, total: 0 });
    } else {
      setTimeLeft(calculateTimeLeft(deadline));
    }
    setPaused(false);
  }, [isSecondsMode, totalSeconds, deadline]);

  return {
    ...timeLeft,
    ...(pausable ? { paused, pause, resume, reset } : {}),
  };
};

export default useCountdown;
