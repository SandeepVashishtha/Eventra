import {
  Bell,
  BellOff,
  CalendarClock,
  Check,
  Clock3,
  Info,
  Save,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const DEFAULT_REMINDERS = [
  {
    id: "7-days",
    label: "7 days before",
    days: 7,
    description:
      "Get an early reminder about the registration deadline.",
  },
  {
    id: "3-days",
    label: "3 days before",
    days: 3,
    description:
      "Receive a reminder as the deadline gets closer.",
  },
  {
    id: "24-hours",
    label: "24 hours before",
    days: 1,
    description:
      "Get a final reminder before registration closes.",
  },
];

const DEFAULT_STORAGE_KEY =
  "eventra-registration-deadline-notifications";

const EventRegistrationDeadlineNotifications = ({
  event = {},
  reminders = DEFAULT_REMINDERS,
  initialEnabled = [],
  storageKey = DEFAULT_STORAGE_KEY,
  onSave,
  onReminderChange,
  className = "",
}) => {
  const normalizedEvent = useMemo(
    () => normalizeEvent(event),
    [event]
  );

  const normalizedReminders = useMemo(
    () =>
      Array.isArray(reminders)
        ? reminders.map(normalizeReminder)
        : DEFAULT_REMINDERS,
    [reminders]
  );

  const [enabledReminders, setEnabledReminders] =
    useState(() => {
      const saved = loadPreferences(storageKey);

      if (saved.length > 0) {
        return new Set(saved);
      }

      return new Set(
        initialEnabled.length > 0
          ? initialEnabled.map(String)
          : normalizedReminders.map(
              (reminder) => reminder.id
            )
      );
    });

  const [saved, setSaved] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const deadlineInfo = useMemo(
    () =>
      calculateDeadlineInfo(
        normalizedEvent.registrationDeadline
      ),
    [normalizedEvent.registrationDeadline]
  );

  const registrationOpen =
    normalizedEvent.registrationOpen &&
    !deadlineInfo.expired;

  useEffect(() => {
    const validIds = new Set(
      normalizedReminders.map(
        (reminder) => reminder.id
      )
    );

    setEnabledReminders((current) => {
      return new Set(
        [...current].filter((id) =>
          validIds.has(id)
        )
      );
    });
  }, [normalizedReminders]);

  const toggleReminder = (
    reminderId
  ) => {
    setMessage("");
    setSaved(false);

    setEnabledReminders((current) => {
      const next = new Set(current);

      if (next.has(reminderId)) {
        next.delete(reminderId);
      } else {
        next.add(reminderId);
      }

      onReminderChange?.(
        reminderId,
        next.has(reminderId)
      );

      return next;
    });
  };

  const savePreferences = () => {
    const values =
      Array.from(enabledReminders);

    savePreferencesToStorage(
      storageKey,
      values
    );

    setSaved(true);

    setMessage(
      registrationOpen
        ? "Registration deadline notification preferences saved."
        : "Preferences saved. Reminders will remain inactive while registration is closed."
    );

    onSave?.({
      eventId:
        normalizedEvent.id,
      enabledReminders: values,
      registrationDeadline:
        normalizedEvent.registrationDeadline,
      registrationOpen,
    });
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <Bell
              size={20}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Registration Reminder
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Registration Deadline Notifications
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              Choose when you want to be reminded before
              registration closes.
            </p>
          </div>
        </div>

        <RegistrationStatus
          open={registrationOpen}
          expired={deadlineInfo.expired}
          deadlineMissing={
            !normalizedEvent.registrationDeadline
          }
        />
      </div>

      {/* Event information */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
              Event
            </p>

            <h3 className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
              {normalizedEvent.title}
            </h3>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-950">
            <CalendarClock
              size={17}
              className="text-indigo-500"
            />

            <div>
              <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
                Registration Deadline
              </p>

              <p className="mt-1 text-xs font-bold text-slate-700 dark:text-slate-200">
                {normalizedEvent.registrationDeadline
                  ? formatDateTime(
                      normalizedEvent.registrationDeadline
                    )
                  : "Not provided"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Countdown */}
      {normalizedEvent.registrationDeadline && (
        <DeadlineCountdown
          deadlineInfo={deadlineInfo}
        />
      )}

      {/* Registration closed warning */}
      {!registrationOpen && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-900/10">
          <TriangleAlert
            size={17}
            className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
          />

          <div>
            <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
              {deadlineInfo.expired
                ? "Registration deadline has passed."
                : "Registration is currently closed."}
            </p>

            <p className="mt-1 text-[10px] leading-4 text-amber-700 dark:text-amber-400">
              Deadline reminders will not be sent while
              registration is closed.
            </p>
          </div>
        </div>
      )}

      {/* Reminder options */}
      <div className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Reminder Schedule
            </h3>

            <p className="mt-1 text-[10px] text-slate-400">
              Select the reminders you want to receive.
            </p>
          </div>

          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[9px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            {enabledReminders.size} selected
          </span>
        </div>

        <div className="mt-4 grid gap-3">
          {normalizedReminders.map(
            (reminder) => {
              const enabled =
                enabledReminders.has(
                  reminder.id
                );

              const reminderPossible =
                isReminderPossible(
                  normalizedEvent.registrationDeadline,
                  reminder.days
                );

              return (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  enabled={enabled}
                  disabled={
                    !registrationOpen ||
                    !reminderPossible
                  }
                  onToggle={() =>
                    toggleReminder(
                      reminder.id
                    )
                  }
                />
              );
            }
          )}
        </div>
      </div>

      {/* Information */}
      <div className="mt-5 flex items-start gap-2 rounded-xl border border-indigo-100 bg-indigo-50 p-3 dark:border-indigo-900/30 dark:bg-indigo-900/10">
        <Info
          size={14}
          className="mt-0.5 shrink-0 text-indigo-500"
        />

        <p className="text-[10px] leading-4 text-indigo-700 dark:text-indigo-300">
          Notifications are only applicable while event
          registration is open. A reminder is not sent after
          the registration deadline.
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-xs font-medium text-green-700 dark:border-green-900/40 dark:bg-green-900/10 dark:text-green-400">
          <span className="flex items-center gap-2">
            <Check size={14} />
            {message}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div>
          {saved ? (
            <p className="flex items-center gap-1.5 text-[10px] font-semibold text-green-600 dark:text-green-400">
              <Check size={12} />
              Notification preferences saved
            </p>
          ) : (
            <p className="text-[10px] text-slate-400">
              {enabledReminders.size === 0
                ? "No deadline reminders selected."
                : `${enabledReminders.size} reminder${
                    enabledReminders.size === 1
                      ? ""
                      : "s"
                  } selected.`}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={savePreferences}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white transition hover:bg-indigo-700"
        >
          <Save size={14} />
          Save Notification Preferences
        </button>
      </div>
    </section>
  );
};

/* ----------------------------------
   Reminder card
----------------------------------- */

const ReminderCard = ({
  reminder,
  enabled,
  disabled,
  onToggle,
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={enabled}
      className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
        enabled && !disabled
          ? "border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/10"
          : disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-100 opacity-50 dark:border-slate-800 dark:bg-slate-900"
          : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-800"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          enabled && !disabled
            ? "bg-indigo-600 text-white"
            : "bg-slate-100 text-slate-400 dark:bg-slate-800"
        }`}
      >
        {enabled && !disabled ? (
          <Check size={17} />
        ) : (
          <Clock3 size={17} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {reminder.label}
          </h4>

          {enabled && !disabled && (
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              Enabled
            </span>
          )}
        </div>

        <p className="mt-1 text-[10px] leading-4 text-slate-400">
          {reminder.description}
        </p>
      </div>

      <div
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled && !disabled
            ? "bg-indigo-600"
            : "bg-slate-300 dark:bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            enabled && !disabled
              ? "left-6"
              : "left-1"
          }`}
        />
      </div>
    </button>
  );
};

/* ----------------------------------
   Registration status
----------------------------------- */

const RegistrationStatus = ({
  open,
  expired,
  deadlineMissing,
}) => {
  if (deadlineMissing) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        <BellOff size={11} />
        Deadline unavailable
      </span>
    );
  }

  if (expired) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide text-red-600 dark:bg-red-900/20 dark:text-red-400">
        <BellOff size={11} />
        Registration closed
      </span>
    );
  }

  if (open) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide text-green-600 dark:bg-green-900/20 dark:text-green-400">
        <Bell size={11} />
        Registration open
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
      <BellOff size={11} />
      Registration closed
    </span>
  );
};

