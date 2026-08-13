import {
  AlertTriangle,
  CalendarDays,
  Clock,
  Edit3,
  MapPin,
  Plus,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const SESSION_TYPES = [
  "Keynote",
  "Workshop",
  "Panel",
  "Talk",
  "Demo",
  "Networking",
];

const emptyForm = {
  speakerId: "",
  sessionName: "",
  date: "",
  startTime: "",
  endTime: "",
  venue: "",
  sessionType: "Talk",
};

const EventSessionSpeakerSchedule = ({
  initialSchedules = [],
  speakers = [],
  onCreate,
  onUpdate,
  onDelete,
  className = "",
}) => {
  const [schedules, setSchedules] =
    useState(initialSchedules);

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [form, setForm] =
    useState(emptyForm);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [filterDate, setFilterDate] =
    useState("");

  const overlappingIds = useMemo(() => {
    const conflicts = new Set();

    schedules.forEach((current) => {
      schedules.forEach((other) => {
        if (current.id === other.id) return;

        if (
          current.speakerId !==
          other.speakerId
        ) {
          return;
        }

        if (
          current.date !== other.date
        ) {
          return;
        }

        if (
          timesOverlap(
            current.startTime,
            current.endTime,
            other.startTime,
            other.endTime
          )
        ) {
          conflicts.add(current.id);
          conflicts.add(other.id);
        }
      });
    });

    return conflicts;
  }, [schedules]);

  const visibleSchedules = useMemo(() => {
    if (!filterDate) {
      return schedules;
    }

    return schedules.filter(
      (item) =>
        item.date === filterDate
    );
  }, [schedules, filterDate]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
    setShowForm(true);
  };

  const openEdit = (schedule) => {
    setEditingId(schedule.id);

    setForm({
      speakerId:
        schedule.speakerId || "",
      sessionName:
        schedule.sessionName || "",
      date: schedule.date || "",
      startTime:
        schedule.startTime || "",
      endTime:
        schedule.endTime || "",
      venue: schedule.venue || "",
      sessionType:
        schedule.sessionType || "Talk",
    });

    setError("");
    setMessage("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const updateField = (
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!form.speakerId) {
      setError(
        "Please select a speaker."
      );
      return;
    }

    if (!form.sessionName.trim()) {
      setError(
        "Session name is required."
      );
      return;
    }

    if (!form.date) {
      setError(
        "Please select a date."
      );
      return;
    }

    if (!form.startTime || !form.endTime) {
      setError(
        "Start and end times are required."
      );
      return;
    }

    if (
      form.startTime >=
      form.endTime
    ) {
      setError(
        "End time must be after start time."
      );
      return;
    }

    if (!form.venue.trim()) {
      setError(
        "Venue is required."
      );
      return;
    }

    const speaker =
      speakers.find(
        (item) =>
          String(item.id) ===
          String(form.speakerId)
      );

    const schedule = {
      id:
        editingId ||
        `speaker-schedule-${Date.now()}`,
      speakerId:
        form.speakerId,
      speakerName:
        speaker?.name ||
        "Unknown Speaker",
      sessionName:
        form.sessionName.trim(),
      date: form.date,
      startTime:
        form.startTime,
      endTime:
        form.endTime,
      venue:
        form.venue.trim(),
      sessionType:
        form.sessionType,
      updatedAt:
        new Date().toISOString(),
    };

    try {
      if (editingId) {
        setSchedules((current) =>
          current.map((item) =>
            item.id === editingId
              ? {
                  ...item,
                  ...schedule,
                }
              : item
          )
        );

        await onUpdate?.(schedule);

        setMessage(
          "Speaker schedule updated successfully."
        );
      } else {
        setSchedules((current) => [
          ...current,
          schedule,
        ]);

        await onCreate?.(schedule);

        setMessage(
          "Speaker schedule created successfully."
        );
      }

      closeForm();
    } catch (err) {
      setError(
        err?.message ||
          "Unable to save speaker schedule."
      );
    }
  };

  const handleDelete = async (
    schedule
  ) => {
    if (
      !window.confirm(
        `Remove ${schedule.speakerName}'s schedule?`
      )
    ) {
      return;
    }

    try {
      setSchedules((current) =>
        current.filter(
          (item) =>
            item.id !== schedule.id
        )
      );

      await onDelete?.(schedule);

      setMessage(
        "Speaker schedule removed successfully."
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to remove schedule."
      );
    }
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <CalendarDays size={20} />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Tools
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Speaker Schedule
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Manage speaker assignments, sessions, venues,
              and schedules.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-[8px] font-bold text-white hover:bg-indigo-700"
        >
          <Plus size={14} />
          Add Speaker Schedule
        </button>
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Schedules"
          value={schedules.length}
        />

        <SummaryCard
          label="Speakers"
          value={
            new Set(
              schedules.map(
                (item) =>
                  item.speakerId
              )
            ).size
          }
        />

        <SummaryCard
          label="Conflicts"
          value={overlappingIds.size}
        />
      </div>

      {/* Date filter */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <label className="text-[8px] font-bold text-slate-600 dark:text-slate-300">
            Filter by date
          </label>

          <div className="mt-2 flex gap-2">
            <input
              type="date"
              value={filterDate}
              onChange={(event) =>
                setFilterDate(
                  event.target.value
                )
              }
              className={inputClass}
            />

            {filterDate && (
              <button
                type="button"
                onClick={() =>
                  setFilterDate("")
                }
                className="rounded-xl border border-slate-200 bg-white px-4 text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Conflict warning */}
      {overlappingIds.size > 0 && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
          <AlertTriangle
            size={17}
            className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
          />

          <div>
            <p className="text-[9px] font-bold text-amber-700 dark:text-amber-400">
              Speaker scheduling conflicts detected
            </p>

            <p className="mt-1 text-[7px] leading-4 text-amber-700/70 dark:text-amber-400/70">
              One or more speakers are assigned to overlapping
              sessions on the same date.
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold text-indigo-700 dark:text-indigo-400">
                {editingId
                  ? "Edit Speaker Schedule"
                  : "Add Speaker Schedule"}
              </p>

              <p className="mt-1 text-[7px] text-indigo-700/60 dark:text-indigo-400/60">
                Assign a speaker to a specific event session.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg p-2 text-slate-400 hover:bg-white dark:hover:bg-slate-900"
            >
              <X size={15} />
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <FormField
              label="Speaker"
              required
            >
              <select
                value={form.speakerId}
                onChange={(event) =>
                  updateField(
                    "speakerId",
                    event.target.value
                  )
                }
                className={inputClass}
              >
                <option value="">
                  Select speaker
                </option>

                {speakers.map(
                  (speaker) => (
                    <option
                      key={speaker.id}
                      value={speaker.id}
                    >
                      {speaker.name}
                    </option>
                  )
                )}
              </select>
            </FormField>

            <FormField
              label="Session Name"
              required
            >
              <input
                type="text"
                value={form.sessionName}
                onChange={(event) =>
                  updateField(
                    "sessionName",
                    event.target.value
                  )
                }
                placeholder="AI in Modern Applications"
                className={inputClass}
              />
            </FormField>

            <FormField
              label="Date"
              required
            >
              <input
                type="date"
                value={form.date}
                onChange={(event) =>
                  updateField(
                    "date",
                    event.target.value
                  )
                }
                className={inputClass}
              />
            </FormField>

            <FormField
              label="Session Type"
              required
            >
              <select
                value={
                  form.sessionType
                }
                onChange={(event) =>
                  updateField(
                    "sessionType",
                    event.target.value
                  )
                }
                className={inputClass}
              >
                {SESSION_TYPES.map(
                  (type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  )
                )}
              </select>
            </FormField>

            <FormField
              label="Start Time"
              required
            >
              <input
                type="time"
                value={form.startTime}
                onChange={(event) =>
                  updateField(
                    "startTime",
                    event.target.value
                  )
                }
                className={inputClass}
              />
            </FormField>

            <FormField
              label="End Time"
              required
            >
              <input
                type="time"
                value={form.endTime}
                onChange={(event) =>
                  updateField(
                    "endTime",
                    event.target.value
                  )
                }
                className={inputClass}
              />
            </FormField>

            <div className="md:col-span-2">
              <FormField
                label="Venue"
                required
              >
                <input
                  type="text"
                  value={form.venue}
                  onChange={(event) =>
                    updateField(
                      "venue",
                      event.target.value
                    )
                  }
                  placeholder="Main Auditorium"
                  className={inputClass}
                />
              </FormField>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 p-3 text-[8px] font-semibold text-red-600 dark:bg-red-900/10 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={closeForm}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-[8px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-5 py-3 text-[8px] font-bold text-white hover:bg-indigo-700"
            >
              {editingId
                ? "Update Schedule"
                : "Add Schedule"}
            </button>
          </div>
        </form>
      )}

      {/* Schedule list */}
      <div className="mt-6 space-y-3">
        {visibleSchedules.length === 0 ? (
          <EmptyState
            onAdd={openCreate}
          />
        ) : (
          visibleSchedules.map(
            (schedule) => {
              const hasConflict =
                overlappingIds.has(
                  schedule.id
                );

              return (
                <ScheduleCard
                  key={schedule.id}
                  schedule={schedule}
                  hasConflict={
                    hasConflict
                  }
                  onEdit={openEdit}
                  onDelete={
                    handleDelete
                  }
                />
              );
            }
          )
        )}
      </div>

      {message && (
        <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-3 text-[8px] font-semibold text-green-600 dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-400">
          {message}
        </div>
      )}
    </section>
  );
};

const ScheduleCard = ({
  schedule,
  hasConflict,
  onEdit,
  onDelete,
}) => (
  <article
    className={`rounded-2xl border bg-white p-4 dark:bg-slate-900 ${
      hasConflict
        ? "border-amber-300 dark:border-amber-700"
        : "border-slate-200 dark:border-slate-700"
    }`}
  >
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex min-w-0 gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/10 dark:text-indigo-400">
          <User size={17} />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              {schedule.speakerName}
            </h3>

            <span className="rounded-full bg-indigo-50 px-2 py-1 text-[6px] font-bold text-indigo-600 dark:bg-indigo-900/10 dark:text-indigo-400">
              {schedule.sessionType}
            </span>

            {hasConflict && (
              <span className="rounded-full bg-amber-50 px-2 py-1 text-[6px] font-bold text-amber-600 dark:bg-amber-900/10 dark:text-amber-400">
                Conflict
              </span>
            )}
          </div>

          <p className="mt-1 text-[9px] font-semibold text-slate-600 dark:text-slate-300">
            {schedule.sessionName}
          </p>

          <div className="mt-3 flex flex-wrap gap-3">
            <Info
              icon={<CalendarDays size={11} />}
              value={formatDate(
                schedule.date
              )}
            />

            <Info
              icon={<Clock size={11} />}
              value={`${schedule.startTime} – ${schedule.endTime}`}
            />

            <Info
              icon={<MapPin size={11} />}
              value={schedule.venue}
            />
          </div>
        </div>
      </div>

      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() =>
            onEdit(schedule)
          }
          className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Edit schedule"
        >
          <Edit3 size={13} />
        </button>

        <button
          type="button"
          onClick={() =>
            onDelete(schedule)
          }
          className="rounded-xl border border-red-200 p-2 text-red-500 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/10"
          aria-label="Delete schedule"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  </article>
);

const SummaryCard = ({
  label,
  value,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1 text-xl font-bold text-slate-800 dark:text-white">
      {value}
    </p>
  </div>
);

const Info = ({
  icon,
  value,
}) => (
  <span className="inline-flex items-center gap-1 text-[7px] font-semibold text-slate-500 dark:text-slate-400">
    {icon}
    {value}
  </span>
);

const FormField = ({
  label,
  required,
  children,
}) => (
  <div>
    <label className="text-[8px] font-bold text-slate-600 dark:text-slate-300">
      {label}

      {required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </label>

    <div className="mt-2">
      {children}
    </div>
  </div>
);

const EmptyState = ({
  onAdd,
}) => (
  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
    <CalendarDays
      size={25}
      className="mx-auto text-slate-400"
    />

    <p className="mt-3 text-[9px] font-bold text-slate-700 dark:text-slate-200">
      No speaker schedules found
    </p>

    <p className="mt-1 text-[7px] text-slate-400">
      Add speakers and assign them to event sessions.
    </p>

    <button
      type="button"
      onClick={onAdd}
      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-[8px] font-bold text-white"
    >
      <Plus size={13} />
      Add Schedule
    </button>
  </div>
);

const timesOverlap = (
  startA,
  endA,
  startB,
  endB
) => {
  if (
    !startA ||
    !endA ||
    !startB ||
    !endB
  ) {
    return false;
  }

  return (
    startA < endB &&
    endA > startB
  );
};

const formatDate = (
  value
) => {
  if (!value) {
    return "No date";
  }

  const date = new Date(
    `${value}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white";

export default EventSessionSpeakerSchedule;