import {
  AlertCircle,
  CalendarDays,
  Check,
  Circle,
  Clock3,
  Flag,
  Lock,
} from "lucide-react";
import { useMemo } from "react";

const DEFAULT_MILESTONES = [
  {
    id: "registration",
    title: "Registration",
    description: "Complete your event registration.",
    status: "completed",
  },
  {
    id: "team-formation",
    title: "Team Formation",
    description: "Create or join your event team.",
    status: "in-progress",
  },
  {
    id: "proposal",
    title: "Proposal",
    description: "Submit your project proposal.",
    status: "upcoming",
  },
  {
    id: "submission",
    title: "Submission",
    description: "Submit your final project.",
    status: "upcoming",
  },
  {
    id: "evaluation",
    title: "Evaluation",
    description: "Project evaluation by organizers.",
    status: "upcoming",
  },
  {
    id: "results",
    title: "Results",
    description: "View the final event results.",
    status: "upcoming",
  },
];

const EventMilestoneProgressTracker = ({
  milestones = DEFAULT_MILESTONES,
  title = "Event Progress",
  subtitle = "Track your progress through each stage of the event.",
  className = "",
  onMilestoneClick,
}) => {
  const normalizedMilestones = useMemo(
    () =>
      Array.isArray(milestones)
        ? milestones.map(normalizeMilestone)
        : [],
    [milestones]
  );

  const completedCount =
    normalizedMilestones.filter(
      (milestone) =>
        milestone.status === "completed"
    ).length;

  const progress =
    normalizedMilestones.length > 0
      ? Math.round(
          (completedCount /
            normalizedMilestones.length) *
            100
        )
      : 0;

  const currentMilestone =
    normalizedMilestones.find(
      (milestone) =>
        milestone.status === "in-progress"
    );

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <Flag
              size={20}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Event Journey
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              {title}
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white px-4 py-2.5 text-right shadow-sm dark:bg-slate-900">
          <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
            Overall Progress
          </p>

          <p className="mt-0.5 text-lg font-bold text-indigo-600 dark:text-indigo-400">
            {progress}%
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            {completedCount} of{" "}
            {normalizedMilestones.length} milestones completed
          </span>

          {currentMilestone && (
            <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
              Current: {currentMilestone.title}
            </span>
          )}
        </div>

        <div
          className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Event milestone progress"
        >
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      {/* Timeline */}
      {normalizedMilestones.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mt-8">
          {normalizedMilestones.map(
            (milestone, index) => (
              <MilestoneItem
                key={
                  milestone.id ||
                  `${milestone.title}-${index}`
                }
                milestone={milestone}
                index={index}
                isLast={
                  index ===
                  normalizedMilestones.length - 1
                }
                onClick={onMilestoneClick}
              />
            )
          )}
        </div>
      )}

      {/* Current stage summary */}
      {currentMilestone && (
        <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Clock3 size={16} />
            </div>

            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-wide text-indigo-500 dark:text-indigo-400">
                Current Stage
              </p>

              <h3 className="mt-1 text-sm font-bold text-indigo-900 dark:text-indigo-200">
                {currentMilestone.title}
              </h3>

              {currentMilestone.description && (
                <p className="mt-1 text-xs leading-5 text-indigo-700 dark:text-indigo-300">
                  {currentMilestone.description}
                </p>
              )}

              {currentMilestone.deadline && (
                <Deadline
                  deadline={
                    currentMilestone.deadline
                  }
                  status={
                    currentMilestone.status
                  }
                  compact
                />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

/* ----------------------------------
   Milestone item
----------------------------------- */

const MilestoneItem = ({
  milestone,
  index,
  isLast,
  onClick,
}) => {
  const isClickable =
    typeof onClick === "function";

  return (
    <div className="relative flex gap-4">
      {/* Connecting line */}
      {!isLast && (
        <div
          className={`absolute left-[17px] top-9 h-[calc(100%-1rem)] w-0.5 ${
            milestone.status === "completed"
              ? "bg-indigo-500"
              : "bg-slate-200 dark:bg-slate-800"
          }`}
          aria-hidden="true"
        />
      )}

      {/* Icon */}
      <div className="relative z-10 shrink-0">
        <MilestoneIcon
          status={milestone.status}
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 pb-7">
        <div
          className={`rounded-2xl border p-4 transition ${
            milestone.status === "in-progress"
              ? "border-indigo-200 bg-white shadow-sm dark:border-indigo-900/40 dark:bg-slate-900"
              : milestone.status === "completed"
              ? "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
              : "border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950"
          } ${
            isClickable
              ? "cursor-pointer hover:border-indigo-300"
              : ""
          }`}
          onClick={() =>
            onClick?.(milestone, index)
          }
          role={
            isClickable
              ? "button"
              : undefined
          }
          tabIndex={
            isClickable
              ? 0
              : undefined
          }
          onKeyDown={(event) => {
            if (
              isClickable &&
              (event.key === "Enter" ||
                event.key === " ")
            ) {
              event.preventDefault();
              onClick(
                milestone,
                index
              );
            }
          }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  className={`text-sm font-bold ${
                    milestone.status ===
                    "upcoming"
                      ? "text-slate-500 dark:text-slate-400"
                      : "text-slate-800 dark:text-white"
                  }`}
                >
                  {milestone.title}
                </h3>

                <StatusBadge
                  status={
                    milestone.status
                  }
                />
              </div>

              {milestone.description && (
                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {milestone.description}
                </p>
              )}
            </div>

            {milestone.deadline && (
              <Deadline
                deadline={
                  milestone.deadline
                }
                status={
                  milestone.status
                }
              />
            )}
          </div>

          {/* Extra information */}
          <div className="mt-3 flex flex-wrap gap-2">
            {milestone.completedAt && (
              <MetaItem
                icon={
                  <Check size={11} />
                }
                text={`Completed ${formatDate(
                  milestone.completedAt
                )}`}
              />
            )}

            {milestone.startDate && (
              <MetaItem
                icon={
                  <CalendarDays
                    size={11}
                  />
                }
                text={`Starts ${formatDate(
                  milestone.startDate
                )}`}
              />
            )}

            {milestone.locked && (
              <MetaItem
                icon={
                  <Lock size={11} />
                }
                text="Locked"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ----------------------------------
   Milestone icon
----------------------------------- */

const MilestoneIcon = ({
  status,
}) => {
  if (status === "completed") {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm ring-4 ring-slate-50 dark:ring-slate-950">
        <Check size={17} />
      </div>
    );
  }

  if (status === "in-progress") {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-full border-4 border-indigo-100 bg-indigo-600 text-white shadow-sm ring-4 ring-slate-50 dark:border-indigo-900/40 dark:ring-slate-950">
        <Clock3 size={14} />
      </div>
    );
  }

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-400 ring-4 ring-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:ring-slate-950">
      <Circle size={14} />
    </div>
  );
};

/* ----------------------------------
   Status badge
----------------------------------- */

const StatusBadge = ({
  status,
}) => {
  const config = {
    completed: {
      label: "Completed",
      className:
        "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    },
    "in-progress": {
      label: "In Progress",
      className:
        "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
    },
    upcoming: {
      label: "Upcoming",
      className:
        "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
    },
  };

  const current =
    config[status] ||
    config.upcoming;

  return (
    <span
      className={`rounded-full px-2 py-1 text-[8px] font-bold uppercase tracking-wide ${current.className}`}
    >
      {current.label}
    </span>
  );
};

/* ----------------------------------
   Deadline
----------------------------------- */

const Deadline = ({
  deadline,
  status,
  compact = false,
}) => {
  const date =
    new Date(deadline);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  const overdue =
    date.getTime() <
      Date.now() &&
    status !== "completed";

  return (
    <div
      className={`shrink-0 rounded-lg px-2.5 py-1.5 ${
        overdue
          ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
      }`}
    >
      <div className="flex items-center gap-1.5">
        {overdue ? (
          <AlertCircle size={11} />
        ) : (
          <CalendarDays size={11} />
        )}

        <span className="text-[9px] font-semibold">
          {overdue
            ? "Overdue"
            : compact
            ? `Due ${formatDate(
                deadline,
                true
              )}`
            : `Deadline: ${formatDate(
                deadline
              )}`}
        </span>
      </div>
    </div>
  );
};

/* ----------------------------------
   Meta item
----------------------------------- */

const MetaItem = ({
  icon,
  text,
}) => {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[9px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
      {icon}
      {text}
    </span>
  );
};

/* ----------------------------------
   Empty state
----------------------------------- */

const EmptyState = () => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
      <Flag
        size={28}
        className="mx-auto text-slate-400"
      />

      <h3 className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">
        No milestones available
      </h3>

      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
        Event milestones will appear here once the event
        organizer defines the event stages.
      </p>
    </div>
  );
};

/* ----------------------------------
   Data normalization
----------------------------------- */

const normalizeMilestone = (
  milestone,
  index
) => {
  const rawStatus =
    String(
      milestone?.status ||
        "upcoming"
    ).toLowerCase();

  let status = "upcoming";

  if (
    rawStatus ===
      "completed" ||
    rawStatus === "complete" ||
    milestone?.completed === true
  ) {
    status = "completed";
  } else if (
    rawStatus ===
      "in-progress" ||
    rawStatus ===
      "in progress" ||
    rawStatus ===
      "active" ||
    rawStatus ===
      "current"
  ) {
    status = "in-progress";
  }

  return {
    id:
      milestone?.id ||
      milestone?.key ||
      `milestone-${index}`,
    title:
      milestone?.title ||
      milestone?.name ||
      `Milestone ${index + 1}`,
    description:
      milestone?.description ||
      "",
    status,
    deadline:
      milestone?.deadline ||
      milestone?.dueDate ||
      null,
    startDate:
      milestone?.startDate ||
      null,
    completedAt:
      milestone?.completedAt ||
      null,
    locked:
      Boolean(
        milestone?.locked
      ),
  };
};

/* ----------------------------------
   Date formatting
----------------------------------- */

const formatDate = (
  value,
  short = false
) => {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    undefined,
    short
      ? {
          month: "short",
          day: "numeric",
        }
      : {
          month: "short",
          day: "numeric",
          year: "numeric",
        }
  ).format(date);
};

export default EventMilestoneProgressTracker;