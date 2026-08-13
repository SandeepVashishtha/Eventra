import {
  Bell,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Flag,
  Plus,
  Settings,
  TriangleAlert,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_DEADLINES = [
  {
    id: 1,
    title: "Registration Deadline",
    event: "AI Innovation Summit",
    date: "2026-08-20",
    time: "11:59 PM",
    type: "Registration",
    priority: "High",
    reminder: "1 day before",
    completed: false,
  },
  {
    id: 2,
    title: "Speaker Confirmation",
    event: "AI Innovation Summit",
    date: "2026-08-18",
    time: "06:00 PM",
    type: "Speaker",
    priority: "Medium",
    reminder: "2 days before",
    completed: false,
  },
  {
    id: 3,
    title: "Submission Review",
    event: "Hackathon 2026",
    date: "2026-08-12",
    time: "05:00 PM",
    type: "Submission",
    priority: "High",
    reminder: "1 day before",
    completed: false,
  },
  {
    id: 4,
    title: "Certificate Preparation",
    event: "Web Development Workshop",
    date: "2026-08-25",
    time: "04:00 PM",
    type: "Certificate",
    priority: "Low",
    reminder: "3 days before",
    completed: false,
  },
];

const getDeadlineStatus = (date, completed) => {
  if (completed) return "Completed";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(`${date}T00:00:00`);
  deadline.setHours(0, 0, 0, 0);

  const difference =
    Math.ceil(
      (deadline.getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24)
    );

  if (difference < 0) return "Overdue";
  if (difference === 0) return "Today";
  if (difference <= 3) return "Due Soon";

  return "Upcoming";
};

const formatDate = (date) => {
  const parsed = new Date(`${date}T00:00:00`);

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const EventOrganizerDeadlineReminderCenter = ({
  deadlines = DEFAULT_DEADLINES,
  onDeadlineComplete,
  onReminderConfigure,
}) => {
  const [items, setItems] = useState(deadlines);
  const [filter, setFilter] = useState("All");

  const analytics = useMemo(() => {
    const statuses = items.map((item) =>
      getDeadlineStatus(item.date, item.completed)
    );

    return {
      total: items.length,
      upcoming: statuses.filter(
        (status) =>
          status === "Upcoming" ||
          status === "Due Soon" ||
          status === "Today"
      ).length,
      overdue: statuses.filter(
        (status) => status === "Overdue"
      ).length,
      completed: statuses.filter(
        (status) => status === "Completed"
      ).length,
    };
  }, [items]);

  const filteredDeadlines = useMemo(() => {
    if (filter === "All") return items;

    return items.filter((item) => {
      const status = getDeadlineStatus(
        item.date,
        item.completed
      );

      if (filter === "Upcoming") {
        return (
          status === "Upcoming" ||
          status === "Due Soon" ||
          status === "Today"
        );
      }

      return status === filter;
    });
  }, [items, filter]);

  const toggleComplete = (id) => {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;

        const updated = {
          ...item,
          completed: !item.completed,
        };

        if (updated.completed && onDeadlineComplete) {
          onDeadlineComplete(updated);
        }

        return updated;
      })
    );
  };

  const handleReminder = (deadline) => {
    if (onReminderConfigure) {
      onReminderConfigure(deadline);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <CalendarClock size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Tools
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Deadline Reminder Center
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Keep registration, submission, speaker, certificate,
              and announcement deadlines organized in one place.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-[7px] font-bold text-white transition hover:bg-indigo-700"
        >
          <Plus size={12} />
          Add Deadline
        </button>
      </div>

      {/* Summary */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={CalendarClock}
          label="Total Deadlines"
          value={analytics.total}
        />

        <MetricCard
          icon={Clock3}
          label="Upcoming"
          value={analytics.upcoming}
        />

        <MetricCard
          icon={TriangleAlert}
          label="Overdue"
          value={analytics.overdue}
        />

        <MetricCard
          icon={CheckCircle2}
          label="Completed"
          value={analytics.completed}
        />
      </div>

      {/* Overdue Alert */}
      {analytics.overdue > 0 && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/30 dark:bg-red-900/10">
          <div className="flex items-start gap-3">
            <TriangleAlert
              size={18}
              className="mt-0.5 text-red-600 dark:text-red-400"
            />

            <div>
              <h3 className="text-[9px] font-bold text-red-800 dark:text-red-300">
                Overdue Deadlines Need Attention
              </h3>

              <p className="mt-1 text-[7px] leading-4 text-red-700 dark:text-red-400">
                You have {analytics.overdue} overdue deadline
                {analytics.overdue === 1 ? "" : "s"}. Review
                them and update the task status.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        {["All", "Upcoming", "Today", "Due Soon", "Overdue", "Completed"].map(
          (option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={`rounded-xl px-3 py-2 text-[6px] font-bold transition ${
                filter === option
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
              }`}
            >
              {option}
            </button>
          )
        )}
      </div>

      {/* Deadline List */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Flag
              size={16}
              className="text-indigo-600 dark:text-indigo-400"
            />

            <div>
              <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
                Organizer Deadlines
              </h3>

              <p className="mt-1 text-[7px] text-slate-400">
                Track upcoming and overdue event responsibilities.
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredDeadlines.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2
                size={24}
                className="mx-auto text-green-500"
              />

              <p className="mt-3 text-[8px] font-bold text-slate-700 dark:text-slate-300">
                No deadlines found
              </p>

              <p className="mt-1 text-[6px] text-slate-400">
                There are no deadlines matching this filter.
              </p>
            </div>
          ) : (
            filteredDeadlines.map((deadline) => {
              const status = getDeadlineStatus(
                deadline.date,
                deadline.completed
              );

              return (
                <DeadlineRow
                  key={deadline.id}
                  deadline={deadline}
                  status={status}
                  onComplete={() =>
                    toggleComplete(deadline.id)
                  }
                  onReminder={() =>
                    handleReminder(deadline)
                  }
                />
              );
            })
          )}
        </div>
      </div>

      {/* Reminder Configuration */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
              <Bell size={15} />
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
                Reminder Configuration
              </h3>

              <p className="mt-1 text-[7px] leading-4 text-slate-400">
                Configure when organizers should receive reminders
                for important deadlines.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleReminder(null)}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-[7px] font-bold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300"
          >
            <Settings size={12} />
            Configure Reminders
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <ReminderOption
            title="1 Day Before"
            description="Standard deadline reminder"
          />

          <ReminderOption
            title="3 Days Before"
            description="Early preparation reminder"
          />

          <ReminderOption
            title="On Deadline"
            description="Final deadline notification"
          />
        </div>
      </div>
    </section>
  );
};

const DeadlineRow = ({
  deadline,
  status,
  onComplete,
  onReminder,
}) => {
  return (
    <div
      className={`p-5 transition ${
        status === "Overdue"
          ? "bg-red-50/40 dark:bg-red-900/5"
          : deadline.completed
          ? "bg-green-50/30 dark:bg-green-900/5"
          : ""
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <button
          type="button"
          onClick={onComplete}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
            deadline.completed
              ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
              : "bg-slate-100 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800"
          }`}
          aria-label={
            deadline.completed
              ? "Mark deadline incomplete"
              : "Mark deadline complete"
          }
        >
          {deadline.completed ? (
            <CheckCircle2 size={17} />
          ) : (
            <Clock3 size={16} />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h4
                className={`text-[9px] font-bold ${
                  deadline.completed
                    ? "text-green-700 line-through dark:text-green-400"
                    : "text-slate-800 dark:text-white"
                }`}
              >
                {deadline.title}
              </h4>

              <p className="mt-1 text-[7px] text-slate-400">
                {deadline.event}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <PriorityBadge
                priority={deadline.priority}
              />

              <StatusBadge status={status} />
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Detail
              label="Deadline"
              value={`${formatDate(deadline.date)} · ${deadline.time}`}
            />

            <Detail
              label="Type"
              value={deadline.type}
            />

            <Detail
              label="Reminder"
              value={deadline.reminder}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onReminder}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-[6px] font-bold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300"
            >
              <Bell size={11} />
              Configure Reminder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
        <Icon size={15} />
      </div>

      <div>
        <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-lg font-black text-slate-800 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  </div>
);

const PriorityBadge = ({ priority }) => {
  const styles = {
    High: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    Medium:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    Low: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[6px] font-bold ${
        styles[priority] || styles.Medium
      }`}
    >
      {priority} Priority
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    Overdue:
      "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    Today:
      "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
    "Due Soon":
      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    Upcoming:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
    Completed:
      "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[6px] font-bold ${
        styles[status]
      }`}
    >
      {status}
    </span>
  );
};

const Detail = ({ label, value }) => (
  <div>
    <p className="text-[5px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1 text-[7px] font-black text-slate-700 dark:text-slate-300">
      {value}
    </p>
  </div>
);

const ReminderOption = ({
  title,
  description,
}) => (
  <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
    <div className="flex items-center gap-2">
      <Bell
        size={12}
        className="text-indigo-500"
      />

      <p className="text-[7px] font-bold text-slate-700 dark:text-slate-300">
        {title}
      </p>
    </div>

    <p className="mt-2 text-[6px] leading-3 text-slate-400">
      {description}
    </p>
  </div>
);

export default EventOrganizerDeadlineReminderCenter;