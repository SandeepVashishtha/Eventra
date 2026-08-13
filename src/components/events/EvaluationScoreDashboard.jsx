import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Edit3,
  Plus,
  Settings,
  Users,
  X,
} from "lucide-react";

const initialCriteria = [
  { id: 1, name: "Innovation", weight: 30 },
  { id: 2, name: "Technical Quality", weight: 30 },
  { id: 3, name: "Impact", weight: 20 },
  { id: 4, name: "Presentation", weight: 20 },
];

const initialTeams = [
  {
    id: 1,
    name: "Code Warriors",
    status: "Completed",
    judges: [
      {
        name: "Aarav Mehta",
        scores: {
          Innovation: 86,
          "Technical Quality": 91,
          Impact: 82,
          Presentation: 88,
        },
      },
      {
        name: "Priya Shah",
        scores: {
          Innovation: 90,
          "Technical Quality": 87,
          Impact: 85,
          Presentation: 92,
        },
      },
    ],
  },
  {
    id: 2,
    name: "AI Innovators",
    status: "Completed",
    judges: [
      {
        name: "Aarav Mehta",
        scores: {
          Innovation: 94,
          "Technical Quality": 89,
          Impact: 91,
          Presentation: 86,
        },
      },
      {
        name: "Rahul Patel",
        scores: {
          Innovation: 91,
          "Technical Quality": 92,
          Impact: 88,
          Presentation: 90,
        },
      },
    ],
  },
  {
    id: 3,
    name: "Tech Titans",
    status: "Pending",
    judges: [
      {
        name: "Priya Shah",
        scores: {
          Innovation: 80,
          "Technical Quality": 84,
          Impact: 78,
          Presentation: 82,
        },
      },
    ],
  },
];

