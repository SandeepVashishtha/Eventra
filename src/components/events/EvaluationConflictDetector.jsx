import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Settings2,
  Eye,
} from "lucide-react";

const initialSubmissions = [
  {
    id: "SUB-001",
    team: "Team Phoenix",
    judges: [
      { name: "Judge A", score: 92 },
      { name: "Judge B", score: 61 },
      { name: "Judge C", score: 88 },
    ],
  },
  {
    id: "SUB-002",
    team: "Code Warriors",
    judges: [
      { name: "Judge A", score: 84 },
      { name: "Judge B", score: 81 },
      { name: "Judge C", score: 86 },
    ],
  },
  {
    id: "SUB-003",
    team: "Innovators",
    judges: [
      { name: "Judge A", score: 74 },
      { name: "Judge B", score: 52 },
      { name: "Judge C", score: 78 },
    ],
  },
];

const EvaluationConflictDetector = () => {
  const [threshold, setThreshold] = useState(20);
  const [submissions, setSubmissions] =
    useState(initialSubmissions);
  const [reviewRequested, setReviewRequested] = useState({});

  const analyzedSubmissions = useMemo(() => {
    return submissions.map((submission) => {
      const scores = submission.judges.map(
        (judge) => judge.score
      );

      const highest = Math.max(...scores);
      const lowest = Math.min(...scores);
      const difference = highest - lowest;

      return {
        ...submission,
        highest,
        lowest,
        difference,
        conflict: difference > threshold,
      };
    });
  }, [submissions, threshold]);

  const conflictCount = analyzedSubmissions.filter(
    (submission) => submission.conflict
  ).length;

  const requestReview = (submissionId) => {
    setReviewRequested((current) => ({
      ...current,
      [submissionId]: true,
    }));
  };

  const updateJudgeScore = (
    submissionId,
    judgeIndex,
    value
  ) => {
    const numericValue = Number(value);

    if (
      !Number.isFinite(numericValue) ||
      numericValue < 0 ||
      numericValue > 100
    ) {
      return;
    }

    setSubmissions((current) =>
      current.map((submission) => {
        if (submission.id !== submissionId) {
          return submission;
        }

        const updatedJudges = submission.judges.map(
          (judge, index) =>
            index === judgeIndex
              ? { ...judge, score: numericValue }
              : judge
        );

        return {
          ...submission,
          judges: updatedJudges,
        };
      })
    );
  };

  return (
    <section className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Evaluation Conflict Detection
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Identify significant differences between judge
            evaluations.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-950">
          <AlertTriangle
            size={17}
            className={
              conflictCount > 0
                ? "text-amber-500"
                : "text-green-500"
            }
          />

          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {conflictCount} conflict
            {conflictCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Configuration */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
              <Settings2 size={19} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Conflict Threshold
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Flag evaluations when the highest and lowest
                scores differ by more than this value.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              max="100"
              value={threshold}
              onChange={(event) =>
                setThreshold(
                  Math.max(
                    1,
                    Math.min(100, Number(event.target.value))
                  )
                )
              }
              className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-sm font-bold outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

            <span className="text-sm font-semibold text-slate-500">
              points
            </span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-xs font-semibold text-slate-500">
            Total Submissions
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {analyzedSubmissions.length}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/40 dark:bg-amber-900/10">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
            Conflicts Detected
          </p>

          <p className="mt-2 text-2xl font-bold text-amber-700 dark:text-amber-300">
            {conflictCount}
          </p>
        </div>

        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900/40 dark:bg-green-900/10">
          <p className="text-xs font-semibold text-green-700 dark:text-green-400">
            Within Threshold
          </p>

          <p className="mt-2 text-2xl font-bold text-green-700 dark:text-green-300">
            {analyzedSubmissions.length - conflictCount}
          </p>
        </div>
      </div>

      {/* Submission list */}
      <div className="space-y-4">
        {analyzedSubmissions.map((submission) => (
          <div
            key={submission.id}
            className={`rounded-2xl border bg-white p-5 dark:bg-slate-950 ${
              submission.conflict
                ? "border-amber-300 dark:border-amber-900/60"
                : "border-slate-200 dark:border-slate-800"
            }`}
          >
            {/* Submission header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {submission.team}
                  </h2>

                  {submission.conflict ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      <AlertTriangle size={12} />
                      Significant Difference
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <CheckCircle2 size={12} />
                      Within Threshold
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {submission.id}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs font-semibold text-slate-500">
                  Score Difference
                </p>

                <p
                  className={`mt-1 text-xl font-bold ${
                    submission.conflict
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {submission.difference} points
                </p>
              </div>
            </div>

            {/* Judge scores */}
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {submission.judges.map((judge, index) => (
                <div
                  key={`${submission.id}-${judge.name}`}
                  className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {judge.name}
                    </p>

                    <span className="text-[10px] font-semibold text-slate-400">
                      /100
                    </span>
                  </div>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={judge.score}
                    onChange={(event) =>
                      updateJudgeScore(
                        submission.id,
                        index,
                        event.target.value
                      )
                    }
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-lg font-bold outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              ))}
            </div>

            {/* Conflict details */}
            {submission.conflict && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-900/10">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                      ⚠️ Significant score difference
                    </p>

                    <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                      Scores range from {submission.lowest} to{" "}
                      {submission.highest}, exceeding the{" "}
                      {threshold}-point threshold.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      requestReview(submission.id)
                    }
                    disabled={reviewRequested[submission.id]}
                    className="flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Eye size={15} />

                    {reviewRequested[submission.id]
                      ? "Review Requested"
                      : "Request Review"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default EvaluationConflictDetector;