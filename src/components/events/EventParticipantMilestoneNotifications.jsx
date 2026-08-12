import {
  Award,
  Bell,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Users,
  UserCheck,
  ClipboardCheck,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_MILESTONES = [
  {
    id: 1,
    title: "Registration completed",
    description: "Your registration for the event has been successfully completed.",
    type: "registration",
    date: "Aug 12, 2026",
    time: "10:30 AM",
    status: "completed",
  },
  {
    id: 2,
    title: "Team joined",
    description: "You successfully joined your event team.",
    type: "team",
    date: "Aug 12, 2026",
    time: "11:15 AM",
    status: "completed",
  },
  {
    id: 3,
    title: "Eligibility verified",
    description: "Your eligibility for this event has been verified.",
    type: "eligibility",
    date: "Aug 13, 2026",
    time: "09:20 AM",
    status: "completed",
  },
  {
    id: 4,
    title: "Submission completed",
    description: "Your project submission has been successfully received.",
    type: "submission",
    date: "Aug 14, 2026",
    time: "04:45 PM",
    status: "completed",
  },
  {
    id: 5,
    title: "Attendance recorded",
    description: "Your attendance has been recorded for the event.",
    type: "attendance",
    date: "Aug 15, 2026",
    time: "09:10 AM",
    status: "completed",
  },
  {
    id: 6,
    title: "Certificate issued",
    description: "Your event participation certificate is now available.",
    type: "certificate",
    date: "Aug 16, 2026",
    time: "02:00 PM",
    status: "completed",
  },
];

const MILESTONE_CONFIG = {
  registration: {
    label: "Registration",
    icon: ClipboardCheck,
    iconStyle:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
  },
  team: {
    label: "Team",
    icon: Users,
    iconStyle:
      "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  },
  eligibility: {
    label: "Eligibility",
    icon: UserCheck,
    iconStyle:
      "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  },
  submission: {
    label: "Submission",
    icon: FileCheck2,
    iconStyle:
      "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
  },
  attendance: {
    label: "Attendance",
    icon: CheckCircle2,
    iconStyle:
      "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
  },
  certificate: {
    label: "Certificate",
    icon: Award,
    iconStyle:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  },
};

const EventParticipantMilestoneNotifications = ({
  milestones = DEFAULT_MILESTONES,
  eventName = "AI Hackathon 2026",
  onMilestoneClick,
}) => {
  const [items, setItems] = useState(milestones);
  const [filter, setFilter] = useState("all");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const completedCount = useMemo(
    () =>
      items.filter(
        (item) => item.status === "completed"
      ).length,
    [items]
  );

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesType =
        filter === "all" || item.type === filter;

      const matchesUnread =
        !unreadOnly || item.status !== "read";

      return matchesType && matchesUnread;
    });
  }, [items, filter, unreadOnly]);

  const markAsRead = (id) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, status: "read" }
          : item
      )
    );
  };

  const markAllAsRead = () => {
    setItems((current) =>
      current.map((item) => ({
        ...item,
        status:
          item.status === "completed"
            ? "read"
            : item.status,
      }))
    );
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Bell size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Event Updates
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Milestone Notifications
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Stay informed whenever you complete an important
              stage of {eventName}.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={markAllAsRead}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-[7px] font-bold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          Mark all as read
        </button>
      </div>

      {/* Summary */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={Bell}
          label="Milestones"
          value={items.length}
        />

        <SummaryCard
          icon={CheckCircle2}
          label="Completed"
          value={completedCount}
        />

        <SummaryCard
          icon={Clock3}
          label="Updates"
          value={items.filter((item) => item.status === "completed").length}
        />
      </div>

      {/* Filters */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto">
            <FilterButton
              active={filter === "all"}
              label="All"
              onClick={() => setFilter("all")}
            />

            {Object.entries(MILESTONE_CONFIG).map(
              ([key, config]) => (
                <FilterButton
                  key={key}
                  active={filter === key}
                  label={config.label}
                  onClick={() => setFilter(key)}
                />
              )
            )}
          </div>

          <label className="flex shrink-0 cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(event) =>
                setUnreadOnly(event.target.checked)
              }
              className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />

            <span className="text-[7px] font-bold text-slate-500 dark:text-slate-400">
              Show unread only
            </span>
          </label>
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
              Your Event Journey
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Important milestones completed throughout the event.
            </p>
          </div>

          <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-[6px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            {filteredItems.length} updates
          </span>
        </div>

        <div className="mt-5 space-y-4">
          {filteredItems.map((milestone, index) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              isLast={index === filteredItems.length - 1}
              onRead={() => markAsRead(milestone.id)}
              onClick={() => {
                markAsRead(milestone.id);

                if (onMilestoneClick) {
                  onMilestoneClick(milestone);
                }
              }}
            />
          ))}

          {filteredItems.length === 0 && (
            <EmptyState />
          )}
        </div>
      </div>
    </section>
  );
};

/* --------------------------------
   Summary Card
--------------------------------- */

const SummaryCard = ({
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

          <p className="mt-1 text-xl font-black text-slate-800 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

/* --------------------------------
   Filter Button
--------------------------------- */

const FilterButton = ({
  active,
  label,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-xl px-3 py-2.5 text-[6px] font-bold transition ${
        active
          ? "bg-indigo-600 text-white"
          : "bg-slate-50 text-slate-500 ring-1 ring-inset ring-slate-200 hover:text-indigo-600 dark:bg-slate-950 dark:text-slate-400 dark:ring-slate-700"
      }`}
    >
      {label}
    </button>
  );
};

/* --------------------------------
   Milestone Card
--------------------------------- */

const MilestoneCard = ({
  milestone,
  isLast,
  onRead,
  onClick,
}) => {
  const config =
    MILESTONE_CONFIG[milestone.type] ||
    MILESTONE_CONFIG.registration;

  const Icon = config.icon;

  const isUnread =
    milestone.status === "completed";

  return (
    <div className="relative flex gap-3">
      {/* Timeline */}
      <div className="flex w-10 shrink-0 flex-col items-center">
        <button
          type="button"
          onClick={onClick}
          className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-xl transition hover:scale-105 ${config.iconStyle}`}
          aria-label={`Open ${milestone.title}`}
        >
          <Icon size={17} />
        </button>

        {!isLast && (
          <div className="mt-2 h-full min-h-10 w-px bg-slate-200 dark:bg-slate-700" />
        )}
      </div>

      {/* Content */}
      <button
        type="button"
        onClick={onClick}
        className={`mb-1 flex-1 rounded-2xl border p-4 text-left transition hover:border-indigo-200 hover:shadow-sm dark:hover:border-indigo-900 ${
          isUnread
            ? "border-indigo-100 bg-indigo-50/40 dark:border-indigo-900/30 dark:bg-indigo-900/10"
            : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
        }`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-[8px] font-bold text-slate-800 dark:text-white">
                {milestone.title}
              </h4>

              {isUnread && (
                <span className="rounded-full bg-indigo-600 px-2 py-1 text-[5px] font-bold uppercase text-white">
                  New
                </span>
              )}
            </div>

            <p className="mt-1 text-[7px] leading-4 text-slate-500 dark:text-slate-400">
              {milestone.description}
            </p>
          </div>

          <div className="shrink-0 text-left sm:text-right">
            <p className="text-[6px] font-bold text-slate-500 dark:text-slate-400">
              {milestone.date}
            </p>

            <p className="mt-1 text-[5px] text-slate-400">
              {milestone.time}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span
            className={`rounded-full px-2.5 py-1.5 text-[5px] font-bold ${config.iconStyle}`}
          >
            {config.label}
          </span>

          <span className="text-[6px] font-bold text-indigo-600 dark:text-indigo-400">
            View details →
          </span>
        </div>
      </button>

      {isUnread && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onRead();
          }}
          className="absolute right-3 bottom-2 rounded-lg px-2 py-1 text-[5px] font-bold text-slate-400 hover:text-indigo-600"
        >
          Mark read
        </button>
      )}
    </div>
  );
};

/* --------------------------------
   Empty State
--------------------------------- */

const EmptyState = () => {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 text-center dark:border-slate-700">
      <Bell
        size={27}
        className="text-slate-300 dark:text-slate-600"
      />

      <h4 className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-300">
        No milestone notifications
      </h4>

      <p className="mt-1 max-w-xs text-[7px] leading-4 text-slate-400">
        There are no notifications matching the selected filter.
      </p>
    </div>
  );
};

export default EventParticipantMilestoneNotifications;