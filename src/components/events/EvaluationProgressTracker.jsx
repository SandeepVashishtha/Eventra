import {
  CheckCircle2,
  Clock3,
  Users,
  ClipboardCheck,
  AlertCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

const defaultEvaluations = [
  {
    id: 1,
    submission: "Code Warriors",
    judge: "Aarav Mehta",
    status: "Evaluated",
  },
  {
    id: 2,
    submission: "Data Mavericks",
    judge: "Priya Shah",
    status: "Evaluated",
  },
  {
    id: 3,
    submission: "Tech Titans",
    judge: "Rahul Patel",
    status: "Pending",
  },
  {
    id: 4,
    submission: "Cyber Squad",
    judge: "Unassigned",
    status: "Pending",
  },
  {
    id: 5,
    submission: "AI Innovators",
    judge: "Neha Joshi",
    status: "Evaluated",
  },
];

const EvaluationProgressTracker = ({
  evaluations = defaultEvaluations,
}) => {
  const [statusFilter, setStatusFilter] = useState("All");

  const totalSubmissions = evaluations.length;

  const evaluatedSubmissions = evaluations.filter(
    (item) => item.status === "Evaluated"
  ).length;

  const pendingEvaluations = evaluations.filter(
    (item) => item.status === "Pending"
  ).length;

  const assignedJudges = evaluations.filter(
    (item) => item.judge !== "Unassigned"
  ).length;

  const completionPercentage =
    totalSubmissions === 0
      ? 0
      : Math.round(
          (evaluatedSubmissions / totalSubmissions) * 100
        );

  const filteredEvaluations = useMemo(() => {
    if (statusFilter === "All") {
      return evaluations;
    }

    return evaluations.filter(
      (item) => item.status === statusFilter
    );
  }, [evaluations, statusFilter]);

  return (
    <section className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Evaluation Progress
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Track submission reviews, pending evaluations, and judge
          assignments.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Submissions"
          value={totalSubmissions}
          icon={<ClipboardCheck size={20} />}
        />

        <SummaryCard
          title="Evaluated"
          value={evaluatedSubmissions}
          icon={<CheckCircle2 size={20} />}
          valueClass="text-green-600 dark:text-green-400"
        />

        <SummaryCard
          title="Pending"
          value={pendingEvaluations}
          icon={<Clock3 size={20} />}
          valueClass="text-amber-600 dark:text-amber-400"
        />

        <SummaryCard
          title="Judges Assigned"
          value={`${assignedJudges}/${totalSubmissions}`}
          icon={<Users size={20} />}
          valueClass="text-indigo-600 dark:text-indigo-400"
        />
      </div>

      {/* Progress Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Evaluation Progress
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {evaluatedSubmissions} / {totalSubmissions} submissions
              reviewed
            </p>
          </div>

          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {completionPercentage}%
          </span>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{
              width: `${completionPercentage}%`,
            }}
          />
        </div>

        <div className="mt-3 flex justify-between text-[10px] text-slate-400">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Judge Assignment Warning */}
      {evaluations.some(
        (item) => item.judge === "Unassigned"
      ) && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-900/10">
          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
          />

          <div>
            <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
              Judge assignments require attention
            </p>

            <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">
              Some submissions do not currently have an assigned
              judge.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          Submission Evaluations
        </h2>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-700 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <option value="All">All</option>
          <option value="Evaluated">Evaluated</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      {/* Evaluation Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-slate-800 dark:bg-slate-900">
                <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Submission
                </th>

                <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Judge
                </th>

                <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredEvaluations.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-5 py-12 text-center"
                  >
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      No evaluations found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Try changing the status filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEvaluations.map((item) => (
                  <EvaluationRow
                    key={item.id}
                    item={item}
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

const EvaluationRow = ({ item }) => {
  const isEvaluated = item.status === "Evaluated";
  const isUnassigned = item.judge === "Unassigned";

  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/50">
      <td className="px-5 py-4">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
          {item.submission}
        </p>

        <p className="mt-1 text-[10px] text-slate-400">
          Submission #{item.id}
        </p>
      </td>

      <td className="px-5 py-4">
        <span
          className={
            isUnassigned
              ? "text-xs font-semibold text-amber-600 dark:text-amber-400"
              : "text-xs font-medium text-slate-700 dark:text-slate-300"
          }
        >
          {item.judge}
        </span>
      </td>

      <td className="px-5 py-4">
        <span
          className={`rounded-full px-3 py-1 text-[10px] font-bold ${
            isEvaluated
              ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
              : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
          }`}
        >
          {item.status}
        </span>
      </td>

      <td className="px-5 py-4">
        <button
          type="button"
          className="rounded-xl bg-indigo-50 px-3 py-2 text-[10px] font-bold text-indigo-600 transition hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/40"
        >
          {isEvaluated ? "View Evaluation" : "Assign Judge"}
        </button>
      </td>
    </tr>
  );
};

export default EvaluationProgressTracker;