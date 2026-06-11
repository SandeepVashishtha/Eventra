import { useEffect, useState, useMemo } from "react";
import { Clock } from "lucide-react";
import { getServerTime } from "../../utils/timeSync";
import { resolveEventInstant } from "../../utils/timezoneUtils";

/**
 * Resolves the countdown deadline anchored to the event's own timezone so the
 * countdown is identical regardless of the viewer's location. Falls back to
 * naive parsing only when the timezone-aware resolver cannot parse the inputs,
 * preserving behaviour for malformed legacy data.
 *
 * @param {string} date - Event date
 * @param {string} time - Event time
 * @param {string} [timezone] - IANA timezone the event time is expressed in
 * @returns {Date} Deadline instant
 */
const resolveDeadline = (date, time, timezone) => {
  const resolved = resolveEventInstant(date, time, timezone);
  if (resolved) return resolved;

  // Fallback: only attempt naive ISO construction for 24-hour "HH:MM" format.
  // 12-hour strings like "10:00 AM" are not valid ISO 8601 and produce Invalid Date.
  if (time && /^\d{1,2}:\d{2}$/.test(time.trim())) {
    return new Date(`${date}T${time}`);
  }

  return null;
};

const calculateTimeLeft = (deadline) => {
  const diff = new Date(deadline) - getServerTime();
  if (isNaN(diff) || diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

const pad = (n) => String(n).padStart(2, "0");

// Compact version for EventCard
export const CountdownBadge = ({ date, time, timezone }) => {
  const deadline = useMemo(
    () => resolveDeadline(date, time, timezone),
    [date, time, timezone]
  );
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(deadline));

  useEffect(() => {
    let timerId = null;
    timerId = setInterval(() => {
      const remaining = calculateTimeLeft(deadline);
      setTimeLeft(remaining);
      if (!remaining && timerId !== null) {
        clearInterval(timerId);
      }
    }, 1000);
    return () => {
      if (timerId !== null) clearInterval(timerId);
    };
  }, [deadline]);

  if (!timeLeft) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-600 dark:bg-red-900/40 dark:text-red-400">
        Registration Closed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
      <Clock size={11} />
      {timeLeft.days}d {pad(timeLeft.hours)}h {pad(timeLeft.minutes)}m {pad(timeLeft.seconds)}s
    </span>
  );
};

// Large version for EventDetails
const CountdownTimer = ({ date, time, timezone }) => {
  const deadline = useMemo(
    () => resolveDeadline(date, time, timezone),
    [date, time, timezone]
  );
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(deadline));

  useEffect(() => {
    let timerId = null;
    timerId = setInterval(() => {
      const remaining = calculateTimeLeft(deadline);
      setTimeLeft(remaining);
      if (!remaining && timerId !== null) {
        clearInterval(timerId);
      }
    }, 1000);
    return () => {
      if (timerId !== null) clearInterval(timerId);
    };
  }, [deadline]);

  if (!timeLeft) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 dark:border-red-800 dark:bg-red-900/20">
        <span className="text-lg font-bold text-red-600 dark:text-red-400">
          Registration Closed
        </span>
      </div>
    );
  }

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-5 dark:border-indigo-700 dark:from-indigo-950/40 dark:to-gray-800">
      <div className="mb-4 flex items-center gap-2">
        <Clock size={16} className="text-indigo-500" />
        <span className="text-sm font-semibold tracking-wide text-indigo-600 uppercase dark:text-indigo-400">
          Registration Closes In
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {units.map(({ label, value }) => (
          <div
            key={label}
            className="flex flex-col items-center rounded-xl border border-indigo-100 bg-white px-1 py-3 shadow-sm dark:border-indigo-800 dark:bg-gray-900"
          >
            <span className="text-2xl font-bold text-indigo-700 tabular-nums dark:text-indigo-300">
              {pad(value)}
            </span>
            <span className="mt-1 text-[10px] tracking-widest text-gray-500 uppercase dark:text-gray-400">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountdownTimer;