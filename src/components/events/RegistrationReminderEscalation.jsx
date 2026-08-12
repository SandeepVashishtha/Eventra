import {
  Bell,
  BellRing,
  Check,
  CheckCircle2,
  Clock3,
  Info,
  Mail,
  PauseCircle,
  Save,
  Settings2,
  Timer,
  XCircle,
} from "lucide-react";
import { useState } from "react";

const DEFAULT_REMINDERS = [
  {
    id: 1,
    name: "First Reminder",
    description: "Sent after registration inactivity.",
    trigger: "inactivity",
    value: 24,
    unit: "hours",
    enabled: true,
  },
  {
    id: 2,
    name: "Second Reminder",
    description: "Sent before the registration deadline.",
    trigger: "before_deadline",
    value: 24,
    unit: "hours",
    enabled: true,
  },
  {
    id: 3,
    name: "Final Reminder",
    description: "Sent shortly before registration closes.",
    trigger: "before_deadline",
    value: 2,
    unit: "hours",
    enabled: true,
  },
];

const DEFAULT_SETTINGS = {
  reminders: DEFAULT_REMINDERS,
  stopAfterRegistration: true,
  stopAfterDeadline: true,
};

const formatTrigger = (reminder) => {
  if (reminder.trigger === "inactivity") {
    return `${reminder.value} ${reminder.unit} after inactivity`;
  }

  return `${reminder.value} ${reminder.unit} before deadline`;
};

