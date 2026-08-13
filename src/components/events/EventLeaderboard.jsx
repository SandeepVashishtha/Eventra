import { useMemo, useState } from "react";
import {
  Trophy,
  Medal,
  Award,
  CheckCircle2,
  Clock3,
  Settings2,
} from "lucide-react";

const initialTeams = [
  {
    id: "TEAM-001",
    name: "Team Phoenix",
    evaluations: [
      {
        judge: "Judge A",
        completed: true,
        criteria: {
          innovation: 92,
          technical: 88,
          presentation: 90,
        },
      },
      {
        judge: "Judge B",
        completed: true,
        criteria: {
          innovation: 90,
          technical: 91,
          presentation: 87,
        },
      },
    ],
  },
  {
    id: "TEAM-002",
    name: "Code Warriors",
    evaluations: [
      {
        judge: "Judge A",
        completed: true,
        criteria: {
          innovation: 85,
          technical: 94,
          presentation: 82,
        },
      },
      {
        judge: "Judge B",
        completed: true,
        criteria: {
          innovation: 88,
          technical: 92,
          presentation: 85,
        },
      },
    ],
  },
  {
    id: "TEAM-003",
    name: "Innovators",
    evaluations: [
      {
        judge: "Judge A",
        completed: true,
        criteria: {
          innovation: 95,
          technical: 78,
          presentation: 88,
        },
      },
      {
        judge: "Judge B",
        completed: false,
        criteria: {
          innovation: 0,
          technical: 0,
          presentation: 0,
        },
      },
    ],
  },
  {
    id: "TEAM-004",
    name: "Tech Titans",
    evaluations: [
      {
        judge: "Judge A",
        completed: true,
        criteria: {
          innovation: 80,
          technical: 86,
          presentation: 84,
        },
      },
      {
        judge: "Judge B",
        completed: true,
        criteria: {
          innovation: 82,
          technical: 84,
          presentation: 86,
        },
      },
    ],
  },
];

const initialWeights = {
  innovation: 40,
  technical: 40,
  presentation: 20,
};

const criteriaLabels = {
  innovation: "Innovation",
  technical: "Technical",
  presentation: "Presentation",
};

