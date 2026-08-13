import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  Timer,
} from "lucide-react";

const initialAssignments = [
  {
    id: 1,
    team: "Code Warriors",
    submission: "Smart Campus Assistant",
    status: "Completed",
    deadline: "2026-08-14T18:00:00",
  },
  {
    id: 2,
    team: "AI Innovators",
    submission: "AI Health Assistant",
    status: "Pending",
    deadline: "2026-08-14T18:00:00",
  },
  {
    id: 3,
    team: "Tech Titans",
    submission: "IoT Energy Monitor",
    status: "Pending",
    deadline: "2026-08-13T16:00:00",
  },
  {
    id: 4,
    team: "Data Minds",
    submission: "Student Analytics Platform",
    status: "Completed",
    deadline: "2026-08-12T18:00:00",
  },
  {
    id: 5,
    team: "Cyber Squad",
    submission: "Secure Event Platform",
    status: "Pending",
    deadline: "2026-08-11T18:00:00",
  },
];

const JudgeEvaluationDeadlineTracker = () => {
  const [assignments, setAssignments] =
    useState(initialAssignments);

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getDeadlineStatus = (assignment) => {
    const deadline = new Date(assignment.deadline);

    if (assignment.status === "Completed") {
      return "completed";
    }

    if (deadline.getTime() < now.getTime()) {
      return "overdue";
    }

    return "pending";
  };

  const formatRemaining = (deadline) => {
    const difference =
      new Date(deadline).getTime() - now.getTime();

    if (difference <= 0) {
      return "Overdue";
    }

    const totalSeconds = Math.floor(difference / 1000);

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor(
      (totalSeconds % 86400) / 3600
    );
    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    );
    const seconds = totalSeconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const statistics = useMemo(() => {
    const assigned = assignments.length;

    const completed = assignments.filter(
      (item) => item.status === "Completed"
    ).length;

    const pending = assignments.filter(
      (item) =>
        item.status === "Pending" &&
        getDeadlineStatus(item) === "pending"
    ).length;

    const overdue = assignments.filter(
      (item) => getDeadlineStatus(item) === "overdue"
    ).length;

    const completionPercentage = assigned
      ? Math.round((completed / assigned) * 100)
      : 0;

    return {
      assigned,
      completed,
      pending,
      overdue,
      completionPercentage,
    };
  }, [assignments, now]);

  const markCompleted = (id) => {
    setAssignments((current) =>
      current.map((assignment) =>
        assignment.id === id
          ? {
              ...assignment,
              status: "Completed",
            }
          : assignment
      )
    );
  };

  return (
    <section className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Judge Evaluation Deadline Tracker
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Track assigned submissions, evaluation progress,
          and upcoming deadlines.
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Assigned Submissions"
          value={statistics.assigned}
          icon={<FileText size={20} />}
        />

        <SummaryCard
          title="Completed Evaluations"
          value={statistics.completed}
          icon={<CheckCircle2 size={20} />}
          valueClass="text-green-600 dark:text-green-400"
        />

        <SummaryCard
          title="Pending Evaluations"
          value={statistics.pending}
          icon={<Clock3 size={20} />}
          valueClass="text-amber-600 dark:text-amber-400"
        />

        <SummaryCard
          title="Overdue Evaluations"
          value={statistics.overdue}
          icon={<AlertCircle size={20} />}
          valueClass="text-red-600 dark:text-red-400"
        />
      </div>

      {/* Progress */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Evaluation Progress
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {statistics.completed} of{" "}
              {statistics.assigned} submissions reviewed
            </p>
          </div>

          <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            {statistics.completionPercentage}%
          </span>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-500"
            style={{
              width: `${statistics.completionPercentage}%`,
            }}
          />
        </div>
      </div>

      {/* Deadline Alert */}
      {statistics.overdue > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
          <AlertCircle
            size={20}
            className="mt-0.5 text-red-600"
          />

          <div>
            <p className="text-sm font-bold text-red-700 dark:text-red-400">
              Evaluation deadlines require attention
            </p>

            <p className="mt-1 text-xs text-red-600 dark:text-red-500">
              You have {statistics.overdue} overdue evaluation
              {statistics.overdue !== 1 ? "s" : ""}.
            </p>
          </div>
        </div>
      )}

      {/* Assignment List */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Assigned Evaluations
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Review your assigned submissions and complete them
            before their deadlines.
          </p>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {assignments.map((assignment) => {
            const status = getDeadlineStatus(assignment);

            return (
              <div
                key={assignment.id}
                className="p-5 transition hover:bg-slate-50 dark:hover:bg-slate-900/50"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  {/* Submission */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                        <FileText size={18} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                          {assignment.submission}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Team: {assignment.team}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Deadline */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Evaluation Deadline
                    </p>

                    <p className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {formatDate(assignment.deadline)}
                    </p>
                  </div>

                  {/* Countdown */}
                  <div className="min-w-[150px]">
                    <div className="flex items-center gap-2">
                      <Timer
                        size={15}
                        className={
                          status === "overdue"
                            ? "text-red-500"
                            : status === "completed"
                              ? "text-green-500"
                              : "text-amber-500"
                        }
                      />

                      <span
                        className={`text-xs font-bold ${
                          status === "overdue"
                            ? "text-red-600 dark:text-red-400"
                            : status === "completed"
                              ? "text-green-600 dark:text-green-400"
                              : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {status === "completed"
                          ? "Completed"
                          : formatRemaining(
                              assignment.deadline
                            )}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <StatusBadge status={status} />

                  {/* Action */}
                  {assignment.status !== "Completed" && (
                    <button
                      type="button"
                      onClick={() =>
                        markCompleted(assignment.id)
                      }
                      className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700"
                    >
                      Mark Evaluated
                    </button>
                  )}

                  {assignment.status === "Completed" && (
                    <span className="rounded-xl bg-green-50 px-4 py-2.5 text-xs font-bold text-green-600 dark:bg-green-900/20 dark:text-green-400">
                      Evaluation Complete
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const SummaryCard = ({
  title,
  value,
  icon,
  valueClass = "",
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {title}
        </span>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
          {icon}
        </div>
      </div>

      <p
        className={`mt-4 text-2xl font-bold text-slate-900 dark:text-white ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const config = {
    completed: {
      label: "Completed",
      classes:
        "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    },

    pending: {
      label: "Pending",
      classes:
        "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    },

    overdue: {
      label: "Overdue",
      classes:
        "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    },
  };

  const item = config[status];

  return (
    <span
      className={`rounded-full px-3 py-1 text-[10px] font-bold ${item.classes}`}
    >
      {item.label}
    </span>
  );
};

const formatDate = (date) => {
  return new Date(date).toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default JudgeEvaluationDeadlineTracker;