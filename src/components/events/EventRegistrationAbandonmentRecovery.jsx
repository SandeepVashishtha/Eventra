import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Clock,
  FileText,
  Play,
  Save,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "event-registration-drafts";

const EventRegistrationAbandonmentRecovery = ({
  event,
  initialFormData = {},
  onContinue,
  onSubmit,
  onReminder,
  className = "",
}) => {
  const eventId = event?.id || "unknown-event";

  const [formData, setFormData] =
    useState(initialFormData);

  const [savedAt, setSavedAt] =
    useState(null);

  const [status, setStatus] =
    useState("idle");

  const [message, setMessage] =
    useState("");

  const [showReminder, setShowReminder] =
    useState(false);

  const [reminderSent, setReminderSent] =
    useState(false);

  // Restore previously saved draft.
  useEffect(() => {
    const drafts = getDrafts();

    const savedDraft =
      drafts[eventId];

    if (!savedDraft) {
      return;
    }

    setFormData(
      savedDraft.formData || {}
    );

    setSavedAt(
      savedDraft.savedAt || null
    );

    setStatus("restored");
  }, [eventId]);

  // Automatically save progress.
  useEffect(() => {
    if (!event?.id) {
      return;
    }

    const hasData =
      Object.keys(formData).length > 0;

    if (!hasData) {
      return;
    }

    const timer = setTimeout(() => {
      saveDraft(
        eventId,
        formData
      );

      setSavedAt(
        new Date().toISOString()
      );

      setStatus("saved");
    }, 500);

    return () =>
      clearTimeout(timer);
  }, [eventId, formData, event?.id]);

  const completion = useMemo(() => {
    const fields =
      event?.registrationFields || [];

    if (fields.length === 0) {
      return 0;
    }

    const completed =
      fields.filter((field) => {
        const value =
          formData[field.name];

        if (
          value === undefined ||
          value === null
        ) {
          return false;
        }

        return String(value).trim() !== "";
      }).length;

    return Math.round(
      (completed / fields.length) * 100
    );
  }, [
    event?.registrationFields,
    formData,
  ]);

  const handleChange = (
    field,
    value
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    setMessage("");
  };

  const handleContinue = () => {
    setStatus("restored");

    onContinue?.({
      event,
      formData,
    });
  };

  const handleSubmit = async (
    eventObject
  ) => {
    eventObject.preventDefault();

    setStatus("submitting");
    setMessage("");

    try {
      await onSubmit?.({
        event,
        formData,
      });

      removeDraft(eventId);

      setSavedAt(null);
      setStatus("submitted");

      setMessage(
        "Registration completed successfully."
      );
    } catch (error) {
      setStatus("error");

      setMessage(
        error?.message ||
          "Unable to submit registration."
      );
    }
  };

  const handleReminder = async () => {
    setShowReminder(true);

    try {
      await onReminder?.({
        event,
        formData,
      });

      setReminderSent(true);

      setMessage(
        "Registration reminder enabled."
      );
    } catch (error) {
      setMessage(
        error?.message ||
          "Unable to enable reminder."
      );
    }
  };

  const handleDiscard = () => {
    const confirmed =
      window.confirm(
        "Discard your unfinished registration?"
      );

    if (!confirmed) {
      return;
    }

    removeDraft(eventId);

    setFormData(
      initialFormData
    );

    setSavedAt(null);
    setStatus("idle");

    setMessage(
      "Your unfinished registration was discarded."
    );
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <FileText size={20} />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Registration Recovery
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              {event?.name ||
                "Event Registration"}
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Your registration progress is saved
              automatically.
            </p>
          </div>
        </div>

        {savedAt && (
          <div className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 dark:bg-green-900/10">
            <Save
              size={12}
              className="text-green-600 dark:text-green-400"
            />

            <span className="text-[7px] font-bold text-green-600 dark:text-green-400">
              Saved {formatRelativeTime(savedAt)}
            </span>
          </div>
        )}
      </div>

      {/* Draft recovery banner */}
      {status === "restored" && (
        <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10">
          <div className="flex items-start gap-3">
            <Play
              size={17}
              className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
            />

            <div>
              <p className="text-[9px] font-bold text-indigo-700 dark:text-indigo-400">
                Unfinished registration restored
              </p>

              <p className="mt-1 text-[8px] leading-4 text-indigo-700/70 dark:text-indigo-400/70">
                Your previous registration progress has
                been restored. Continue where you left
                off.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold text-slate-800 dark:text-white">
              Registration Progress
            </p>

            <p className="mt-1 text-[7px] text-slate-400">
              {completion}% completed
            </p>
          </div>

          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
            {completion}%
          </span>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-300"
            style={{
              width: `${completion}%`,
            }}
          />
        </div>
      </div>

      {/* Registration form */}
      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4"
      >
        {(event?.registrationFields || []).map(
          (field) => (
            <RegistrationField
              key={field.name}
              field={field}
              value={
                formData[field.name] || ""
              }
              onChange={(value) =>
                handleChange(
                  field.name,
                  value
                )
              }
            />
          )
        )}

        {(!event?.registrationFields ||
          event.registrationFields.length ===
            0) && (
          <EmptyFields />
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleDiscard}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-[8px] font-bold text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:bg-slate-900 dark:text-red-400"
          >
            <Trash2 size={13} />
            Discard Draft
          </button>

          <button
            type="button"
            onClick={handleContinue}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3 text-[8px] font-bold text-indigo-600 hover:bg-indigo-100 dark:border-indigo-900/30 dark:bg-indigo-900/10 dark:text-indigo-400"
          >
            <Play size={13} />
            Continue Registration
          </button>

          <button
            type="submit"
            disabled={
              status === "submitting"
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-[8px] font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle2 size={13} />

            {status === "submitting"
              ? "Submitting..."
              : "Complete Registration"}
          </button>
        </div>
      </form>

      {/* Reminder */}
      {event?.registrationDeadline && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Clock
                size={16}
                className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
              />

              <div>
                <p className="text-[9px] font-bold text-amber-700 dark:text-amber-400">
                  Registration Deadline
                </p>

                <p className="mt-1 text-[7px] leading-4 text-amber-700/70 dark:text-amber-400/70">
                  Registration closes on{" "}
                  <strong>
                    {formatDate(
                      event.registrationDeadline
                    )}
                  </strong>
                  .
                </p>
              </div>
            </div>

            {!reminderSent ? (
              <button
                type="button"
                onClick={
                  handleReminder
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-3 text-[8px] font-bold text-white hover:bg-amber-700"
              >
                <Bell size={13} />
                Remind Me
              </button>
            ) : (
              <div className="flex items-center gap-2 rounded-xl bg-green-100 px-4 py-3 text-[8px] font-bold text-green-700 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle2 size={13} />
                Reminder Enabled
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status message */}
      {message && (
        <div
          className={`mt-5 flex items-center gap-2 rounded-xl border p-3 text-[8px] font-semibold ${
            status === "error"
              ? "border-red-200 bg-red-50 text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400"
              : "border-green-200 bg-green-50 text-green-600 dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-400"
          }`}
        >
          {status === "error" ? (
            <AlertCircle size={14} />
          ) : (
            <CheckCircle2 size={14} />
          )}

          {message}
        </div>
      )}
    </section>
  );
};

const RegistrationField = ({
  field,
  value,
  onChange,
}) => {
  const commonProps = {
    value,
    required: field.required,
    onChange: (event) =>
      onChange(event.target.value),
    placeholder:
      field.placeholder ||
      `Enter ${field.label}`,
    className:
      "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white",
  };

  return (
    <div>
      <label className="text-[8px] font-bold text-slate-600 dark:text-slate-300">
        {field.label}

        {field.required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {field.type === "textarea" ? (
        <textarea
          {...commonProps}
          rows={4}
        />
      ) : field.type === "select" ? (
        <select {...commonProps}>
          <option value="">
            Select {field.label}
          </option>

          {(field.options || []).map(
            (option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            )
          )}
        </select>
      ) : (
        <input
          {...commonProps}
          type={field.type || "text"}
        />
      )}
    </div>
  );
};

const EmptyFields = () => (
  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
    <FileText
      size={22}
      className="mx-auto text-slate-400"
    />

    <p className="mt-3 text-[9px] font-bold text-slate-700 dark:text-slate-200">
      No registration fields configured
    </p>

    <p className="mt-1 text-[7px] text-slate-400">
      Add registration fields to display the form here.
    </p>
  </div>
);

const getDrafts = () => {
  try {
    return JSON.parse(
      localStorage.getItem(
        STORAGE_KEY
      ) || "{}"
    );
  } catch {
    return {};
  }
};

const saveDraft = (
  eventId,
  formData
) => {
  const drafts = getDrafts();

  drafts[eventId] = {
    eventId,
    formData,
    savedAt:
      new Date().toISOString(),
    status: "incomplete",
  };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(drafts)
  );
};

const removeDraft = (
  eventId
) => {
  const drafts = getDrafts();

  delete drafts[eventId];

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(drafts)
  );
};

const formatDate = (
  value
) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return date.toLocaleString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
};

const formatRelativeTime = (
  value
) => {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "recently";
  }

  const seconds = Math.floor(
    (Date.now() -
      date.getTime()) /
      1000
  );

  if (seconds < 60) {
    return "just now";
  }

  const minutes = Math.floor(
    seconds / 60
  );

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  return `${days}d ago`;
};

export default EventRegistrationAbandonmentRecovery;