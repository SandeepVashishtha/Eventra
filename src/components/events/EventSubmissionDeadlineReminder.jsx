import {
  Bell,
  CheckCircle2,
  Clock3,
  FileCheck2,
  AlertTriangle,
  CalendarClock,
} from "lucide-react";
import { useState } from "react";

const DEFAULT_DATA = {
  title: "Hackathon Project Submission",
  deadline: "August 20, 2026 · 11:59 PM",
  completed: false,
  reminders: [
    {
      id: 1,
      label: "1 week before",
      timing: "August 13, 2026",
      status: "Scheduled",
    },
    {
      id: 2,
      label: "1 day before",
      timing: "August 19, 2026",
      status: "Scheduled",
    },
    {
      id: 3,
      label: "1 hour before",
      timing: "August 20, 2026 · 10:59 PM",
      status: "Scheduled",
    },
  ],
};

const EventSubmissionDeadlineReminder = ({
  data = DEFAULT_DATA,
  onSubmit,
}) => {
  const [reminders, setReminders] = useState(data.reminders);

  const completed = data.completed;

  const handleReminderToggle = (id) => {
    setReminders((current) =>
      current.map((reminder) =>
        reminder.id === id
          ? {
              ...reminder,
              status:
                reminder.status === "Scheduled"
                  ? "Disabled"
                  : "Scheduled",
            }
          : reminder
      )
    );
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Bell size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Submission Reminder
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Submission Deadline Reminder
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Keep participants informed about upcoming project or
              assignment submission deadlines.
            </p>
          </div>
        </div>

        <StatusBadge completed={completed} />
      </div>

      {/* Submission Details */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <FileCheck2 size={16} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
              Submission
            </p>

            <h3 className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
              {data.title}
            </h3>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[6px] font-bold text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                <Clock3 size={11} />
                Deadline
              </span>

              <span className="text-[7px] font-bold text-slate-600 dark:text-slate-300">
                {data.deadline}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Completion State */}
      {completed ? (
        <div className="mt-6 rounded-2xl border border-green-100 bg-green-50 p-5 dark:border-green-900/30 dark:bg-green-900/10">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <CheckCircle2 size={16} />
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-green-800 dark:text-green-300">
                Submission Completed
              </h3>

              <p className="mt-1 text-[7px] leading-relaxed text-green-700 dark:text-green-400">
                Your submission has been completed. All future deadline
                reminders have been automatically stopped.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Reminder Schedule */}
          <div className="mt-6">
            <div className="mb-4 flex items-center gap-3">
              <CalendarClock
                size={16}
                className="text-indigo-600 dark:text-indigo-400"
              />

              <div>
                <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
                  Reminder Schedule
                </h3>

                <p className="mt-1 text-[7px] text-slate-400">
                  Reminders are sent automatically until the submission
                  is completed.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {reminders.map((reminder) => (
                <ReminderRow
                  key={reminder.id}
                  reminder={reminder}
                  onToggle={() =>
                    handleReminderToggle(reminder.id)
                  }
                />
              ))}
            </div>
          </div>

          {/* Warning */}
          <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={15}
                className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
              />

              <div>
                <h3 className="text-[8px] font-bold text-amber-800 dark:text-amber-300">
                  Deadline Reminder
                </h3>

                <p className="mt-1 text-[7px] leading-relaxed text-amber-700 dark:text-amber-400">
                  Complete your submission before the deadline to avoid
                  missing the event requirement. Reminders will stop
                  automatically after successful submission.
                </p>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[7px] text-slate-500 dark:text-slate-400">
              Need to submit your project?
            </p>

            <button
              type="button"
              onClick={onSubmit}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-[7px] font-bold text-white transition hover:bg-indigo-700"
            >
              Complete Submission
            </button>
          </div>
        </>
      )}
    </section>
  );
};

const ReminderRow = ({ reminder, onToggle }) => {
  const enabled = reminder.status === "Scheduled";

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            enabled
              ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
              : "bg-slate-100 text-slate-400 dark:bg-slate-800"
          }`}
        >
          <Bell size={15} />
        </div>

        <div>
          <h4 className="text-[8px] font-bold text-slate-800 dark:text-white">
            {reminder.label}
          </h4>

          <p className="mt-1 text-[6px] text-slate-400">
            {reminder.timing}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <span
          className={`rounded-full px-2.5 py-1 text-[5px] font-bold ${
            enabled
              ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          {reminder.status}
        </span>

        <button
          type="button"
          onClick={onToggle}
          className="rounded-lg bg-slate-100 px-3 py-1.5 text-[6px] font-bold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400"
        >
          {enabled ? "Disable" : "Enable"}
        </button>
      </div>
    </div>
  );
};

const StatusBadge = ({ completed }) => (
  <span
    className={`w-fit rounded-full px-3 py-1.5 text-[6px] font-bold ${
      completed
        ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
        : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
    }`}
  >
    {completed ? "Completed" : "Reminders Active"}
  </span>
);

export default EventSubmissionDeadlineReminder;