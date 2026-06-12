import { useRef, useEffect } from "react";
import { AlertTriangle, Clock, Calendar, X, ArrowRight, Globe } from "lucide-react";
import { formatTimeRange } from "../utils/conflictDetection";
import { getUserTimezone } from "../utils/timezoneUtils";
import { useFocusTrap } from "../hooks/useFocusTrap";

/**
 * EventConflictModal
 *
 * A modal component that displays a warning when a user tries to register
 * for an event that conflicts with their existing registrations.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {object} props.newEvent - The event the user is trying to register for
 * @param {Array} props.conflictingEvents - Array of events that conflict
 * @param {Array} props.suggestedEvents - Array of alternative event suggestions
 * @param {Function} props.onCancel - Callback when user cancels registration
 * @param {Function} props.onProceed - Callback when user proceeds despite conflict
 * @param {Function} props.onSelectAlternative - Callback when user selects an alternative event
 * @param {boolean} props.strictMode - If true, blocks registration (no proceed option)
 */
import ErrorBoundary from "./common/ErrorBoundary";

const EventConflictModal = ({
  isOpen,
  newEvent,
  conflictingEvents = [],
  suggestedEvents = [],
  onCancel,
  onProceed,
  onSelectAlternative,
  strictMode = false,
}) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  const userTimezone = getUserTimezone();
  const { containerRef: focusTrapRef } = useFocusTrap(isOpen, onCancel);

  // 🔥 FIX: Added scroll lock to prevent background page from scrolling behind the modal
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
    } else {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    }
    return () => {
      // Restore focus if the component is unmounted while open
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onCancelRef.current();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // 🔥 FIX: Safe date formatter to prevent RangeError crashes if event data is malformed
  const safeFormatDate = (dateStr) => {
    if (!dateStr) return "TBD";
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? "TBD"
      : d.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal Content */}
      <div
        ref={(node) => {
          modalRef.current = node;
          // Merge refs so useFocusTrap can also track the container
          if (typeof focusTrapRef === "function") focusTrapRef(node);
          else if (focusTrapRef) focusTrapRef.current = node;
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-800"
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          aria-label="Close conflict dialog"
          className="absolute top-4 right-4 rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>

        {/* Header */}
        <div className="border-b border-gray-200 p-6 dark:border-gray-700">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/30">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 id="modal-title" className="text-2xl font-bold text-gray-900 dark:text-white">
                Scheduling Conflict Detected
              </h2>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                This event overlaps with one or more events you&apos;ve already registered for.
              </p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Globe className="h-3 w-3" />
                Times shown in: <strong>{userTimezone}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-6 p-6">
          {/* New Event Details */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
              Event You&apos;re Trying to Register For
            </h3>
            <div className="text-blue-800 dark:text-blue-200">
              <p className="text-lg font-medium">{newEvent?.title}</p>
              <div className="mt-2 flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {/* 🔥 FIX: Safely parse date */}
                  {safeFormatDate(newEvent?.date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatTimeRange(
                    newEvent?.time,
                    newEvent?.durationMinutes || 60,
                    newEvent?.date,
                    userTimezone
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Conflicting Events */}
          <div>
            <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
              Conflicting Event{conflictingEvents.length > 1 ? "s" : ""}
            </h3>
            <div className="space-y-3">
              {conflictingEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
                >
                  <p className="font-medium text-red-900 dark:text-red-100">{event.title}</p>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-red-700 dark:text-red-300">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {/* 🔥 FIX: Safely parse date */}
                      {safeFormatDate(event.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatTimeRange(
                        event.time,
                        event.durationMinutes || 60,
                        event.date,
                        userTimezone
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alternative Suggestions */}
          {suggestedEvents.length > 0 && (
            <div>
              <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
                Suggested Alternatives
              </h3>
              <div className="space-y-3">
                {suggestedEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => onSelectAlternative?.(event)}
                    aria-label={`Select alternative event: ${event.title}`}
                    className="group w-full rounded-xl border border-green-200 bg-green-50 p-4 text-left transition-colors hover:bg-green-100 dark:border-green-800 dark:bg-green-900/20 dark:hover:bg-green-900/30"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-900 group-hover:text-green-800 dark:text-green-100 dark:group-hover:text-green-200">
                          {event.title}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-green-700 dark:text-green-300">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {/* 🔥 FIX: Safely parse date */}
                            {safeFormatDate(event.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatTimeRange(
                              event.time,
                              event.durationMinutes || 60,
                              event.date,
                              userTimezone
                            )}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-green-600 transition-transform group-hover:translate-x-1 dark:text-green-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-gray-200 p-6 dark:border-gray-700">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border-2 border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            aria-label="Cancel registration"
          >
            Cancel Registration
          </button>
          {!strictMode && (
            <button
              onClick={onProceed}
              className="flex-1 rounded-lg bg-amber-500 px-6 py-3 font-medium text-white transition-colors hover:bg-amber-600"
              aria-label="Proceed with registration despite conflict"
            >
              Proceed Anyway
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function SafeEventConflictModal(props) {
  return (
    <ErrorBoundary level="feature" label="Event Conflict Modal">
      <EventConflictModal {...props} />
    </ErrorBoundary>
  );
}
