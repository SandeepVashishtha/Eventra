import {
  Calendar,
  CheckCircle2,
  Copy,
  FileText,
  MapPin,
  Settings2,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

const EventOrganizerEventDuplication = ({
  event,
  onDuplicate,
  onCancel,
  className = "",
}) => {
  const [form, setForm] = useState({
    name: event?.name
      ? `${event.name} - Copy`
      : "",
    date: "",
    venue: event?.venue || "",
    capacity: event?.capacity || "",
  });

  const [isDuplicating, setIsDuplicating] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [error, setError] =
    useState("");

  const updateField = (
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleDuplicate = async (
    e
  ) => {
    e.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError(
        "Please enter an event name."
      );
      return;
    }

    if (!form.date) {
      setError(
        "Please select the new event date."
      );
      return;
    }

    if (!form.venue.trim()) {
      setError(
        "Please enter the event venue."
      );
      return;
    }

    if (
      !form.capacity ||
      Number(form.capacity) <= 0
    ) {
      setError(
        "Please enter a valid capacity."
      );
      return;
    }

    setIsDuplicating(true);

    try {
      const duplicatedEvent = {
        ...event,

        // New event identity
        id: undefined,

        name: form.name.trim(),
        date: form.date,
        venue: form.venue.trim(),
        capacity: Number(
          form.capacity
        ),

        // Always create duplicated event
        status: "draft",

        // Do not copy participant-specific data
        registrations: [],
        attendees: [],
        attendance: [],
        certificates: [],

        // Preserve reusable event configuration
        description:
          event?.description || "",
        category:
          event?.category || "",
        rules:
          event?.rules || [],
        faq:
          event?.faq || [],
        registrationSettings:
          event?.registrationSettings ||
          {},
        customRegistrationFields:
          event?.customRegistrationFields ||
          [],
        resources:
          event?.resources || [],
      };

      await onDuplicate?.(
        duplicatedEvent
      );

      setSuccess(true);
    } catch (err) {
      setError(
        err?.message ||
          "Unable to duplicate the event."
      );
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Copy size={20} />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Tools
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Duplicate Event
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Create a new event using the existing event
              configuration.
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X size={17} />
          </button>
        )}
      </div>

      {/* Source event */}
      <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10">
        <div className="flex items-center gap-3">
          <FileText
            size={17}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <div>
            <p className="text-[7px] font-bold uppercase tracking-wide text-indigo-500">
              Duplicating
            </p>

            <p className="mt-1 text-[10px] font-bold text-slate-800 dark:text-white">
              {event?.name ||
                "Existing Event"}
            </p>
          </div>
        </div>
      </div>

      {/* Copied configuration */}
      <div className="mt-5">
        <p className="text-[9px] font-bold text-slate-800 dark:text-white">
          Information to be copied
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <CopyItem
            icon={<FileText size={13} />}
            label="Description"
          />

          <CopyItem
            icon={<Settings2 size={13} />}
            label="Category"
          />

          <CopyItem
            icon={<CheckCircle2 size={13} />}
            label="Rules"
          />

          <CopyItem
            icon={<FileText size={13} />}
            label="FAQ"
          />

          <CopyItem
            icon={<Settings2 size={13} />}
            label="Registration Settings"
          />

          <CopyItem
            icon={<FileText size={13} />}
            label="Custom Fields"
          />

          <CopyItem
            icon={<FileText size={13} />}
            label="Resources"
          />
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleDuplicate}
        className="mt-6 space-y-4"
      >
        <div>
          <label className="text-[8px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            New Event Name
          </label>

          <input
            type="text"
            value={form.name}
            onChange={(e) =>
              updateField(
                "name",
                e.target.value
              )
            }
            placeholder="Enter event name"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none transition focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Date */}
          <div>
            <label className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <Calendar size={11} />
              New Event Date
            </label>

            <input
              type="datetime-local"
              value={form.date}
              onChange={(e) =>
                updateField(
                  "date",
                  e.target.value
                )
              }
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          {/* Capacity */}
          <div>
            <label className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <Users size={11} />
              New Capacity
            </label>

            <input
              type="number"
              min="1"
              value={form.capacity}
              onChange={(e) =>
                updateField(
                  "capacity",
                  e.target.value
                )
              }
              placeholder="e.g. 100"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Venue */}
        <div>
          <label className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <MapPin size={11} />
            New Venue
          </label>

          <input
            type="text"
            value={form.venue}
            onChange={(e) =>
              updateField(
                "venue",
                e.target.value
              )
            }
            placeholder="Enter venue or meeting link"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        {/* Notice */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/30 dark:bg-amber-900/10">
          <p className="text-[8px] font-semibold leading-4 text-amber-700 dark:text-amber-400">
            The duplicated event will be created as a draft.
            Existing registrations, attendance records, and
            certificates will not be copied.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-[8px] font-semibold text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-[8px] font-semibold text-green-600 dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-400">
            <CheckCircle2 size={14} />
            Event duplicated successfully as a draft.
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isDuplicating}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-[8px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isDuplicating}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-[8px] font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Copy size={13} />

            {isDuplicating
              ? "Duplicating..."
              : "Duplicate Event"}
          </button>
        </div>
      </form>
    </section>
  );
};

const CopyItem = ({
  icon,
  label,
}) => (
  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-900">
    <span className="text-indigo-500">
      {icon}
    </span>

    <span className="text-[7px] font-semibold text-slate-500 dark:text-slate-400">
      {label}
    </span>
  </div>
);

export default EventOrganizerEventDuplication;