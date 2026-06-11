import { useEffect, useMemo, useState } from "react";
import { Bell, BellOff, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  REMINDER_TIMINGS,
  addReminder,
  getEventReminders,
  isPastEvent,
  removeReminder,
  subscribeToReminderChanges,
} from "../../utils/reminderUtils";

const requestBrowserNotificationPermission = async () => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  if (Notification.permission === "default") {
    return Notification.requestPermission();
  }

  return Notification.permission;
};

const ReminderControls = ({ event, canSetReminder, compact = false }) => {
  const [eventReminders, setEventReminders] = useState(() => getEventReminders(event.id));
  const eventHasPassed = useMemo(() => isPastEvent(event), [event]);

  useEffect(() => {
    // Initial sync
    setEventReminders(getEventReminders(event.id));

    return subscribeToReminderChanges(() => {
      // 🔥 FIX 1: Prevent O(N) Render Storms
      // Only update the state if the array data for THIS specific event actually changed.
      setEventReminders((prevReminders) => {
        const newReminders = getEventReminders(event.id);
        if (JSON.stringify(prevReminders) === JSON.stringify(newReminders)) {
          return prevReminders; // Bails out of the React render cycle
        }
        return newReminders;
      });
    });
  }, [event.id]);

  const activeTimingSet = useMemo(
    () => new Set(eventReminders.map((reminder) => reminder.timing)),
    [eventReminders]
  );

  const handleReminderToggle = async (timing) => {
    try {
      if (eventHasPassed) {
        toast("Reminders are not available for past events.", {
          toastId: `reminder-past-${event.id}`,
          className: "custom-toast",
        });
        return;
      }

      if (!canSetReminder) {
        toast("Bookmark or register for this event before setting a reminder.", {
          toastId: `reminder-locked-${event.id}`,
          className: "custom-toast",
        });
        return;
      }

      if (activeTimingSet.has(timing)) {
        removeReminder(event.id, timing);
        toast("Reminder removed.", {
          toastId: `reminder-remove-${event.id}-${timing}`,
          autoClose: 1800,
          className: "custom-toast",
        });
        return;
      }

      const result = addReminder(event, timing);

      if (!result.ok) {
        const messages = {
          duplicate: "That reminder is already active.",
          elapsed: "That reminder time has already passed.",
          past: "Reminders are not available for past events.",
          invalid: "We could not read this event date.",
        };

        toast(messages[result.reason] || "Unable to set reminder.", {
          toastId: `reminder-failed-${event.id}-${timing}`,
          className: "custom-toast",
        });
        return;
      }

      const permission = await requestBrowserNotificationPermission().catch(() => "denied");
      if (permission === "denied") {
        toast("Reminder saved. Browser notifications are blocked in your settings.", {
          toastId: `reminder-browser-denied-${event.id}`,
          autoClose: 2600,
          className: "custom-toast",
        });
      } else {
        toast.success("Reminder saved.", {
          toastId: `reminder-add-${event.id}-${timing}`,
          autoClose: 1800,
          className: "custom-toast",
        });
      }
    } catch (error) {
      console.error("Failed to toggle reminder:", error);
      toast.error("An unexpected error occurred while saving the reminder.", {
        toastId: `reminder-error-${event.id}`,
        className: "custom-toast",
      });
    }
  };

  const baseButtonClass = compact
    ? "inline-flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold transition"
    : "inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition";

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
        {eventReminders.length ? (
          <Bell className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
        ) : (
          <BellOff className="h-4 w-4" />
        )}
        Reminders
      </div>

      <div className="flex flex-wrap gap-2">
        {REMINDER_TIMINGS.map((timing) => {
          const isActive = activeTimingSet.has(timing.value);
          const isDisabled = eventHasPassed;

          return (
            <button
              key={timing.value}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleReminderToggle(timing.value);
              }}
              disabled={isDisabled}
              aria-pressed={isActive}
              title={isDisabled ? "Past events cannot have reminders" : timing.label}
              // 🔥 FIX 2: Added 'disabled:pointer-events-none' to prevent ghost hover states
              className={`${baseButtonClass} disabled:pointer-events-none ${
                isActive
                  ? "border-indigo-300 bg-indigo-600 text-white shadow-sm dark:border-indigo-500"
                  : "border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:text-indigo-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-indigo-500 dark:hover:text-white"
              } ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
            >
              {isActive && <Check className="h-3.5 w-3.5" />}
              {timing.label}
            </button>
          );
        })}
      </div>

      {!canSetReminder && !eventHasPassed && (
        <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
          Bookmark or register for this event to enable reminders.
        </p>
      )}
    </div>
  );
};

export default ReminderControls;