import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_DEADLINES = [
  {
    id: 1,
    name: "Registration Deadline",
    date: "August 20, 2026",
    time: "11:59 PM",
    event: "AI Innovation Hackathon",
    completed: true,
  },
  {
    id: 2,
    name: "Team Formation",
    date: "August 22, 2026",
    time: "06:00 PM",
    event: "AI Innovation Hackathon",
    completed: false,
  },
  {
    id: 3,
    name: "Project Submission",
    date: "August 25, 2026",
    time: "11:59 PM",
    event: "AI Innovation Hackathon",
    completed: false,
  },
  {
    id: 4,
    name: "Workshop Selection",
    date: "August 27, 2026",
    time: "05:00 PM",
    event: "Tech Conference 2026",
    completed: false,
  },
];

const EventParticipantDeadlineTimeline = ({
  deadlines = DEFAULT_DEADLINES,
}) => {
  const [filter, setFilter] = useState("All");

  const getDeadlineDate = (deadline) =>
    new Date(`${deadline.date} ${deadline.time}`);

  const getTimeStatus = (deadline) => {
    if (deadline.completed) {
      return {
        label: "Completed",
        type: "completed",
      };
    }

    const now = new Date();
    const deadlineDate = getDeadlineDate(deadline);
    const difference = deadlineDate - now;

    if (difference < 0) {
      return {
        label: "Overdue",
        type: "overdue",
      };
    }

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days === 0) {
      return {
        label: `${hours}h remaining`,
        type: "urgent",
      };
    }

    if (days <= 2) {
      return {
        label: `${days}d remaining`,
        type: "urgent",
      };
    }

    return {
      label: `${days}d remaining`,
      type: "upcoming",
    };
  };

  const filteredDeadlines = useMemo(() => {
    return deadlines.filter((deadline) => {
      const status = getTimeStatus(deadline);

      if (filter === "Completed") {
        return status.type === "completed";
      }

      if (filter === "Upcoming") {
        return (
          status.type === "upcoming" ||
          status.type === "urgent"
        );
      }

      if (filter === "Overdue") {
        return status.type === "overdue";
      }

      return true;
    });
  }, [deadlines, filter]);

  const completedCount = deadlines.filter(
    (deadline) => deadline.completed
  ).length;

  const overdueCount = deadlines.filter(
    (deadline) => getTimeStatus(deadline).type === "overdue"
  ).length;

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <CalendarClock size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Participant Dashboard
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Deadline Timeline
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Track all important deadlines related to your events.
            </p>
          </div>
        </div>

        <div className="rounded-full bg-indigo-50 px-3 py-1.5 text-[6px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          {deadlines.length} Deadlines
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Total Deadlines"
          value={deadlines.length}
          icon={<CalendarClock size={16} />}
        />

        <SummaryCard
          label="Completed"
          value={completedCount}
          icon={<CheckCircle2 size={16} />}
          type="success"
        />

        <SummaryCard
          label="Overdue"
          value={overdueCount}
          icon={<AlertCircle size={16} />}
          type="danger"
        />
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        {["All", "Upcoming", "Completed", "Overdue"].map(
          (item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-xl px-4 py-2 text-[7px] font-bold transition ${
                filter === item
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-900 dark:text-slate-400"
              }`}
            >
              {item}
            </button>
          )
        )}
      </div>

      {/* Timeline */}
      <div className="mt-7">
        {filteredDeadlines.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
            <CalendarClock
              size={25}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-[8px] font-bold text-slate-500">
              No deadlines found
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute bottom-5 left-[19px] top-5 w-px bg-slate-200 dark:bg-slate-700" />

            <div className="space-y-6">
              {filteredDeadlines.map((deadline) => {
                const status = getTimeStatus(deadline);

                return (
                  <TimelineItem
                    key={deadline.id}
                    deadline={deadline}
                    status={status}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const TimelineItem = ({ deadline, status }) => {
  const statusStyles = {
    completed: {
      dot: "bg-green-500",
      badge:
        "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    },
    overdue: {
      dot: "bg-red-500",
      badge:
        "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    },
    urgent: {
      dot: "bg-amber-500",
      badge:
        "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    },
    upcoming: {
      dot: "bg-indigo-500",
      badge:
        "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
    },
  };

  const style = statusStyles[status.type];

  return (
    <div className="relative flex gap-4">
      {/* Timeline dot */}
      <div
        className={`relative z-10 mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${style.dot} text-white shadow-sm`}
      >
        {status.type === "completed" ? (
          <CheckCircle2 size={17} />
        ) : status.type === "overdue" ? (
          <AlertCircle size={17} />
        ) : (
          <Clock3 size={17} />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
                {deadline.name}
              </h3>

              <span
                className={`rounded-full px-2.5 py-1 text-[5px] font-bold ${style.badge}`}
              >
                {status.label}
              </span>
            </div>

            <p className="mt-2 text-[7px] font-medium text-slate-500 dark:text-slate-400">
              {deadline.event}
            </p>
          </div>

          <div className="shrink-0 rounded-xl bg-slate-50 px-3 py-2 text-left sm:text-right dark:bg-slate-800">
            <p className="text-[7px] font-bold text-slate-700 dark:text-slate-200">
              {deadline.date}
            </p>

            <p className="mt-0.5 text-[6px] text-slate-400">
              {deadline.time}
            </p>
          </div>
        </div>

        {/* Progress indicator */}
        {!deadline.completed && status.type !== "overdue" && (
          <div className="mt-4">
            <div className="flex justify-between text-[5px] text-slate-400">
              <span>Time remaining</span>
              <span>{status.label}</span>
            </div>

            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={`h-full rounded-full ${
                  status.type === "urgent"
                    ? "w-3/4 bg-amber-500"
                    : "w-1/2 bg-indigo-500"
                }`}
              />
            </div>
          </div>
        )}

        {status.type === "overdue" && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-[6px] font-semibold text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <AlertCircle size={11} />
            This deadline has passed. Please check with the organizer.
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({
  label,
  value,
  icon,
  type = "default",
}) => {
  const styles = {
    default:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
    success:
      "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    danger:
      "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <div className={`rounded-lg p-2 ${styles[type]}`}>
          {icon}
        </div>

        <span className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </span>
      </div>

      <p className="mt-4 text-2xl font-black text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
};

export default EventParticipantDeadlineTimeline;