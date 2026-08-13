import {
  CheckCircle2,
  Clock3,
  Filter,
  Users,
  Trophy,
  AlertTriangle,
} from "lucide-react";
import { useMemo, useState } from "react";

const teamsData = [
  {
    id: 1,
    name: "Code Warriors",
    track: "AI/ML",
    registration: "Registered",
    members: 4,
    submission: "Submitted",
    deadline: "On Time",
    evaluation: "Evaluated",
    attendance: 100,
  },
  {
    id: 2,
    name: "Data Mavericks",
    track: "Data Science",
    registration: "Registered",
    members: 3,
    submission: "Pending",
    deadline: "Due Soon",
    evaluation: "Not Evaluated",
    attendance: 85,
  },
  {
    id: 3,
    name: "Tech Titans",
    track: "Web Development",
    registration: "Registered",
    members: 5,
    submission: "Submitted",
    deadline: "Late",
    evaluation: "Evaluated",
    attendance: 72,
  },
  {
    id: 4,
    name: "Cyber Squad",
    track: "Cybersecurity",
    registration: "Pending",
    members: 2,
    submission: "Pending",
    deadline: "Upcoming",
    evaluation: "Not Evaluated",
    attendance: 60,
  },
];

const TeamPerformanceDashboard = ({ teams = teamsData }) => {
  const [statusFilter, setStatusFilter] = useState("All");
  const [trackFilter, setTrackFilter] = useState("All");

  const tracks = [
    "All",
    ...new Set(teams.map((team) => team.track)),
  ];

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const statusMatch =
        statusFilter === "All" ||
        team.submission === statusFilter;

      const trackMatch =
        trackFilter === "All" ||
        team.track === trackFilter;

      return statusMatch && trackMatch;
    });
  }, [teams, statusFilter, trackFilter]);

  const totalTeams = teams.length;

  const submittedTeams = teams.filter(
    (team) => team.submission === "Submitted"
  ).length;

  const pendingTeams = teams.filter(
    (team) => team.submission === "Pending"
  ).length;

  const evaluatedTeams = teams.filter(
    (team) => team.evaluation === "Evaluated"
  ).length;

  const averageAttendance =
    totalTeams === 0
      ? 0
      : Math.round(
          teams.reduce(
            (total, team) => total + team.attendance,
            0
          ) / totalTeams
        );

  return (
    <section className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Team Performance Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Monitor team registration, submissions, evaluation, and
          attendance.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Teams"
          value={totalTeams}
          icon={<Users size={20} />}
        />

        <SummaryCard
          title="Submitted"
          value={submittedTeams}
          icon={<CheckCircle2 size={20} />}
          valueClass="text-green-600 dark:text-green-400"
        />

        <SummaryCard
          title="Pending"
          value={pendingTeams}
          icon={<Clock3 size={20} />}
          valueClass="text-amber-600 dark:text-amber-400"
        />

        <SummaryCard
          title="Avg. Attendance"
          value={`${averageAttendance}%`}
          icon={<Trophy size={20} />}
          valueClass="text-indigo-600 dark:text-indigo-400"
        />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <Filter size={17} className="text-slate-400" />

            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Filters
            </span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Submission Status */}
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-700 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="All">All Submission Status</option>
              <option value="Submitted">Submitted</option>
              <option value="Pending">Pending</option>
            </select>

            {/* Track */}
            <select
              value={trackFilter}
              onChange={(e) =>
                setTrackFilter(e.target.value)
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-700 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              {tracks.map((track) => (
                <option key={track} value={track}>
                  {track === "All"
                    ? "All Tracks"
                    : track}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Team Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-slate-800 dark:bg-slate-900">
                <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Team
                </th>

                <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Track
                </th>

                <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Registration
                </th>

                <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Members
                </th>

                <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Submission
                </th>

                <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Deadline
                </th>

                <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Evaluation
                </th>

                <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Attendance
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredTeams.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-5 py-12 text-center"
                  >
                    <AlertTriangle
                      size={24}
                      className="mx-auto text-slate-400"
                    />

                    <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      No teams found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Try changing the selected filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTeams.map((team) => (
                  <TeamRow
                    key={team.id}
                    team={team}
                  />
                ))
              )}
            </tbody>
          </table>
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
}) => (
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

const TeamRow = ({ team }) => {
  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/50">
      {/* Team */}
      <td className="px-5 py-4">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
          {team.name}
        </p>
      </td>

      {/* Track */}
      <td className="px-5 py-4">
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          {team.track}
        </span>
      </td>

      {/* Registration */}
      <td className="px-5 py-4">
        <StatusBadge status={team.registration} />
      </td>

      {/* Members */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <Users size={15} className="text-slate-400" />
          {team.members}
        </div>
      </td>

      {/* Submission */}
      <td className="px-5 py-4">
        <StatusBadge status={team.submission} />
      </td>

      {/* Deadline */}
      <td className="px-5 py-4">
        <StatusBadge status={team.deadline} />
      </td>

      {/* Evaluation */}
      <td className="px-5 py-4">
        <StatusBadge status={team.evaluation} />
      </td>

      {/* Attendance */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-indigo-500"
              style={{
                width: `${team.attendance}%`,
              }}
            />
          </div>

          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {team.attendance}%
          </span>
        </div>
      </td>
    </tr>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    Registered:
      "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    Submitted:
      "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    Evaluated:
      "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    Pending:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    "Due Soon":
      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    Late:
      "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    Upcoming:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    "Not Evaluated":
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-[10px] font-bold ${
        styles[status] ||
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
      }`}
    >
      {status}
    </span>
  );
};

export default TeamPerformanceDashboard;