const EvaluationScoreDashboard = () => {
  const [criteria, setCriteria] = useState(initialCriteria);
  const [teams, setTeams] = useState(initialTeams);

  const [showCriteria, setShowCriteria] = useState(false);
  const [showTeamScores, setShowTeamScores] = useState(null);

  const [newCriteria, setNewCriteria] = useState({
    name: "",
    weight: "",
  });

  const totalWeight = criteria.reduce(
    (sum, criterion) => sum + Number(criterion.weight),
    0
  );

  const calculateJudgeScore = (judge) => {
    if (!totalWeight) return 0;

    const score = criteria.reduce((total, criterion) => {
      const value = Number(judge.scores[criterion.name] || 0);

      return (
        total +
        value *
          (Number(criterion.weight) / totalWeight)
      );
    }, 0);

    return Number(score.toFixed(2));
  };

  const calculateFinalScore = (team) => {
    if (!team.judges.length) return 0;

    const total = team.judges.reduce(
      (sum, judge) => sum + calculateJudgeScore(judge),
      0
    );

    return Number(
      (total / team.judges.length).toFixed(2)
    );
  };

  const completedEvaluations = teams.filter(
    (team) => team.status === "Completed"
  ).length;

  const pendingEvaluations = teams.length - completedEvaluations;

  const averageScore = useMemo(() => {
    const completed = teams.filter(
      (team) => team.status === "Completed"
    );

    if (!completed.length) return 0;

    const total = completed.reduce(
      (sum, team) => sum + calculateFinalScore(team),
      0
    );

    return Number((total / completed.length).toFixed(2));
  }, [teams, criteria]);

  const rankedTeams = useMemo(() => {
    return [...teams].sort(
      (a, b) =>
        calculateFinalScore(b) -
        calculateFinalScore(a)
    );
  }, [teams, criteria]);

  const addCriteria = (event) => {
    event.preventDefault();

    const name = newCriteria.name.trim();
    const weight = Number(newCriteria.weight);

    if (!name || weight <= 0) return;

    if (
      criteria.some(
        (criterion) =>
          criterion.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      alert("This criterion already exists.");
      return;
    }

    setCriteria((current) => [
      ...current,
      {
        id: Date.now(),
        name,
        weight,
      },
    ]);

    setNewCriteria({
      name: "",
      weight: "",
    });
  };

  const removeCriteria = (id) => {
    setCriteria((current) =>
      current.filter((criterion) => criterion.id !== id)
    );
  };

  return (
    <section className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Evaluation Score Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage judge scores, weighted criteria, and final
            submission rankings.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCriteria(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-indigo-700"
        >
          <Settings size={16} />
          Configure Criteria
        </button>
      </div>

      {/* Weight Warning */}
      {totalWeight !== 100 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-900/10">
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
            Criteria weights currently total {totalWeight}%.
          </p>

          <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-500">
            For a standard weighted score, configure the criteria
            so that the total weight equals 100%.
          </p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Teams"
          value={teams.length}
          icon={<Users size={20} />}
        />

        <SummaryCard
          title="Evaluated"
          value={completedEvaluations}
          icon={<CheckCircle2 size={20} />}
          valueClass="text-green-600 dark:text-green-400"
        />

        <SummaryCard
          title="Pending"
          value={pendingEvaluations}
          icon={<Edit3 size={20} />}
          valueClass="text-amber-600 dark:text-amber-400"
        />

        <SummaryCard
          title="Average Score"
          value={`${averageScore}/100`}
          icon={<CheckCircle2 size={20} />}
          valueClass="text-indigo-600 dark:text-indigo-400"
        />
      </div>

      {/* Criteria */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Scoring Criteria
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Current criteria and their configured weights.
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-[10px] font-bold ${
              totalWeight === 100
                ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
            }`}
          >
            Total: {totalWeight}%
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {criteria.map((criterion) => (
            <div
              key={criterion.id}
              className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
            >
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {criterion.name}
              </p>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  {criterion.weight}%
                </span>

                <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{
                      width: `${Math.min(
                        criterion.weight,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ranking Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Evaluation Scores
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Review individual judge scores and final weighted
            rankings.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Rank
                </th>

                <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Team
                </th>

                <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Judges
                </th>

                <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Judge Scores
                </th>

                <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Final Score
                </th>

                <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {rankedTeams.map((team, index) => {
                const finalScore =
                  calculateFinalScore(team);

                return (
                  <tr
                    key={team.id}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                  >
                    <td className="px-5 py-5">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        #{index + 1}
                      </span>
                    </td>

                    <td className="px-5 py-5">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {team.name}
                      </p>
                    </td>

                    <td className="px-5 py-5">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                        {team.judges.length} judge
                        {team.judges.length !== 1
                          ? "s"
                          : ""}
                      </span>
                    </td>

                    <td className="px-5 py-5">
                      <div className="flex flex-wrap gap-2">
                        {team.judges.map((judge) => (
                          <span
                            key={judge.name}
                            className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-400"
                          >
                            {judge.name}:{" "}
                            {calculateJudgeScore(judge)}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-5 py-5">
                      <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        {finalScore}
                      </span>
                    </td>

                    <td className="px-5 py-5">
                      <StatusBadge status={team.status} />
                    </td>

                    <td className="px-5 py-5">
                      <button
                        type="button"
                        onClick={() =>
                          setShowTeamScores(team)
                        }
                        className="rounded-xl bg-indigo-50 px-3 py-2 text-[10px] font-bold text-indigo-600 transition hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400"
                      >
                        View Scores
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Criteria Modal */}
      {showCriteria && (
        <Modal
          title="Configure Scoring Criteria"
          onClose={() => setShowCriteria(false)}
        >
          <form
            onSubmit={addCriteria}
            className="space-y-4"
          >
            <Input
              label="Criterion Name"
              value={newCriteria.name}
              placeholder="e.g. Creativity"
              onChange={(value) =>
                setNewCriteria((current) => ({
                  ...current,
                  name: value,
                }))
              }
            />

            <Input
              label="Weight (%)"
              type="number"
              min="1"
              max="100"
              value={newCriteria.weight}
              placeholder="e.g. 15"
              onChange={(value) =>
                setNewCriteria((current) => ({
                  ...current,
                  weight: value,
                }))
              }
            />

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white hover:bg-indigo-700"
            >
              <Plus size={15} />
              Add Criterion
            </button>
          </form>

          <div className="mt-6 space-y-2">
            {criteria.map((criterion) => (
              <div
                key={criterion.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-3 dark:border-slate-800"
              >
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {criterion.name}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Weight: {criterion.weight}%
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    removeCriteria(criterion.id)
                  }
                  className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Team Score Modal */}
      {showTeamScores && (
        <Modal
          title={`${showTeamScores.name} — Score Details`}
          onClose={() => setShowTeamScores(null)}
          wide
        >
          <div className="space-y-5">
            {showTeamScores.judges.map((judge) => (
              <div
                key={judge.name}
                className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {judge.name}
                  </p>

                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                    {calculateJudgeScore(judge)}/100
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {criteria.map((criterion) => (
                    <div
                      key={criterion.id}
                      className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900"
                    >
                      <div className="flex justify-between">
                        <span className="text-[10px] text-slate-500">
                          {criterion.name}
                        </span>

                        <span className="text-[10px] font-bold text-indigo-600">
                          {judge.scores[
                            criterion.name
                          ] ?? 0}
                        </span>
                      </div>

                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{
                            width: `${Math.min(
                              Number(
                                judge.scores[
                                  criterion.name
                                ] ?? 0
                              ),
                              100
                            )}%`,
                          }}
                        />
                      </div>

                      <p className="mt-1 text-[9px] text-slate-400">
                        Weight: {criterion.weight}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="rounded-2xl bg-indigo-50 p-5 dark:bg-indigo-900/20">
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                Final Weighted Score
              </p>

              <p className="mt-1 text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                {calculateFinalScore(showTeamScores)}
                <span className="text-sm"> / 100</span>
              </p>
            </div>
          </div>
        </Modal>
      )}
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

const StatusBadge = ({ status }) => {
  const completed = status === "Completed";

  return (
    <span
      className={`rounded-full px-3 py-1 text-[10px] font-bold ${
        completed
          ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
          : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
      }`}
    >
      {status}
    </span>
  );
};

const Modal = ({
  title,
  onClose,
  children,
  wide = false,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div
      className={`w-full ${
        wide ? "max-w-3xl" : "max-w-md"
      } max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-950`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {title}
        </h3>

        <button
          type="button"
          onClick={onClose}
          className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mt-5">{children}</div>
    </div>
  </div>
);

const Input = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  max,
}) => (
  <label className="block">
    <span className="mb-2 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
      {label}
    </span>

    <input
      type={type}
      min={min}
      max={max}
      value={value}
      placeholder={placeholder}
      onChange={(event) =>
        onChange(event.target.value)
      }
      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-800 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
    />
  </label>
);

export default EvaluationScoreDashboard;