const EventLeaderboard = () => {
  const [teams] = useState(initialTeams);
  const [weights, setWeights] = useState(initialWeights);
  const [showSettings, setShowSettings] = useState(false);
  const [includeIncomplete, setIncludeIncomplete] = useState(false);

  const leaderboard = useMemo(() => {
    return teams
      .map((team) => {
        const completedEvaluations = team.evaluations.filter(
          (evaluation) => evaluation.completed
        );

        const eligibleEvaluations = includeIncomplete
          ? team.evaluations
          : completedEvaluations;

        const evaluationCount = completedEvaluations.length;

        if (eligibleEvaluations.length === 0) {
          return {
            ...team,
            score: 0,
            evaluationCount,
            totalEvaluations: team.evaluations.length,
            status: "Pending",
          };
        }

        const criteriaScores = {};

        Object.keys(criteriaLabels).forEach((criteria) => {
          const total = eligibleEvaluations.reduce(
            (sum, evaluation) =>
              sum + (evaluation.criteria[criteria] || 0),
            0
          );

          criteriaScores[criteria] =
            total / eligibleEvaluations.length;
        });

        const score = Object.keys(weights).reduce(
          (total, criteria) => {
            return (
              total +
              criteriaScores[criteria] *
                (weights[criteria] / 100)
            );
          },
          0
        );

        return {
          ...team,
          score,
          criteriaScores,
          evaluationCount,
          totalEvaluations: team.evaluations.length,
          status:
            evaluationCount === team.evaluations.length
              ? "Complete"
              : "Pending",
        };
      })
      .filter(
        (team) =>
          includeIncomplete ||
          team.evaluationCount > 0
      )
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        // Tie-breaker:
        // Higher technical score wins.
        return (
          (b.criteriaScores?.technical || 0) -
          (a.criteriaScores?.technical || 0)
        );
      })
      .map((team, index, sortedTeams) => {
        let rank = index + 1;

        if (
          index > 0 &&
          sortedTeams[index - 1].score === team.score &&
          (sortedTeams[index - 1].criteriaScores?.technical ||
            0) ===
            (team.criteriaScores?.technical || 0)
        ) {
          rank = sortedTeams[index - 1].rank;
        }

        return {
          ...team,
          rank,
        };
      });
  }, [teams, weights, includeIncomplete]);

  const updateWeight = (criteria, value) => {
    const numericValue = Number(value);

    if (
      !Number.isFinite(numericValue) ||
      numericValue < 0 ||
      numericValue > 100
    ) {
      return;
    }

    setWeights((current) => ({
      ...current,
      [criteria]: numericValue,
    }));
  };

  const totalWeight = Object.values(weights).reduce(
    (sum, value) => sum + value,
    0
  );

  const completedTeams = leaderboard.filter(
    (team) => team.status === "Complete"
  ).length;

  return (
    <section className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Event Leaderboard
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Rankings generated from completed evaluation
            scores.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowSettings((value) => !value)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
        >
          <Settings2 size={17} />
          Criteria Weights
        </button>
      </div>

      {/* Weight settings */}
      {showSettings && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-5">
            <h2 className="font-bold text-slate-900 dark:text-white">
              Scoring Configuration
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Configure how each criterion contributes to
              the final score.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {Object.keys(criteriaLabels).map((criteria) => (
              <div key={criteria}>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {criteriaLabels[criteria]}
                </label>

                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={weights[criteria]}
                    onChange={(event) =>
                      updateWeight(
                        criteria,
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />

                  <span className="text-sm text-slate-500">
                    %
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div
            className={`mt-4 rounded-xl p-3 text-xs font-semibold ${
              totalWeight === 100
                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
            }`}
          >
            Total weight: {totalWeight}%

            {totalWeight !== 100 &&
              " — weights should total 100%."}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-xs font-semibold text-slate-500">
            Ranked Teams
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {leaderboard.length}
          </p>
        </div>

        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900/40 dark:bg-green-900/10">
          <p className="text-xs font-semibold text-green-700 dark:text-green-400">
            Completed Evaluations
          </p>

          <p className="mt-2 text-2xl font-bold text-green-700 dark:text-green-300">
            {completedTeams}
          </p>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-900/40 dark:bg-indigo-900/10">
          <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">
            Top Score
          </p>

          <p className="mt-2 text-2xl font-bold text-indigo-700 dark:text-indigo-300">
            {leaderboard[0]
              ? leaderboard[0].score.toFixed(2)
              : "0.00"}
          </p>
        </div>
      </div>

      {/* Incomplete evaluation option */}
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
        <input
          type="checkbox"
          checked={includeIncomplete}
          onChange={(event) =>
            setIncludeIncomplete(event.target.checked)
          }
          className="h-4 w-4 rounded"
        />

        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Include teams with incomplete evaluations
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Teams with pending judges will remain visible in
            the leaderboard.
          </p>
        </div>
      </label>

      {/* Podium */}
      {leaderboard.length >= 3 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {leaderboard.slice(0, 3).map((team) => {
            const Icon =
              team.rank === 1
                ? Trophy
                : team.rank === 2
                  ? Medal
                  : Award;

            return (
              <div
                key={team.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-950"
              >
                <Icon
                  size={32}
                  className="mx-auto text-amber-500"
                />

                <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                  Rank #{team.rank}
                </p>

                <h3 className="mt-1 font-bold text-slate-900 dark:text-white">
                  {team.name}
                </h3>

                <p className="mt-3 text-3xl font-black text-indigo-600 dark:text-indigo-400">
                  {team.score.toFixed(2)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Leaderboard table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                  Rank
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                  Team
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                  Score
                </th>

                {Object.keys(criteriaLabels).map(
                  (criteria) => (
                    <th
                      key={criteria}
                      className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500"
                    >
                      {criteriaLabels[criteria]}
                    </th>
                  )
                )}

                <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                  Evaluations
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {leaderboard.map((team) => (
                <tr
                  key={team.id}
                  className="transition hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  <td className="px-5 py-4">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {team.rank}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {team.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {team.id}
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                      {team.score.toFixed(2)}
                    </span>
                  </td>

                  {Object.keys(criteriaLabels).map(
                    (criteria) => (
                      <td
                        key={criteria}
                        className="px-5 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300"
                      >
                        {team.criteriaScores?.[criteria]
                          ? team.criteriaScores[
                              criteria
                            ].toFixed(1)
                          : "—"}
                      </td>
                    )
                  )}

                  <td className="px-5 py-4">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      {team.evaluationCount}/
                      {team.totalEvaluations}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    {team.status === "Complete" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle2 size={13} />
                        Complete
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        <Clock3 size={13} />
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default EventLeaderboard;