/* ----------------------------------
   Countdown
----------------------------------- */

const DeadlineCountdown = ({
  deadlineInfo,
}) => {
  if (deadlineInfo.expired) {
    return (
      <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
        <p className="text-[9px] font-bold uppercase tracking-wide text-red-500">
          Registration deadline
        </p>

        <p className="mt-1 text-sm font-bold text-red-700 dark:text-red-400">
          Deadline has passed
        </p>
      </div>
    );
  }

  const urgent =
    deadlineInfo.totalHours <= 24;

  return (
    <div
      className={`mt-5 rounded-2xl border p-4 ${
        urgent
          ? "border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/10"
          : "border-indigo-100 bg-indigo-50 dark:border-indigo-900/30 dark:bg-indigo-900/10"
      }`}
    >
      <div className="flex items-center gap-2">
        <Clock3
          size={15}
          className={
            urgent
              ? "text-amber-500"
              : "text-indigo-500"
          }
        />

        <p
          className={`text-[9px] font-bold uppercase tracking-wide ${
            urgent
              ? "text-amber-600 dark:text-amber-400"
              : "text-indigo-600 dark:text-indigo-400"
          }`}
        >
          Time remaining
        </p>
      </div>

      <p
        className={`mt-2 text-lg font-bold ${
          urgent
            ? "text-amber-800 dark:text-amber-300"
            : "text-indigo-900 dark:text-indigo-200"
        }`}
      >
        {formatRemaining(
          deadlineInfo.milliseconds
        )}
      </p>

      <p className="mt-1 text-[9px] text-slate-400">
        Registration closes on{" "}
        {formatDateTime(
          deadlineInfo.deadline
        )}
      </p>
    </div>
  );
};

