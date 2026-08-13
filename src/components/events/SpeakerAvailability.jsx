import {
  CalendarDays,
  Check,
  Clock3,
  Mic2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";

const SESSION_TYPES = [
  "Workshop",
  "Keynote",
  "Panel",
  "Technical Talk",
  "Fireside Chat",
  "Demo",
];

const DEFAULT_AVAILABILITY = {
  dates: [],
  slots: [],
  preferredDuration: 60,
  preferredSessionType: "Technical Talk",
};

const SpeakerAvailability = ({
  speaker = {
    name: "Speaker",
    email: "",
  },
  initialAvailability = DEFAULT_AVAILABILITY,
  isOrganizer = false,
  onSave,
}) => {
  const [dates, setDates] = useState(
    initialAvailability.dates || []
  );

  const [slots, setSlots] = useState(
    initialAvailability.slots || []
  );

  const [preferredDuration, setPreferredDuration] =
    useState(
      initialAvailability.preferredDuration || 60
    );

  const [preferredSessionType, setPreferredSessionType] =
    useState(
      initialAvailability.preferredSessionType ||
        "Technical Talk"
    );

  const [newDate, setNewDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const addDate = () => {
    if (!newDate || dates.includes(newDate)) {
      return;
    }

    setDates((current) =>
      [...current, newDate].sort()
    );

    setNewDate("");
    setSaved(false);
  };

  const removeDate = (date) => {
    setDates((current) =>
      current.filter((item) => item !== date)
    );

    setSaved(false);
  };

  const addSlot = () => {
    if (!startTime || !endTime) {
      return;
    }

    if (startTime >= endTime) {
      return;
    }

    const exists = slots.some(
      (slot) =>
        slot.start === startTime &&
        slot.end === endTime
    );

    if (exists) {
      return;
    }

    setSlots((current) => [
      ...current,
      {
        id: Date.now(),
        start: startTime,
        end: endTime,
      },
    ]);

    setStartTime("");
    setEndTime("");
    setSaved(false);
  };

  const removeSlot = (id) => {
    setSlots((current) =>
      current.filter((slot) => slot.id !== id)
    );

    setSaved(false);
  };

  const handleSave = async () => {
    const availability = {
      dates,
      slots,
      preferredDuration,
      preferredSessionType,
    };

    setSaving(true);

    try {
      await onSave?.(availability);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Mic2 size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Speaker Management
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Speaker Availability
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {speaker.name
                ? `Manage availability for ${speaker.name}.`
                : "Manage speaker availability before scheduling sessions."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-[8px] font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          <Save size={13} />

          {saving ? "Saving..." : "Save Availability"}
        </button>
      </div>

      {/* Saved */}
      {saved && (
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-[7px] font-semibold text-green-700 dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-400">
          <Check size={14} />
          Speaker availability saved successfully.
        </div>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {/* Available Dates */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
              <CalendarDays size={16} />
            </div>

            <div>
              <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
                Available Dates
              </h3>

              <p className="mt-1 text-[7px] text-slate-400">
                Select dates when the speaker is available.
              </p>
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <input
              type="date"
              value={newDate}
              onChange={(event) =>
                setNewDate(event.target.value)
              }
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[8px] outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />

            <button
              type="button"
              onClick={addDate}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <Plus size={15} />
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {dates.length === 0 ? (
              <EmptyState text="No available dates added yet." />
            ) : (
              dates.map((date) => (
                <div
                  key={date}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950"
                >
                  <div className="flex items-center gap-2">
                    <CalendarDays
                      size={13}
                      className="text-indigo-500"
                    />

                    <span className="text-[8px] font-semibold text-slate-700 dark:text-slate-300">
                      {formatDate(date)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeDate(date)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Time Slots */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
              <Clock3 size={16} />
            </div>

            <div>
              <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
                Available Time Slots
              </h3>

              <p className="mt-1 text-[7px] text-slate-400">
                Define the time ranges when the speaker can present.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-[1fr_1fr_auto] gap-2">
            <input
              type="time"
              value={startTime}
              onChange={(event) =>
                setStartTime(event.target.value)
              }
              className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-2 py-2.5 text-[8px] outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />

            <input
              type="time"
              value={endTime}
              onChange={(event) =>
                setEndTime(event.target.value)
              }
              className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-2 py-2.5 text-[8px] outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />

            <button
              type="button"
              onClick={addSlot}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <Plus size={15} />
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {slots.length === 0 ? (
              <EmptyState text="No available time slots added yet." />
            ) : (
              slots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950"
                >
                  <div className="flex items-center gap-2">
                    <Clock3
                      size={13}
                      className="text-indigo-500"
                    />

                    <span className="text-[8px] font-semibold text-slate-700 dark:text-slate-300">
                      {formatTime(slot.start)} –{" "}
                      {formatTime(slot.end)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeSlot(slot.id)
                    }
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Mic2 size={16} />
          </div>

          <div>
            <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
              Session Preferences
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Help organizers find suitable sessions for this speaker.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-[7px] font-bold text-slate-600 dark:text-slate-300">
              Preferred Session Duration
            </label>

            <select
              value={preferredDuration}
              onChange={(event) => {
                setPreferredDuration(
                  Number(event.target.value)
                );
                setSaved(false);
              }}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[8px] outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
              <option value={120}>120 minutes</option>
            </select>
          </div>

          <div>
            <label className="text-[7px] font-bold text-slate-600 dark:text-slate-300">
              Preferred Session Type
            </label>

            <select
              value={preferredSessionType}
              onChange={(event) => {
                setPreferredSessionType(
                  event.target.value
                );
                setSaved(false);
              }}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[8px] outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              {SESSION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Organizer Schedule View */}
      {isOrganizer && (
        <OrganizerAvailabilitySummary
          dates={dates}
          slots={slots}
          preferredDuration={preferredDuration}
          preferredSessionType={
            preferredSessionType
          }
        />
      )}
    </section>
  );
};

/* --------------------------------
   Organizer Summary
--------------------------------- */

const OrganizerAvailabilitySummary = ({
  dates,
  slots,
  preferredDuration,
  preferredSessionType,
}) => {
  return (
    <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50 p-5 dark:border-indigo-900/30 dark:bg-indigo-900/10">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-indigo-600 dark:bg-slate-900 dark:text-indigo-400">
          <Check size={16} />
        </div>

        <div>
          <h3 className="text-[9px] font-bold text-indigo-900 dark:text-indigo-300">
            Scheduling Summary
          </h3>

          <p className="mt-1 text-[7px] text-indigo-700/70 dark:text-indigo-400/70">
            Use this information when assigning sessions.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <SummaryItem
          label="Available Dates"
          value={dates.length}
        />

        <SummaryItem
          label="Time Slots"
          value={slots.length}
        />

        <SummaryItem
          label="Preferred Duration"
          value={`${preferredDuration} min`}
        />
      </div>

      <div className="mt-3 rounded-xl bg-white p-3 dark:bg-slate-900">
        <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
          Preferred Session Type
        </p>

        <p className="mt-1 text-[8px] font-bold text-slate-700 dark:text-slate-300">
          {preferredSessionType}
        </p>
      </div>
    </div>
  );
};

/* --------------------------------
   Summary Item
--------------------------------- */

const SummaryItem = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-xl bg-white p-3 dark:bg-slate-900">
      <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-lg font-black text-slate-800 dark:text-white">
        {value}
      </p>
    </div>
  );
};

/* --------------------------------
   Empty State
--------------------------------- */

const EmptyState = ({ text }) => {
  return (
    <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 p-5 dark:border-slate-700">
      <p className="text-[7px] text-slate-400">
        {text}
      </p>
    </div>
  );
};

/* --------------------------------
   Date Formatting
--------------------------------- */

const formatDate = (date) => {
  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/* --------------------------------
   Time Formatting
--------------------------------- */

const formatTime = (time) => {
  const [hours, minutes] = time.split(":");
  const date = new Date();

  date.setHours(
    Number(hours),
    Number(minutes),
    0,
    0
  );

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
};

export default SpeakerAvailability;