const RegistrationReminderEscalation = ({
  initialSettings = DEFAULT_SETTINGS,
  isOrganizer = false,
  registrationStatus = "incomplete",
  onSave,
}) => {
  const [reminders, setReminders] = useState(
    initialSettings.reminders || DEFAULT_REMINDERS
  );

  const [stopAfterRegistration, setStopAfterRegistration] =
    useState(
      initialSettings.stopAfterRegistration ?? true
    );

  const [stopAfterDeadline, setStopAfterDeadline] =
    useState(
      initialSettings.stopAfterDeadline ?? true
    );

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const updateReminder = (id, field, value) => {
    setReminders((current) =>
      current.map((reminder) =>
        reminder.id === id
          ? { ...reminder, [field]: value }
          : reminder
      )
    );

    setSaved(false);
  };

  const toggleReminder = (id) => {
    setReminders((current) =>
      current.map((reminder) =>
        reminder.id === id
          ? {
              ...reminder,
              enabled: !reminder.enabled,
            }
          : reminder
      )
    );

    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);

    const settings = {
      reminders,
      stopAfterRegistration,
      stopAfterDeadline,
    };

    try {
      await onSave?.(settings);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const resetDefaults = () => {
    setReminders(DEFAULT_REMINDERS);
    setStopAfterRegistration(true);
    setStopAfterDeadline(true);
    setSaved(false);
  };

  const activeReminders = reminders.filter(
    (reminder) => reminder.enabled
  ).length;

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <BellRing size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Registration Management
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Registration Reminder Escalation
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Configure progressive reminders for participants
              who have not completed their registration.
            </p>
          </div>
        </div>

        {isOrganizer && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-[8px] font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save size={13} />

            {saving ? "Saving..." : "Save Settings"}
          </button>
        )}
      </div>

      {/* Saved */}
      {saved && (
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-[7px] font-semibold text-green-700 dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-400">
          <CheckCircle2 size={14} />
          Reminder settings saved successfully.
        </div>
      )}

      {/* Status */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatusCard
          icon={BellRing}
          label="Active Reminders"
          value={`${activeReminders}/3`}
        />

        <StatusCard
          icon={Clock3}
          label="Escalation Levels"
          value="3"
        />

        <StatusCard
          icon={
            registrationStatus === "completed"
              ? CheckCircle2
              : PauseCircle
          }
          label="Registration Status"
          value={
            registrationStatus === "completed"
              ? "Completed"
              : "Incomplete"
          }
        />
      </div>

      {/* Completed Registration Banner */}
      {registrationStatus === "completed" && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-900/10">
          <CheckCircle2
            size={17}
            className="mt-0.5 shrink-0 text-green-500"
          />

          <div>
            <p className="text-[8px] font-bold text-green-700 dark:text-green-400">
              Registration completed
            </p>

            <p className="mt-1 text-[7px] leading-4 text-green-700/70 dark:text-green-400/70">
              All pending registration reminders should stop
              immediately after successful registration.
            </p>
          </div>
        </div>
      )}

      {/* Reminder Levels */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
              <Settings2 size={16} />
            </div>

            <div>
              <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
                Reminder Levels
              </h3>

              <p className="mt-1 text-[7px] text-slate-400">
                Configure when each reminder should be sent.
              </p>
            </div>
          </div>

          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[6px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            {activeReminders} Active
          </span>
        </div>

        <div className="mt-5 space-y-4">
          {reminders.map((reminder, index) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              index={index}
              onToggle={() =>
                toggleReminder(reminder.id)
              }
              onUpdate={(field, value) =>
                updateReminder(
                  reminder.id,
                  field,
                  value
                )
              }
            />
          ))}
        </div>
      </div>

      {/* Stop Conditions */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
            <PauseCircle size={16} />
          </div>

          <div>
            <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
              Reminder Stop Conditions
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Automatically stop reminders when they are no longer needed.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <ToggleRow
            title="Stop after successful registration"
            description="Immediately stop all reminders once the participant completes registration."
            enabled={stopAfterRegistration}
            onToggle={() => {
              setStopAfterRegistration(
                (value) => !value
              );
              setSaved(false);
            }}
          />

          <ToggleRow
            title="Stop after registration deadline"
            description="Do not send reminders after the registration window has closed."
            enabled={stopAfterDeadline}
            onToggle={() => {
              setStopAfterDeadline(
                (value) => !value
              );
              setSaved(false);
            }}
          />
        </div>
      </div>

      {/* Timeline */}
      <ReminderTimeline reminders={reminders} />

      {/* Reset */}
      {isOrganizer && (
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={resetDefaults}
            className="rounded-xl bg-slate-100 px-4 py-2.5 text-[7px] font-bold text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            Reset Defaults
          </button>
        </div>
      )}
    </section>
  );
};

/* --------------------------------
   Reminder Card
--------------------------------- */

const ReminderCard = ({
  reminder,
  index,
  onToggle,
  onUpdate,
}) => {
  const colors = [
    "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  ];

  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        reminder.enabled
          ? "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950"
          : "border-slate-200 bg-slate-100/50 opacity-60 dark:border-slate-800 dark:bg-slate-950/50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colors[index]}`}
        >
          <Bell size={16} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-200 px-2 py-1 text-[5px] font-bold uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  Level {index + 1}
                </span>

                <h4 className="text-[9px] font-bold text-slate-800 dark:text-white">
                  {reminder.name}
                </h4>
              </div>

              <p className="mt-1 text-[7px] text-slate-400">
                {reminder.description}
              </p>
            </div>

            <button
              type="button"
              onClick={onToggle}
              className={`relative h-6 w-11 rounded-full transition ${
                reminder.enabled
                  ? "bg-indigo-600"
                  : "bg-slate-300 dark:bg-slate-700"
              }`}
              aria-label={`Toggle ${reminder.name}`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                  reminder.enabled
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
                Trigger
              </label>

              <select
                value={reminder.trigger}
                onChange={(event) =>
                  onUpdate(
                    "trigger",
                    event.target.value
                  )
                }
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[7px] outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="inactivity">
                  After inactivity
                </option>

                <option value="before_deadline">
                  Before deadline
                </option>
              </select>
            </div>

            <div>
              <label className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
                Time
              </label>

              <input
                type="number"
                min="1"
                value={reminder.value}
                onChange={(event) =>
                  onUpdate(
                    "value",
                    Number(event.target.value)
                  )
                }
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[7px] outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
                Unit
              </label>

              <select
                value={reminder.unit}
                onChange={(event) =>
                  onUpdate(
                    "unit",
                    event.target.value
                  )
                }
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[7px] outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="minutes">
                  Minutes
                </option>

                <option value="hours">
                  Hours
                </option>

                <option value="days">
                  Days
                </option>
              </select>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-xl bg-white p-3 dark:bg-slate-900">
            <Timer
              size={12}
              className="text-indigo-500"
            />

            <span className="text-[7px] font-semibold text-slate-500 dark:text-slate-400">
              {formatTrigger(reminder)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --------------------------------
   Toggle Row
--------------------------------- */

const ToggleRow = ({
  title,
  description,
  enabled,
  onToggle,
}) => {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
      <button
        type="button"
        onClick={onToggle}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
          enabled
            ? "border-indigo-600 bg-indigo-600 text-white"
            : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900"
        }`}
      >
        {enabled && <Check size={11} />}
      </button>

      <div className="min-w-0 flex-1">
        <p className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
          {title}
        </p>

        <p className="mt-1 text-[6px] leading-3 text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
};

/* --------------------------------
   Status Card
--------------------------------- */

const StatusCard = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          <Icon size={15} />
        </div>

        <div>
          <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 text-sm font-black text-slate-800 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

/* --------------------------------
   Timeline
--------------------------------- */

const ReminderTimeline = ({
  reminders,
}) => {
  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          <Clock3 size={16} />
        </div>

        <div>
          <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
            Reminder Escalation Flow
          </h3>

          <p className="mt-1 text-[7px] text-slate-400">
            Participants receive progressively urgent reminders.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {reminders.map((reminder, index) => (
          <div
            key={reminder.id}
            className="relative rounded-xl border border-slate-200 p-4 dark:border-slate-700"
          >
            <div className="flex items-center justify-between">
              <span className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
                Step {index + 1}
              </span>

              {reminder.enabled ? (
                <CheckCircle2
                  size={13}
                  className="text-green-500"
                />
              ) : (
                <XCircle
                  size={13}
                  className="text-slate-400"
                />
              )}
            </div>

            <p className="mt-3 text-[8px] font-bold text-slate-700 dark:text-slate-300">
              {reminder.name}
            </p>

            <p className="mt-1 text-[7px] text-slate-400">
              {formatTrigger(reminder)}
            </p>

            {index < reminders.length - 1 && (
              <div className="absolute -right-3 top-1/2 hidden h-px w-3 bg-slate-300 md:block dark:bg-slate-700" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RegistrationReminderEscalation;