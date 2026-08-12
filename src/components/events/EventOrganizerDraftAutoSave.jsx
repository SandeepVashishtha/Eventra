import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  Save,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_PREFIX =
  "eventra:event-organizer-draft:";

const DEFAULT_FORM = {
  title: "",
  description: "",
  category: "",
  venue: "",
  startDate: "",
  endDate: "",
  registrationDeadline: "",
  capacity: "",
};

const EventOrganizerDraftAutoSave = ({
  eventId = "new-event",
  initialData = {},
  onSubmit,
  className = "",
}) => {
  const storageKey =
    `${STORAGE_PREFIX}${eventId}`;

  const [form, setForm] = useState({
    ...DEFAULT_FORM,
    ...initialData,
  });

  const [saveStatus, setSaveStatus] =
    useState("saved");

  const [lastSavedAt, setLastSavedAt] =
    useState(null);

  const [hasDraft, setHasDraft] =
    useState(false);

  const [showRestore, setShowRestore] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const saveTimer = useRef(null);
  const isInitialRender = useRef(true);

  /*
   * Read an existing draft.
   */
  const getDraft = useCallback(() => {
    try {
      const stored =
        localStorage.getItem(storageKey);

      if (!stored) {
        return null;
      }

      const parsed =
        JSON.parse(stored);

      if (
        !parsed ||
        typeof parsed !== "object"
      ) {
        return null;
      }

      return parsed;
    } catch (error) {
      console.error(
        "Unable to read event draft:",
        error
      );

      return null;
    }
  }, [storageKey]);

  /*
   * Check for an existing draft when
   * the component is mounted.
   */
  useEffect(() => {
    const draft = getDraft();

    if (
      draft?.data &&
      typeof draft.data === "object"
    ) {
      setHasDraft(true);

      if (draft.savedAt) {
        setLastSavedAt(
          new Date(draft.savedAt)
        );
      }

      setShowRestore(true);
    }
  }, [getDraft]);

  /*
   * Save draft to localStorage.
   */
  const saveDraft = useCallback(
    (data = form) => {
      try {
        setSaveStatus("saving");

        const payload = {
          eventId,
          data,
          savedAt:
            new Date().toISOString(),
        };

        localStorage.setItem(
          storageKey,
          JSON.stringify(payload)
        );

        setLastSavedAt(
          new Date(payload.savedAt)
        );

        setHasDraft(true);
        setSaveStatus("saved");
        setMessage("");
      } catch (error) {
        console.error(
          "Unable to save event draft:",
          error
        );

        setSaveStatus("error");
        setMessage(
          "Unable to save draft locally."
        );
      }
    },
    [eventId, form, storageKey]
  );

  /*
   * Debounced automatic saving.
   */
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    setSaveStatus("unsaved");

    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }

    saveTimer.current =
      setTimeout(() => {
        saveDraft(form);
      }, 1000);

    return () => {
      if (saveTimer.current) {
        clearTimeout(
          saveTimer.current
        );
      }
    };
  }, [form, saveDraft]);

  /*
   * Update form field.
   */
  const updateField = (
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setMessage("");
  };

  /*
   * Restore existing draft.
   */
  const restoreDraft = () => {
    const draft = getDraft();

    if (
      !draft?.data ||
      typeof draft.data !== "object"
    ) {
      setShowRestore(false);
      return;
    }

    setForm({
      ...DEFAULT_FORM,
      ...draft.data,
    });

    if (draft.savedAt) {
      setLastSavedAt(
        new Date(draft.savedAt)
      );
    }

    setHasDraft(true);
    setSaveStatus("saved");
    setShowRestore(false);
    setMessage(
      "Your previous draft has been restored."
    );
  };

  /*
   * Start a fresh event instead.
   */
  const discardExistingDraft = () => {
    try {
      localStorage.removeItem(
        storageKey
      );
    } catch (error) {
      console.error(
        "Unable to remove draft:",
        error
      );
    }

    setForm({
      ...DEFAULT_FORM,
      ...initialData,
    });

    setHasDraft(false);
    setLastSavedAt(null);
    setShowRestore(false);
    setSaveStatus("saved");
    setMessage("");
  };

  /*
   * Manually save.
   */
  const handleManualSave = () => {
    if (saveTimer.current) {
      clearTimeout(
        saveTimer.current
      );
    }

    saveDraft(form);
  };

  /*
   * Delete saved draft.
   */
  const discardDraft = () => {
    const confirmed =
      window.confirm(
        "Are you sure you want to discard this draft? This action cannot be undone."
      );

    if (!confirmed) {
      return;
    }

    try {
      localStorage.removeItem(
        storageKey
      );
    } catch (error) {
      console.error(
        "Unable to delete draft:",
        error
      );
    }

    setForm({
      ...DEFAULT_FORM,
      ...initialData,
    });

    setHasDraft(false);
    setLastSavedAt(null);
    setSaveStatus("saved");
    setMessage(
      "Draft discarded successfully."
    );
  };

  /*
   * Submit event.
   */
  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setIsSubmitting(true);
    setMessage("");

    try {
      await onSubmit?.(form);

      /*
       * Remove draft after successful
       * event creation.
       */
      localStorage.removeItem(
        storageKey
      );

      setHasDraft(false);
      setLastSavedAt(null);
      setSaveStatus("saved");

      setMessage(
        "Event created successfully. Draft removed."
      );
    } catch (error) {
      setMessage(
        error?.message ||
          "Unable to create the event."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusLabel = {
    saving: "Saving...",
    saved: "Draft saved",
    unsaved: "Unsaved changes",
    error: "Save failed",
  }[saveStatus];

  const statusIcon = {
    saving: (
      <Save
        size={13}
        className="animate-pulse"
      />
    ),
    saved: (
      <CheckCircle2 size={13} />
    ),
    unsaved: (
      <Clock3 size={13} />
    ),
    error: (
      <AlertCircle size={13} />
    ),
  }[saveStatus];

  const statusClass = {
    saving:
      "text-indigo-600 dark:text-indigo-400",
    saved:
      "text-green-600 dark:text-green-400",
    unsaved:
      "text-amber-600 dark:text-amber-400",
    error:
      "text-red-600 dark:text-red-400",
  }[saveStatus];

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <FileText
              size={21}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Create Event
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Your progress is automatically saved while
              creating the event.
            </p>
          </div>
        </div>

        {/* Save status */}
        <div
          className={`flex items-center gap-2 self-start rounded-full bg-white px-3 py-2 text-[8px] font-bold shadow-sm dark:bg-slate-900 ${statusClass}`}
        >
          {statusIcon}

          <span>
            {statusLabel}
          </span>

          {lastSavedAt &&
            saveStatus ===
              "saved" && (
              <span className="font-normal text-slate-400">
                •{" "}
                {formatRelativeTime(
                  lastSavedAt
                )}
              </span>
            )}
        </div>
      </div>

      {/* Restore draft */}
      {showRestore && (
        <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <RotateCcw
              size={16}
              className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
            />

            <div>
              <p className="text-[9px] font-bold text-indigo-700 dark:text-indigo-300">
                Previous draft found
              </p>

              <p className="mt-1 text-[7px] leading-4 text-indigo-600/70 dark:text-indigo-400">
                {lastSavedAt
                  ? `Draft saved ${formatRelativeTime(
                      lastSavedAt
                    )}.`
                  : "An unfinished event draft is available."}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={
                discardExistingDraft
              }
              className="rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-[8px] font-bold text-slate-600 hover:bg-slate-50 dark:border-indigo-900/40 dark:bg-slate-950 dark:text-slate-300"
            >
              Start Fresh
            </button>

            <button
              type="button"
              onClick={
                restoreDraft
              }
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-[8px] font-bold text-white hover:bg-indigo-700"
            >
              Restore Draft
            </button>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[8px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          <InfoIcon />
          {message}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-5"
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <FormInput
            label="Event Title"
            value={form.title}
            placeholder="Enter event title"
            required
            onChange={(value) =>
              updateField(
                "title",
                value
              )
            }
          />

          <div className="mt-5">
            <label className="text-[8px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Description
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <textarea
              rows={5}
              value={form.description}
              placeholder="Describe your event..."
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value
                )
              }
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs outline-none transition focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>

        {/* Event details */}
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <FormInput
              label="Category"
              value={form.category}
              placeholder="Hackathon, Workshop..."
              onChange={(value) =>
                updateField(
                  "category",
                  value
                )
              }
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <FormInput
              label="Venue"
              value={form.venue}
              placeholder="Enter venue"
              onChange={(value) =>
                updateField(
                  "venue",
                  value
                )
              }
            />
          </div>
        </div>

        {/* Dates */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Event Schedule
          </p>

          <div className="mt-4 grid gap-5 md:grid-cols-3">
            <DateInput
              label="Start Date & Time"
              value={form.startDate}
              onChange={(value) =>
                updateField(
                  "startDate",
                  value
                )
              }
            />

            <DateInput
              label="End Date & Time"
              value={form.endDate}
              onChange={(value) =>
                updateField(
                  "endDate",
                  value
                )
              }
            />

            <DateInput
              label="Registration Deadline"
              value={
                form.registrationDeadline
              }
              onChange={(value) =>
                updateField(
                  "registrationDeadline",
                  value
                )
              }
            />
          </div>
        </div>

        {/* Capacity */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <FormInput
            label="Participant Capacity"
            type="number"
            value={form.capacity}
            placeholder="100"
            onChange={(value) =>
              updateField(
                "capacity",
                value
              )
            }
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[9px] font-bold text-indigo-700 dark:text-indigo-300">
              {lastSavedAt
                ? `Draft saved ${formatRelativeTime(
                    lastSavedAt
                  )}`
                : "Your changes are saved automatically"}
            </p>

            <p className="mt-1 text-[7px] text-indigo-600/70 dark:text-indigo-400">
              You can manually save or discard your draft.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={
                handleManualSave
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-5 py-3 text-[8px] font-bold text-indigo-600 hover:bg-indigo-50 dark:border-indigo-900/40 dark:bg-slate-950 dark:text-indigo-400"
            >
              <Save size={13} />
              Save Draft
            </button>

            {hasDraft && (
              <button
                type="button"
                onClick={
                  discardDraft
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-[8px] font-bold text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:bg-slate-950 dark:text-red-400"
              >
                <Trash2 size={13} />
                Discard Draft
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-[8px] font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircle2 size={13} />

              {isSubmitting
                ? "Creating..."
                : "Create Event"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};

/*
 * Reusable text input.
 */
const FormInput = ({
  label,
  value,
  placeholder,
  type = "text",
  required = false,
  onChange,
}) => (
  <div>
    <label className="text-[8px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}

      {required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </label>

    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(event) =>
        onChange(
          event.target.value
        )
      }
      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs outline-none transition focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
    />
  </div>
);

/*
 * Date/time input.
 */
const DateInput = ({
  label,
  value,
  onChange,
}) => (
  <div>
    <label className="text-[8px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </label>

    <input
      type="datetime-local"
      value={value}
      onChange={(event) =>
        onChange(
          event.target.value
        )
      }
      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-[9px] outline-none transition focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
    />
  </div>
);

const InfoIcon = () => (
  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
    i
  </span>
);

/*
 * Format timestamps such as:
 * "just now"
 * "2 minutes ago"
 * "1 hour ago"
 */
const formatRelativeTime = (
  date
) => {
  const timestamp =
    date instanceof Date
      ? date.getTime()
      : new Date(date).getTime();

  if (Number.isNaN(timestamp)) {
    return "recently";
  }

  const difference =
    Date.now() - timestamp;

  if (difference < 10000) {
    return "just now";
  }

  const seconds = Math.floor(
    difference / 1000
  );

  if (seconds < 60) {
    return `${seconds} seconds ago`;
  }

  const minutes = Math.floor(
    seconds / 60
  );

  if (minutes < 60) {
    return `${minutes} minute${
      minutes === 1 ? "" : "s"
    } ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours} hour${
      hours === 1 ? "" : "s"
    } ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  return `${days} day${
    days === 1 ? "" : "s"
  } ago`;
};

export default EventOrganizerDraftAutoSave;