/* ----------------------------------
   Event normalization
----------------------------------- */

const normalizeEvent = (
  event = {}
) => {
  const registrationOpen =
    event.registrationOpen ??
    event.isRegistrationOpen ??
    event.registrationStatus !==
      "closed";

  return {
    id:
      event.id ||
      event.eventId ||
      event._id ||
      null,

    title:
      event.title ||
      event.name ||
      "Event",

    registrationDeadline:
      event.registrationDeadline ||
      event.registrationDeadlineAt ||
      event.registrationEndDate ||
      event.registrationEndsAt ||
      "",

    registrationOpen:
      Boolean(
        registrationOpen
      ),
  };
};

/* ----------------------------------
   Reminder normalization
----------------------------------- */

const normalizeReminder = (
  reminder
) => {
  return {
    id:
      String(
        reminder.id ||
          `${reminder.days}-days`
      ),

    label:
      reminder.label ||
      `${reminder.days} days before`,

    days:
      Number(reminder.days || 0),

    description:
      reminder.description ||
      `Receive a reminder ${reminder.days} days before registration closes.`,
  };
};

/* ----------------------------------
   Deadline calculation
----------------------------------- */

const calculateDeadlineInfo = (
  deadline
) => {
  if (!deadline) {
    return {
      deadline: null,
      milliseconds: 0,
      totalHours: 0,
      expired: false,
    };
  }

  const deadlineDate =
    new Date(deadline);

  if (
    Number.isNaN(
      deadlineDate.getTime()
    )
  ) {
    return {
      deadline: null,
      milliseconds: 0,
      totalHours: 0,
      expired: false,
    };
  }

  const milliseconds =
    deadlineDate.getTime() -
    Date.now();

  return {
    deadline: deadlineDate,
    milliseconds,
    totalHours:
      milliseconds /
      (1000 * 60 * 60),
    expired:
      milliseconds <= 0,
  };
};

/* ----------------------------------
   Check whether reminder is possible
----------------------------------- */

const isReminderPossible = (
  deadline,
  days
) => {
  if (!deadline) {
    return false;
  }

  const deadlineDate =
    new Date(deadline);

  if (
    Number.isNaN(
      deadlineDate.getTime()
    )
  ) {
    return false;
  }

  const reminderTime =
    deadlineDate.getTime() -
    days *
      24 *
      60 *
      60 *
      1000;

  return reminderTime > Date.now();
};

/* ----------------------------------
   Formatting helpers
----------------------------------- */

const formatDateTime = (
  value
) => {
  if (!value) {
    return "";
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
};

const formatRemaining = (
  milliseconds
) => {
  if (milliseconds <= 0) {
    return "Deadline passed";
  }

  const totalMinutes =
    Math.floor(
      milliseconds /
        (1000 * 60)
    );

  const days =
    Math.floor(
      totalMinutes /
        (60 * 24)
    );

  const hours =
    Math.floor(
      (totalMinutes %
        (60 * 24)) /
        60
    );

  const minutes =
    totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
};

/* ----------------------------------
   Local storage
----------------------------------- */

const loadPreferences = (
  storageKey
) => {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  try {
    const stored =
      window.localStorage.getItem(
        storageKey
      );

    const parsed = stored
      ? JSON.parse(stored)
      : [];

    return Array.isArray(parsed)
      ? parsed.map(String)
      : [];
  } catch {
    return [];
  }
};

const savePreferencesToStorage = (
  storageKey,
  values
) => {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify(values)
    );
  } catch {
    // Ignore localStorage failures.
  }
};

export default EventRegistrationDeadlineNotifications;