import { useMemo, useState } from "react";
import {
  Bell,
  CalendarClock,
  Check,
  Clock,
  Trash2,
} from "lucide-react";
import ReminderOption from "./ReminderOption";
import {
  DEFAULT_REMINDER_OPTIONS,
  calculateReminderTime,
  createReminder,
  formatReminderDateTime,
  getEventStartDate,
  isReminderValid,
} from "../../utils/eventReminderUtils";

const EventReminderScheduling = ({
  event,
  initialReminder = null,
  onReminderChange,
  onSave,
  onRemove,
}) => {
  const [selectedOption, setSelectedOption] =
    useState(
      initialReminder?.type ||
        "1-day"
    );

  const [customDateTime, setCustomDateTime] =
    useState(
      initialReminder?.reminderAt
        ? toDateTimeLocal(
            initialReminder.reminderAt
          )
        : ""
    );

  const [reminder, setReminder] =
    useState(initialReminder);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const eventStartDate = useMemo(
    () => getEventStartDate(event),
    [event]
  );

  const eventName =
    event?.name ||
    event?.title ||
    event?.eventName ||
    "Event";

  const eventDateLabel =
    eventStartDate
      ? formatReminderDateTime(
          eventStartDate
        )
      : "Date not available";

  const handleOptionChange = (
    option
  ) => {
    setSelectedOption(option);
    setError("");
    setSuccess("");

    if (option !== "custom") {
      setCustomDateTime("");
    }
  };

  const handleSaveReminder = () => {
    setError("");
    setSuccess("");

    if (!eventStartDate) {
      setError(
        "The event date and time are required before setting a reminder."
      );
      return;
    }

    let reminderAt;

    if (selectedOption === "custom") {
      if (!customDateTime) {
        setError(
          "Please select a custom reminder date and time."
        );
        return;
      }

      reminderAt = new Date(
        customDateTime
      );
    } else {
      reminderAt = calculateReminderTime(
        eventStartDate,
        selectedOption
      );
    }

    const validation =
      isReminderValid(
        reminderAt,
        eventStartDate
      );

    if (!validation.valid) {
      setError(
        validation.error ||
          "The selected reminder time is invalid."
      );
      return;
    }

    const newReminder =
      createReminder({
        eventId:
          event?.id ||
          event?.eventId ||
          null,
        eventName,
        type: selectedOption,
        reminderAt,
      });

    setReminder(newReminder);

    onReminderChange?.(
      newReminder
    );

    onSave?.(newReminder);

    setSuccess(
      "Reminder scheduled successfully."
    );
  };

  const handleRemoveReminder = () => {
    setReminder(null);
    setError("");
    setSuccess("");

    onReminderChange?.(null);
    onRemove?.(initialReminder);

    setSelectedOption("1-day");
    setCustomDateTime("");
  };

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
          <Bell
            size={22}
            className="text-indigo-600 dark:text-indigo-400"
          />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Event Reminder
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Choose when you want to be reminded
            about this event.
          </p>
        </div>
      </div>

      {/* Event information */}
      <div className="mt-6 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
        <h3 className="font-semibold text-slate-800 dark:text-white">
          {eventName}
        </h3>

        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <CalendarClock size={16} />
          <span>
            Event starts: {eventDateLabel}
          </span>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300"
        >
          {success}
        </div>
      )}

      {/* Reminder options */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
          Remind me
        </h3>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {DEFAULT_REMINDER_OPTIONS.map(
            (option) => (
              <ReminderOption
                key={option.value}
                option={option}
                selected={
                  selectedOption ===
                  option.value
                }
                onClick={() =>
                  handleOptionChange(
                    option.value
                  )
                }
              />
            )
          )}
        </div>
      </div>

      {/* Custom reminder */}
      {selectedOption === "custom" && (
        <div className="mt-5 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <label
            htmlFor="custom-reminder"
            className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Custom reminder date and time
          </label>

          <div className="relative">
            <Clock
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="custom-reminder"
              type="datetime-local"
              value={customDateTime}
              onChange={(event) => {
                setCustomDateTime(
                  event.target.value
                );
                setError("");
                setSuccess("");
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-10 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* Existing reminder */}
      {reminder && (
        <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                <Check
                  size={16}
                  className="text-green-600 dark:text-green-400"
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                  Reminder scheduled
                </p>

                <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                  {formatReminderDateTime(
                    reminder.reminderAt
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={
                handleRemoveReminder
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <Trash2 size={15} />
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Save */}
      <button
        type="button"
        onClick={handleSaveReminder}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        <Bell size={17} />
        {reminder
          ? "Update Reminder"
          : "Set Reminder"}
      </button>
    </section>
  );
};

/**
 * Convert an ISO date into the value expected
 * by a datetime-local input.
 */
const toDateTimeLocal = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset =
    date.getTimezoneOffset() * 60000;

  return new Date(
    date.getTime() - offset
  )
    .toISOString()
    .slice(0, 16);
};

export default EventReminderScheduling;