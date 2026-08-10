import React from "react";
import { normalizeEventAvailability } from "../../utils/eventAvailabilityUtils.mjs";

/**
 * @typedef {Object} SeatsRemainingProps
 * @property {number} [capacity] - Total number of seats for the event.
 * @property {number} [registered] - Number of confirmed registrations.
 * @property {boolean} [compact] - When true, renders a compact single-line
 *   indicator suited for event cards / grids. Defaults to false.
 * @property {boolean} [showProgressBar] - Show the filled-progress bar.
 *   Defaults to true for the standard (non-compact) layout.
 * @property {string} [className] - Extra CSS classes applied to the root.
 */

const STATUS_TONE = {
  available: "text-emerald-600 dark:text-emerald-400",
  low: "text-amber-600 dark:text-amber-400",
  full: "text-rose-600 dark:text-rose-400",
};

/**
 * toneFor derives the urgency tone based on how many seats remain.
 * @param {number|null} capacity
 * @param {number} registeredCount
 * @returns {"available"|"low"|"full"}
 */
export function toneFor(capacity, registeredCount) {
  if (capacity == null) return "available";
  const remaining = capacity - registeredCount;
  if (remaining <= 0) return "full";
  if (remaining <= Math.max(5, Math.ceil(capacity * 0.1))) return "low";
  return "available";
}

/**
 * SeatsRemaining renders a live event seat-availability indicator.
 *
 * It displays the number of remaining seats (e.g. "47 of 200 seats remaining")
 * and an optional filled progress bar that conveys how full the event is. The
 * component consumes already-normalised availability data so it can be fed
 * directly from the REST availability endpoint or the real-time SSE stream.
 *
 * When `capacity` is undefined/null the event has unlimited capacity, so the
 * component renders nothing (there is no meaningful seat count to show).
 */
const SeatsRemaining = ({
  capacity,
  registered,
  compact = false,
  showProgressBar,
  className = "",
  ...rest
}) => {
  const { capacity: normCapacity, registeredCount } = normalizeEventAvailability({
    capacity,
    registeredCount: registered,
  });

  // Unlimited capacity — no meaningful seat count to display.
  if (normCapacity == null) {
    return null;
  }

  const remaining = Math.max(normCapacity - (registeredCount ?? 0), 0);
  const percentage = Math.min(Math.round(((registeredCount ?? 0) / normCapacity) * 100), 100);
  const tone = toneFor(normCapacity, registeredCount ?? 0);
  const isFull = remaining <= 0;

  const barVisible = showProgressBar !== undefined ? showProgressBar : !compact;

  const label = isFull ? "Fully booked" : `${remaining} of ${normCapacity} seats remaining`;

  return (
    <div
      className={`seats-remaining ${compact ? "seats-remaining--compact" : ""} ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label}
      {...rest}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`text-sm font-medium ${STATUS_TONE[tone]}`}>{label}</span>
        {!compact && (
          <span className="text-xs text-gray-400 dark:text-gray-500">{percentage}% filled</span>
        )}
      </div>

      {barVisible && (
        <div
          className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
          aria-hidden="true"
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isFull ? "bg-rose-500" : tone === "low" ? "bg-amber-500" : "bg-emerald-500"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(SeatsRemaining);
