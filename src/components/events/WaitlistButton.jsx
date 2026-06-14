/**
 * WaitlistButton
 *
 * A fully-accessible, animated button that lets users join or leave
 * an event waitlist. Works alongside the `useWaitlist` hook.
 *
 * Props:
 *  - eventId       {string|number}  - The event ID
 *  - capacity      {number}         - Total event capacity
 *  - attendees     {number}         - Current attendee count
 *  - className     {string}         - Extra Tailwind classes for the wrapper
 */

import useWaitlist from "../../hooks/useWaitlist";
import { Loader2, ListOrdered, X, Clock } from "lucide-react";

export default function WaitlistButton({
  eventId,
  capacity,
  attendees,
  className = "",
}) {
  const {
    isOnWaitlist,
    position,
    estimatedWait,
    isLoading,
    error,
    join,
    leave,
  } = useWaitlist(eventId, { capacity, attendees });

  const isFull =
    typeof capacity === "number" &&
    typeof attendees === "number" &&
    attendees >= capacity;

  // Do not render if the event still has open slots
  if (!isFull && !isOnWaitlist) return null;

  return (
    <div className={`flex flex-col items-start gap-2 ${className}`}>
      {/* Position badge */}
      {isOnWaitlist && position && (
        <div
          className="flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300"
          role="status"
          aria-live="polite"
        >
          <ListOrdered className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Waitlist position: #{position}
          {estimatedWait && (
            <span className="flex items-center gap-1 ml-1 text-amber-600 dark:text-amber-400">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {estimatedWait}
            </span>
          )}
        </div>
      )}

      {/* Action button */}
      <button
        onClick={isOnWaitlist ? leave : join}
        disabled={isLoading}
        aria-busy={isLoading}
        aria-label={isOnWaitlist ? "Leave waitlist for this event" : "Join waitlist for this event"}
        className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed ${
          isOnWaitlist
            ? "bg-rose-50 dark:bg-rose-900/20 border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 focus-visible:ring-rose-400"
            : "bg-amber-500 hover:bg-amber-600 text-white focus-visible:ring-amber-400"
        }`}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : isOnWaitlist ? (
          <X className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ListOrdered className="h-4 w-4" aria-hidden="true" />
        )}
        {isLoading
          ? isOnWaitlist
            ? "Leaving…"
            : "Joining…"
          : isOnWaitlist
          ? "Leave Waitlist"
          : "Join Waitlist"}
      </button>

      {/* Error message */}
      {error && (
        <p
          className="text-xs text-rose-600 dark:text-rose-400 font-medium"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </p>
      )}

      {/* Event full notice (when not on waitlist) */}
      {isFull && !isOnWaitlist && (
        <p className="text-xs text-slate-500 dark:text-gray-400">
          This event is full. Join the waitlist to be notified if a spot opens.
        </p>
      )}
    </div>
  );
}
