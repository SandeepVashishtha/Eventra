import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Users,
  AlertTriangle,
  UserRound,
} from "lucide-react";

const initialJudges = [
  {
    id: 1,
    name: "Judge A",
    assigned: 20,
    completed: 16,
    pending: 4,
    avgTime: 18,
  },
  {
    id: 2,
    name: "Judge B",
    assigned: 15,
    completed: 12,
    pending: 3,
    avgTime: 22,
  },
  {
    id: 3,
    name: "Judge C",
    assigned: 25,
    completed: 18,
    pending: 7,
    avgTime: 16,
  },
  {
    id: 4,
    name: "Judge D",
    assigned: 18,
    completed: 17,
    pending: 1,
    avgTime: 14,
  },
];

const JudgeWorkloadDistribution = () => {
  const [judges, setJudges] = useState(initialJudges);

  const totals = useMemo(() => {
    const assigned = judges.reduce(
      (sum, judge) => sum + judge.assigned,
      0
    );

    const completed = judges.reduce(
      (sum, judge) => sum + judge.completed,
      0
    );

    const pending = judges.reduce(
      (sum, judge) => sum + judge.pending,
      0
    );

    const averageTime =
      judges.length > 0
        ? Math.round(
            judges.reduce(
              (sum, judge) => sum + judge.avgTime,
              0
            ) / judges.length
          )
        : 0;

    return {
      assigned,
      completed,
      pending,
      averageTime,
    };
  }, [judges]);

  const getWorkloadPercentage = (assigned) => {
    if (!totals.assigned) return 0;

    return Math.round(
      (assigned / totals.assigned) * 100
    );
  };

  const getCompletionPercentage = (judge) => {
    if (!judge.assigned) return 0;

    return Math.round(
      (judge.completed / judge.assigned) * 100
    );
  };

  const getWorkloadStatus = (assigned) => {
    const percentage = getWorkloadPercentage(assigned);

    if (percentage >= 30) {
      return {
        label: "High",
        classes:
          "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
      };
    }

    if (percentage >= 20) {
      return {
        label: "Moderate",
        classes:
          "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
      };
    }

    return {
      label: "Balanced",
      classes:
        "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    };
  };

  const reassignSubmission = (judgeId) => {
    const targetJudge = judges.find(
      (judge) => judge.id !== judgeId
    );

    if (!targetJudge) return;

    setJudges((current) =>
      current.map((judge) => {
        if (judge.id === judgeId && judge.pending > 0) {
          return {
            ...judge,
            assigned: judge.assigned - 1,
            pending: judge.pending - 1,
          };
        }

        if (judge.id === targetJudge.id) {
          return {
            ...judge,
            assigned: judge.assigned + 1,
            pending: judge.pending + 1,
          };
        }

        return judge;
      })
    );
  };

  return (
    <section className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Judge Workload Distribution
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Monitor evaluation workload and redistribute
          submissions when necessary.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Assignments"
          value={totals.assigned}
          icon={<Users size={20} />}
        />

        <SummaryCard
          title="Completed Evaluations"
          value={totals.completed}
          icon={<CheckCircle2 size={20} />}
          valueClass="text-green-600 dark:text-green-400"
        />

        <SummaryCard
          title="Pending Evaluations"
          value={totals.pending}
          icon={<Clock3 size={20} />}
          valueClass="text-amber-600 dark:text-amber-400"
        />

        <SummaryCard
          title="Avg. Evaluation Time"
          value={`${totals.averageTime} min`}
          icon={<Clock3 size={20} />}
        />
      </div>

      {/* Workload overview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Workload Overview
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Percentage of total evaluation assignments handled
            by each judge.
          </p>
        </div>

        <div className="space-y-5">
          {judges.map((judge) => {
            const workload = getWorkloadPercentage(
              judge.assigned
            );

            return (
              <div key={judge.id}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserRound
                      size={16}
                      className="text-slate-400"
                    />

                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {judge.name}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    {workload}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                    style={{
                      width: `${workload}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Judge table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Judge Workload
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Review assignments and redistribute pending
            evaluations when required.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                <th className="px-5 py-4 text-left text-xs font-bold text-slate-500">
                  Judge
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold text-slate-500">
                  Assigned
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold text-slate-500">
                  Completed
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold text-slate-500">
                  Pending
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold text-slate-500">
                  Completion
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold text-slate-500">
                  Avg. Time
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold text-slate-500">
                  Workload
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {judges.map((judge) => {
                const completion =
                  getCompletionPercentage(judge);

                const workloadStatus =
                  getWorkloadStatus(judge.assigned);

                return (
                  <tr
                    key={judge.id}
                    className="transition hover:bg-slate-50 dark:hover:bg-slate-900/50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                          <UserRound size={16} />
                        </div>

                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {judge.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {judge.assigned}
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-green-600">
                      {judge.completed}
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-amber-600">
                      {judge.pending}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-green-500"
                            style={{
                              width: `${completion}%`,
                            }}
                          />
                        </div>

                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                          {completion}%
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {judge.avgTime} min
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-bold ${workloadStatus.classes}`}
                      >
                        {workloadStatus.label}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {judge.pending > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            reassignSubmission(judge.id)
                          }
                          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          Reassign
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warning */}
      {judges.some(
        (judge) => getWorkloadPercentage(judge.assigned) >= 30
      ) && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-900/10">
          <AlertTriangle
            size={20}
            className="mt-0.5 text-amber-600"
          />

          <div>
            <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
              Uneven workload detected
            </p>

            <p className="mt-1 text-xs text-amber-600 dark:text-amber-500">
              One or more judges are handling a high percentage
              of the total evaluation workload. Consider
              redistributing pending submissions.
            </p>
          </div>
        </div>
      )}
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

export default JudgeWorkloadDistribution;