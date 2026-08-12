import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Flag,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEADLINE_TYPES = [
  "Registration",
  "Team Formation",
  "Proposal Submission",
  "Project Submission",
  "Session Selection",
  "Feedback",
  "Certificate Requests",
];

const STATUS_ORDER = {
  Overdue: 0,
  "Due Soon": 1,
  Upcoming: 2,
  Completed: 3,
};

const EventDeadlineOverview = ({
  deadlines = [],
  dueSoonDays = 3,
  onDeadlineSelect,
  className = "",
}) => {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const calculatedDeadlines = useMemo(() => {
    return deadlines
      .map((deadline) => ({
        ...deadline,
        status: getDeadlineStatus(
          deadline,
          dueSoonDays
        ),
      }))
      .sort((a, b) => {
        if (
          STATUS_ORDER[a.status] !==
          STATUS_ORDER[b.status]
        ) {
          return (
            STATUS_ORDER[a.status] -
            STATUS_ORDER[b.status]
          );
        }

        return (
          new Date(a.date) -
          new Date(b.date)
        );
      });
  }, [deadlines, dueSoonDays]);

  const filteredDeadlines = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return calculatedDeadlines.filter(
      (deadline) => {
        const matchesFilter =
          filter === "All" ||
          deadline.status === filter;

        const matchesSearch =
          !query ||
          deadline.title
            ?.toLowerCase()
            .includes(query) ||
          deadline.type
            ?.toLowerCase()
            .includes(query);

        return (
          matchesFilter &&
          matchesSearch
        );
      }
    );
  }, [
    calculatedDeadlines,
    filter,
    search,
  ]);

  const summary = useMemo(
    () => ({
      total: calculatedDeadlines.length,

      upcoming:
        calculatedDeadlines.filter(
          (item) =>
            item.status === "Upcoming"
        ).length,

      dueSoon:
        calculatedDeadlines.filter(
          (item) =>
            item.status === "Due Soon"
        ).length,

      overdue:
        calculatedDeadlines.filter(
          (item) =>
            item.status === "Overdue"
        ).length,

      completed:
        calculatedDeadlines.filter(
          (item) =>
            item.status === "Completed"
        ).length,
    }),
    [calculatedDeadlines]
  );

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <CalendarClock size={20} />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Event Timeline
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Deadline Overview
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Track important event deadlines in one place.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white px-4 py-2.5 text-center shadow-sm dark:bg-slate-900">
          <p className="text-[6px] font-bold uppercase tracking-wider text-slate-400">
            Total Deadlines
          </p>

          <p className="mt-1 text-xl font-black text-slate-800 dark:text-white">
            {summary.total}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          label="Upcoming"
          value={summary.upcoming}
          icon={<Clock3 size={15} />}
          type="upcoming"
        />

        <SummaryCard
          label="Due Soon"
          value={summary.dueSoon}
          icon={<AlertCircle size={15} />}
          type="soon"
        />

        <SummaryCard
          label="Overdue"
          value={summary.overdue}
          icon={<Flag size={15} />}
          type="overdue"
        />

        <SummaryCard
          label="Completed"
          value={summary.completed}
          icon={<CheckCircle2 size={15} />}
          type="completed"
        />
      </div>

      {/* Critical Alert */}
      {summary.overdue > 0 && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/10">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
          />

          <div>
            <p className="text-[9px] font-bold text-red-700 dark:text-red-400">
              Overdue Deadlines
            </p>

            <p className="mt-1 text-[7px] leading-4 text-red-700/70 dark:text-red-400/70">
              {summary.overdue} deadline
              {summary.overdue !== 1
                ? "s are"
                : " is"}{" "}
              overdue and require attention.
            </p>
          </div>
        </div>
      )}

      {/* Search + Filters */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search deadlines..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white lg:max-w-sm"
          />

          <div className="flex flex-wrap gap-2">
            {[
              "All",
              "Upcoming",
              "Due Soon",
              "Overdue",
              "Completed",
            ].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() =>
                  setFilter(status)
                }
                className={`rounded-xl px-3 py-2 text-[7px] font-bold transition ${
                  filter === status
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Deadline List */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold text-slate-800 dark:text-white">
              Event Deadlines
            </p>

            <p className="mt-1 text-[7px] text-slate-400">
              Registration, submissions, sessions, feedback,
              and certificate deadlines.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-[7px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            {filteredDeadlines.length}
          </span>
        </div>

        {filteredDeadlines.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-4 space-y-3">
            {filteredDeadlines.map(
              (deadline) => (
                <DeadlineRow
                  key={deadline.id}
                  deadline={deadline}
                  onSelect={() =>
                    onDeadlineSelect?.(
                      deadline
                    )
                  }
                />
              )
            )}
          </div>
        )}
      </div>

      {/* Timeline */}
      <DeadlineTimeline
        deadlines={calculatedDeadlines}
      />
    </section>
  );
};

/* --------------------------------
   Deadline Row
--------------------------------- */

const DeadlineRow = ({
  deadline,
  onSelect,
}) => {
  const styles =
    getStatusStyles(
      deadline.status
    );

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group w-full rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-indigo-200 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-800"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Icon */}
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.bg} ${styles.text}`}
        >
          {getDeadlineIcon(
            deadline.type
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[9px] font-bold text-slate-800 dark:text-white">
              {deadline.title}
            </p>

            <StatusBadge
              status={deadline.status}
            />
          </div>

          <p className="mt-1 text-[7px] text-slate-400">
            {deadline.type}
          </p>

          {deadline.description && (
            <p className="mt-1 text-[7px] leading-4 text-slate-500 dark:text-slate-400">
              {deadline.description}
            </p>
          )}
        </div>

        {/* Date */}
        <div className="shrink-0 text-left sm:text-right">
          <p
            className={`text-[8px] font-bold ${styles.text}`}
          >
            {formatDate(deadline.date)}
          </p>

          {deadline.status !==
            "Completed" && (
            <p className="mt-1 text-[7px] text-slate-400">
              {getRelativeText(
                deadline.date
              )}
            </p>
          )}
        </div>
      </div>
    </button>
  );
};

/* --------------------------------
   Timeline
--------------------------------- */

const DeadlineTimeline = ({
  deadlines,
}) => {
  const timelineItems =
    deadlines.slice(0, 6);

  if (timelineItems.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <CalendarClock
          size={15}
          className="text-indigo-600 dark:text-indigo-400"
        />

        <p className="text-[9px] font-bold text-slate-800 dark:text-white">
          Deadline Timeline
        </p>
      </div>

      <div className="mt-5 space-y-5">
        {timelineItems.map(
          (deadline, index) => {
            const styles =
              getStatusStyles(
                deadline.status
              );

            return (
              <div
                key={`timeline-${deadline.id}`}
                className="flex gap-3"
              >
                <div className="relative">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${styles.bg} ${styles.text}`}
                  >
                    {deadline.status ===
                    "Completed" ? (
                      <CheckCircle2
                        size={14}
                      />
                    ) : (
                      <Clock3 size={14} />
                    )}
                  </div>

                  {index !==
                    timelineItems.length -
                      1 && (
                    <div className="absolute left-1/2 top-8 h-8 w-px -translate-x-1/2 bg-slate-200 dark:bg-slate-700" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
                      {deadline.title}
                    </p>

                    <p className="text-[7px] font-semibold text-slate-400">
                      {formatDate(
                        deadline.date
                      )}
                    </p>
                  </div>

                  <p className="mt-1 text-[7px] text-slate-400">
                    {deadline.type}
                  </p>
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};

/* --------------------------------
   Summary Card
--------------------------------- */

const SummaryCard = ({
  label,
  value,
  icon,
  type,
}) => {
  const styles =
    getStatusStyles(
      type === "soon"
        ? "Due Soon"
        : type === "upcoming"
        ? "Upcoming"
        : type === "overdue"
        ? "Overdue"
        : "Completed"
    );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-xl ${styles.bg} ${styles.text}`}
      >
        {icon}
      </div>

      <p className="mt-3 text-[7px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-black text-slate-800 dark:text-white">
        {value}
      </p>
    </div>
  );
};

/* --------------------------------
   Status Badge
--------------------------------- */

const StatusBadge = ({
  status,
}) => {
  const styles =
    getStatusStyles(status);

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[6px] font-bold ${styles.badge}`}
    >
      {status}
    </span>
  );
};

/* --------------------------------
   Empty State
--------------------------------- */

const EmptyState = () => {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
      <CalendarClock
        size={26}
        className="mx-auto text-slate-400"
      />

      <p className="mt-3 text-[9px] font-bold text-slate-700 dark:text-slate-300">
        No deadlines found
      </p>

      <p className="mt-1 text-[7px] text-slate-400">
        Try changing the filter or search term.
      </p>
    </div>
  );
};

/* --------------------------------
   Deadline Status
--------------------------------- */

const getDeadlineStatus = (
  deadline,
  dueSoonDays
) => {
  if (deadline.completed) {
    return "Completed";
  }

  if (!deadline.date) {
    return "Upcoming";
  }

  const now = new Date();
  const target = new Date(
    deadline.date
  );

  const difference =
    target.getTime() -
    now.getTime();

  if (difference < 0) {
    return "Overdue";
  }

  const dueSoonMs =
    dueSoonDays *
    24 *
    60 *
    60 *
    1000;

  if (difference <= dueSoonMs) {
    return "Due Soon";
  }

  return "Upcoming";
};

/* --------------------------------
   Status Styles
--------------------------------- */

const getStatusStyles = (
  status
) => {
  if (status === "Overdue") {
    return {
      bg:
        "bg-red-50 dark:bg-red-900/10",
      text:
        "text-red-600 dark:text-red-400",
      badge:
        "bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400",
    };
  }

  if (status === "Due Soon") {
    return {
      bg:
        "bg-amber-50 dark:bg-amber-900/10",
      text:
        "text-amber-600 dark:text-amber-400",
      badge:
        "bg-amber-50 text-amber-600 dark:bg-amber-900/10 dark:text-amber-400",
    };
  }

  if (status === "Completed") {
    return {
      bg:
        "bg-green-50 dark:bg-green-900/10",
      text:
        "text-green-600 dark:text-green-400",
      badge:
        "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400",
    };
  }

  return {
    bg:
      "bg-blue-50 dark:bg-blue-900/10",
    text:
      "text-blue-600 dark:text-blue-400",
    badge:
      "bg-blue-50 text-blue-600 dark:bg-blue-900/10 dark:text-blue-400",
  };
};

/* --------------------------------
   Icons
--------------------------------- */

const getDeadlineIcon = (
  type
) => {
  const normalized =
    type?.toLowerCase() || "";

  if (
    normalized.includes(
      "registration"
    )
  ) {
    return <FileCheck2 size={17} />;
  }

  if (
    normalized.includes(
      "team"
    )
  ) {
    return <Flag size={17} />;
  }

  if (
    normalized.includes(
      "feedback"
    )
  ) {
    return <MessageSquareIcon />;
  }

  if (
    normalized.includes(
      "certificate"
    )
  ) {
    return <CheckCircle2 size={17} />;
  }

  return <CalendarClock size={17} />;
};

const MessageSquareIcon = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
  </svg>
);

/* --------------------------------
   Date Helpers
--------------------------------- */

const formatDate = (
  value
) => {
  if (!value) {
    return "No date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
};

const getRelativeText = (
  value
) => {
  if (!value) return "";

  const now = new Date();
  const target = new Date(value);

  const difference =
    target.getTime() -
    now.getTime();

  const days = Math.ceil(
    Math.abs(difference) /
      (1000 * 60 * 60 * 24)
  );

  if (difference < 0) {
    return `${days} day${
      days !== 1 ? "s" : ""
    } overdue`;
  }

  if (days === 0) {
    return "Due today";
  }

  if (days === 1) {
    return "Due tomorrow";
  }

  return `Due in ${days} days`;
};

export default EventDeadlineOverview;