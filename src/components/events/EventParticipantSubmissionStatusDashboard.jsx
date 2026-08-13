import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Filter,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_TEAMS = [
  {
    id: 1,
    name: "Team Alpha",
    status: "Submitted",
    submittedAt: "Aug 12, 2026 10:30 AM",
  },
  {
    id: 2,
    name: "Team Beta",
    status: "Pending",
    submittedAt: null,
  },
  {
    id: 3,
    name: "Team Gamma",
    status: "Late",
    submittedAt: "Aug 14, 2026 08:45 AM",
  },
  {
    id: 4,
    name: "Team Delta",
    status: "Submitted",
    submittedAt: "Aug 13, 2026 02:15 PM",
  },
  {
    id: 5,
    name: "Team Nova",
    status: "Pending",
    submittedAt: null,
  },
];

const EventParticipantSubmissionStatusDashboard = ({
  teams = DEFAULT_TEAMS,
  submissionDeadline = "August 14, 2026 · 11:59 PM",
}) => {
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const statistics = useMemo(() => {
    const total = teams.length;
    const submitted = teams.filter(
      (team) => team.status === "Submitted"
    ).length;
    const pending = teams.filter(
      (team) => team.status === "Pending"
    ).length;
    const late = teams.filter(
      (team) => team.status === "Late"
    ).length;

    const percentage =
      total > 0 ? Math.round((submitted / total) * 100) : 0;

    return {
      total,
      submitted,
      pending,
      late,
      percentage,
    };
  }, [teams]);

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const matchesStatus =
        statusFilter === "All" ||
        team.status === statusFilter;

      const matchesSearch = team.name
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [teams, statusFilter, search]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <FileCheck2 size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Submission Analytics
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Participant Submission Status
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Track submitted, pending, and late project submissions
              across participating teams.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-[6px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          <Clock3 size={12} />
          Deadline: {submissionDeadline}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Users}
          label="Total Teams"
          value={statistics.total}
          description="Registered teams"
        />

        <MetricCard
          icon={CheckCircle2}
          label="Submitted"
          value={statistics.submitted}
          description="Completed submissions"
          success
        />

        <MetricCard
          icon={Clock3}
          label="Pending"
          value={statistics.pending}
          description="Awaiting submission"
          warning
        />

        <MetricCard
          icon={AlertCircle}
          label="Late"
          value={statistics.late}
          description="Submitted after deadline"
          danger
        />
      </div>

      {/* Submission Percentage */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Submission Progress
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              {statistics.submitted} of {statistics.total} teams
              have submitted their projects.
            </p>
          </div>

          <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
            {statistics.percentage}%
          </span>
        </div>

        <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{
              width: `${statistics.percentage}%`,
            }}
          />
        </div>

        <div className="mt-3 flex justify-between text-[6px] font-bold text-slate-400">
          <span>0%</span>
          <span>{statistics.submitted} submitted</span>
          <span>100%</span>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <Filter
              size={15}
              className="text-indigo-600 dark:text-indigo-400"
            />

            <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
              Filter Submissions
            </h3>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search team..."
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[7px] outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[7px] outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Pending">Pending</option>
              <option value="Late">Late</option>
            </select>
          </div>
        </div>
      </div>

      {/* Team Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60">
                <th className="px-4 py-3 text-left text-[6px] font-bold uppercase tracking-wide text-slate-400">
                  Team
                </th>

                <th className="px-4 py-3 text-left text-[6px] font-bold uppercase tracking-wide text-slate-400">
                  Status
                </th>

                <th className="px-4 py-3 text-left text-[6px] font-bold uppercase tracking-wide text-slate-400">
                  Submission Date
                </th>

                <th className="px-4 py-3 text-right text-[6px] font-bold uppercase tracking-wide text-slate-400">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredTeams.length > 0 ? (
                filteredTeams.map((team) => (
                  <TeamRow key={team.id} team={team} />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-[8px] text-slate-400"
                  >
                    No teams match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deadline Notice */}
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
        <AlertCircle
          size={15}
          className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
        />

        <div>
          <h3 className="text-[8px] font-bold text-amber-800 dark:text-amber-300">
            Submission Deadline
          </h3>

          <p className="mt-1 text-[7px] leading-relaxed text-amber-700 dark:text-amber-400">
            Teams with pending submissions should complete their
            projects before {submissionDeadline}. Late submissions
            are tracked separately for organizer review.
          </p>
        </div>
      </div>
    </section>
  );
};

const TeamRow = ({ team }) => {
  const statusConfig = {
    Submitted: {
      className:
        "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
      icon: CheckCircle2,
    },
    Pending: {
      className:
        "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
      icon: Clock3,
    },
    Late: {
      className:
        "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
      icon: AlertCircle,
    },
  };

  const config =
    statusConfig[team.status] || statusConfig.Pending;

  const StatusIcon = config.icon;

  return (
    <tr className="border-b border-slate-100 last:border-b-0 dark:border-slate-800">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Users size={14} />
          </div>

          <span className="text-[8px] font-bold text-slate-800 dark:text-white">
            {team.name}
          </span>
        </div>
      </td>

      <td className="px-4 py-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[5px] font-bold ${config.className}`}
        >
          <StatusIcon size={10} />
          {team.status}
        </span>
      </td>

      <td className="px-4 py-4 text-[7px] text-slate-500 dark:text-slate-400">
        {team.submittedAt || "Not submitted"}
      </td>

      <td className="px-4 py-4 text-right">
        <button
          type="button"
          className="rounded-lg bg-slate-100 px-3 py-1.5 text-[6px] font-bold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400"
        >
          View
        </button>
      </td>
    </tr>
  );
};

const MetricCard = ({
  icon: Icon,
  label,
  value,
  description,
  success,
  warning,
  danger,
}) => {
  let iconClass =
    "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400";

  if (success) {
    iconClass =
      "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400";
  }

  if (warning) {
    iconClass =
      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400";
  }

  if (danger) {
    iconClass =
      "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400";
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClass}`}
      >
        <Icon size={16} />
      </div>

      <p className="mt-4 text-[6px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">
        {value}
      </p>

      <p className="mt-1 text-[6px] text-slate-400">
        {description}
      </p>
    </div>
  );
};

export default EventParticipantSubmissionStatusDashboard;