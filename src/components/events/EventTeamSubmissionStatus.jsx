import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileCheck2,
  Filter,
  Users,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

const INITIAL_TEAMS = [
  {
    id: 1,
    name: "Code Warriors",
    status: "Submitted",
    submittedAt: "August 18, 2026 · 10:30 AM",
    timing: "On Time",
    members: ["Aarav", "Priya", "Rahul"],
    submissionLink: "#",
  },
  {
    id: 2,
    name: "Data Minds",
    status: "Submitted",
    submittedAt: "August 18, 2026 · 2:15 PM",
    timing: "On Time",
    members: ["Neha", "Rohan"],
    submissionLink: "#",
  },
  {
    id: 3,
    name: "Tech Titans",
    status: "Pending",
    submittedAt: null,
    timing: null,
    members: ["Karan", "Meera", "Dev"],
    submissionLink: null,
  },
  {
    id: 4,
    name: "InnovateX",
    status: "Late",
    submittedAt: "August 20, 2026 · 12:30 AM",
    timing: "Late",
    members: ["Ishita", "Arjun"],
    submissionLink: "#",
  },
];

const FILTERS = ["All", "Submitted", "Pending", "Late"];

const EventTeamSubmissionStatus = ({
  initialTeams = INITIAL_TEAMS,
}) => {
  const [teams] = useState(initialTeams);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const matchesFilter =
        activeFilter === "All" ||
        team.status === activeFilter;

      const matchesSearch = team.name
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [teams, activeFilter, search]);

  const counts = useMemo(
    () => ({
      all: teams.length,
      submitted: teams.filter(
        (team) => team.status === "Submitted"
      ).length,
      pending: teams.filter(
        (team) => team.status === "Pending"
      ).length,
      late: teams.filter(
        (team) => team.status === "Late"
      ).length,
    }),
    [teams]
  );

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
              Hackathon Management
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Team Submission Status
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Track project submissions across all participating
              teams.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-[6px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          <Users size={11} />
          {counts.all} Teams
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          label="Total Teams"
          value={counts.all}
          icon={<Users size={16} />}
        />

        <SummaryCard
          label="Submitted"
          value={counts.submitted}
          icon={<CheckCircle2 size={16} />}
          type="success"
        />

        <SummaryCard
          label="Pending"
          value={counts.pending}
          icon={<Clock3 size={16} />}
          type="warning"
        />

        <SummaryCard
          label="Late"
          value={counts.late}
          icon={<XCircle size={16} />}
          type="danger"
        />
      </div>

      {/* Filters */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <Filter
              size={15}
              className="text-indigo-600 dark:text-indigo-400"
            />

            <span className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
              Filter Teams
            </span>
          </div>

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search team..."
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[7px] outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((filter) => {
            const count =
              filter === "All"
                ? counts.all
                : filter === "Submitted"
                ? counts.submitted
                : filter === "Pending"
                ? counts.pending
                : counts.late;

            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-xl px-3 py-2 text-[6px] font-bold transition ${
                  activeFilter === filter
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400"
                }`}
              >
                {filter} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Team List */}
      <div className="mt-6">
        <div className="mb-4">
          <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
            Team Submissions
          </h3>

          <p className="mt-1 text-[7px] text-slate-400">
            Showing {filteredTeams.length} of {teams.length} teams.
          </p>
        </div>

        {filteredTeams.length > 0 ? (
          <div className="space-y-3">
            {filteredTeams.map((team) => (
              <TeamSubmissionCard
                key={team.id}
                team={team}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
            <FileCheck2
              size={24}
              className="mx-auto text-slate-300 dark:text-slate-600"
            />

            <p className="mt-3 text-[8px] font-bold text-slate-500 dark:text-slate-400">
              No teams found
            </p>

            <p className="mt-1 text-[6px] text-slate-400">
              Try another search or filter.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

const TeamSubmissionCard = ({ team }) => {
  const isSubmitted = team.status === "Submitted";
  const isPending = team.status === "Pending";
  const isLate = team.status === "Late";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        {/* Team Info */}
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              isSubmitted
                ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                : isLate
                ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
            }`}
          >
            {isSubmitted ? (
              <CheckCircle2 size={18} />
            ) : isLate ? (
              <XCircle size={18} />
            ) : (
              <Clock3 size={18} />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-[10px] font-bold text-slate-800 dark:text-white">
                {team.name}
              </h4>

              <StatusBadge status={team.status} />

              {team.timing && (
                <span
                  className={`rounded-full px-2.5 py-1 text-[5px] font-bold ${
                    team.timing === "On Time"
                      ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                  }`}
                >
                  {team.timing}
                </span>
              )}
            </div>

            {/* Members */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Users
                size={11}
                className="text-slate-400"
              />

              {team.members.map((member) => (
                <span
                  key={member}
                  className="rounded-lg bg-slate-100 px-2 py-1 text-[5px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                >
                  {member}
                </span>
              ))}
            </div>

            {/* Submission Time */}
            <div className="mt-3 flex items-center gap-2">
              <Clock3
                size={11}
                className="text-slate-400"
              />

              <span className="text-[6px] text-slate-400">
                {team.submittedAt
                  ? `Submitted ${team.submittedAt}`
                  : "Submission not received"}
              </span>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="shrink-0">
          {team.submissionLink ? (
            <a
              href={team.submissionLink}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-[7px] font-bold text-white transition hover:bg-indigo-700 sm:w-auto"
            >
              View Submission
              <ExternalLink size={11} />
            </a>
          ) : (
            <span className="inline-flex w-full items-center justify-center rounded-xl bg-slate-100 px-4 py-2.5 text-[7px] font-bold text-slate-400 sm:w-auto dark:bg-slate-800">
              Awaiting Submission
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    Submitted:
      "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    Pending:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    Late:
      "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[5px] font-bold ${
        styles[status] || styles.Pending
      }`}
    >
      {status}
    </span>
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
    warning:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
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

export default EventTeamSubmissionStatus;