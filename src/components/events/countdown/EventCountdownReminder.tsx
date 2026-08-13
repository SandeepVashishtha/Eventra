import React, { useEffect, useMemo, useState } from "react";

interface EventCountdownReminderProps {
  eventId: string | number;
  eventName: string;
  eventDate: string;
  eventTime: string;
  isRegistered?: boolean;
  initialReminder?: boolean;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const EventCountdownReminder: React.FC<
  EventCountdownReminderProps
> = ({
  eventId,
  eventName,
  eventDate,
  eventTime,
  isRegistered = false,
  initialReminder = false,
}) => {
  const [timeRemaining, setTimeRemaining] =
    useState<TimeRemaining | null>(null);

  const [eventStarted, setEventStarted] =
    useState(false);

  const [reminderEnabled, setReminderEnabled] =
    useState(initialReminder);

  const [showReminderMessage, setShowReminderMessage] =
    useState(false);

  /*
   * Create the event start date.
   */
  const eventStartDate = useMemo(() => {
    const combinedDate = `${eventDate} ${eventTime}`;
    const parsedDate = new Date(combinedDate);

    return parsedDate;
  }, [eventDate, eventTime]);

  /*
   * Calculate remaining time.
   */
  const calculateTimeRemaining = () => {
    const now = new Date();
    const difference =
      eventStartDate.getTime() - now.getTime();

    if (difference <= 0) {
      setEventStarted(true);
      setTimeRemaining(null);
      return;
    }

    const days = Math.floor(
      difference / (1000 * 60 * 60 * 24)
    );

    const hours = Math.floor(
      (difference / (1000 * 60 * 60)) % 24
    );

    const minutes = Math.floor(
      (difference / (1000 * 60)) % 60
    );

    const seconds = Math.floor(
      (difference / 1000) % 60
    );

    setTimeRemaining({
      days,
      hours,
      minutes,
      seconds,
    });

    setEventStarted(false);
  };

  /*
   * Update countdown every second.
   */
  useEffect(() => {
    calculateTimeRemaining();

    const interval = window.setInterval(() => {
      calculateTimeRemaining();
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [eventStartDate]);

  /*
   * Toggle reminder.
   */
  const handleReminderToggle = () => {
    const newReminderState = !reminderEnabled;

    setReminderEnabled(newReminderState);
    setShowReminderMessage(true);

    /*
     * Store reminder locally.
     *
     * This allows the widget to remember the reminder
     * on the current browser.
     */
    try {
      const existingReminders = JSON.parse(
        localStorage.getItem("eventra-reminders") || "[]"
      );

      if (newReminderState) {
        if (!existingReminders.includes(eventId)) {
          existingReminders.push(eventId);
        }
      } else {
        const filteredReminders =
          existingReminders.filter(
            (id: string | number) =>
              String(id) !== String(eventId)
          );

        localStorage.setItem(
          "eventra-reminders",
          JSON.stringify(filteredReminders)
        );

        setTimeout(() => {
          setShowReminderMessage(false);
        }, 2500);

        return;
      }

      localStorage.setItem(
        "eventra-reminders",
        JSON.stringify(existingReminders)
      );
    } catch {
      // Ignore localStorage errors.
    }

    setTimeout(() => {
      setShowReminderMessage(false);
    }, 2500);
  };

  /*
   * Format numbers with leading zero.
   */
  const formatNumber = (value: number) => {
    return value.toString().padStart(2, "0");
  };

  /*
   * Event has already started.
   */
  if (eventStarted) {
    return (
      <section className="w-full rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm dark:border-green-900 dark:bg-green-950">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-2xl dark:bg-green-900">
              ▶
            </div>

            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                Event Status
              </p>

              <h2 className="mt-1 text-xl font-bold text-green-800 dark:text-green-300">
                {eventName}
              </h2>

              <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                This event has started.
              </p>
            </div>
          </div>

          {reminderEnabled && (
            <span className="rounded-full border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-700 dark:border-green-800 dark:bg-gray-900 dark:text-green-300">
              ✓ Reminder Active
            </span>
          )}
        </div>
      </section>
    );
  }

  /*
   * Invalid date fallback.
   */
  if (Number.isNaN(eventStartDate.getTime())) {
    return (
      <section className="w-full rounded-2xl border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-900 dark:bg-yellow-950">
        <div className="flex items-start gap-3">
          <span className="text-xl">⚠️</span>

          <div>
            <h2 className="font-semibold text-yellow-800 dark:text-yellow-300">
              Event countdown unavailable
            </h2>

            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
              The event date or time could not be determined.
            </p>
          </div>
        </div>
      </section>
    );
  }

  /*
   * User is not registered.
   */
  if (!isRegistered) {
    return (
      <section className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Upcoming Event
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
              {eventName}
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {eventDate} • {eventTime}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 px-4 py-3 text-center dark:bg-gray-800">
            <p className="text-xs font-medium text-gray-400">
              Registration Required
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
              Register to set a reminder
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full space-y-5">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl dark:bg-blue-950">
              ⏳
            </div>

            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Upcoming Event
              </p>

              <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                {eventName}
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {eventDate} • {eventTime}
              </p>
            </div>
          </div>

          {/* Reminder button */}
          <button
            type="button"
            onClick={handleReminderToggle}
            className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
              reminderEnabled
                ? "border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {reminderEnabled
              ? "✓ Reminder Set"
              : "🔔 Set Reminder"}
          </button>
        </div>
      </div>

      {/* =====================================================
          COUNTDOWN
      ====================================================== */}
      {timeRemaining && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm dark:border-blue-900 dark:bg-blue-950">
          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Event Starts In
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {/* Days */}
              <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-900">
                <p className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
                  {formatNumber(timeRemaining.days)}
                </p>

                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Days
                </p>
              </div>

              {/* Hours */}
              <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-900">
                <p className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
                  {formatNumber(timeRemaining.hours)}
                </p>

                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Hours
                </p>
              </div>

              {/* Minutes */}
              <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-900">
                <p className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
                  {formatNumber(timeRemaining.minutes)}
                </p>

                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Minutes
                </p>
              </div>

              {/* Seconds */}
              <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-900">
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 sm:text-5xl">
                  {formatNumber(timeRemaining.seconds)}
                </p>

                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Seconds
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          REMINDER STATUS
      ====================================================== */}
      {reminderEnabled && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900 dark:bg-green-950">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-lg dark:bg-green-900">
              🔔
            </div>

            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-300">
                Reminder is active
              </h3>

              <p className="mt-1 text-sm leading-6 text-green-700 dark:text-green-400">
                You have added a reminder for {eventName}.
                You can remove it at any time using the reminder
                button above.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          SUCCESS MESSAGE
      ====================================================== */}
      {showReminderMessage && (
        <div
          className={`rounded-xl border p-4 ${
            reminderEnabled
              ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
              : "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          <p className="text-sm font-medium">
            {reminderEnabled
              ? "🔔 Event reminder has been set successfully."
              : "Reminder has been removed."}
          </p>
        </div>
      )}

      {/* =====================================================
          EVENT INFORMATION
      ====================================================== */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Event Information
        </h3>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Event
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
              {eventName}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Date
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
              {eventDate}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Start Time
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
              {eventTime}
            </p>
          </div>

          <div className="rounded-xl bg-green-50 p-4 dark:bg-green-950">
            <p className="text-xs font-medium uppercase tracking-wide text-green-600 dark:text-green-400">
              Registration
            </p>

            <p className="mt-1 text-sm font-semibold text-green-700 dark:text-green-300">
              Registered
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          REMINDER INFO
      ====================================================== */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start gap-3">
          <span className="text-xl">ℹ️</span>

          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              About Event Reminders
            </h3>

            <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
              Set a reminder to keep this event visible in your
              upcoming reminders. The countdown automatically
              stops when the event begins.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventCountdownReminder;