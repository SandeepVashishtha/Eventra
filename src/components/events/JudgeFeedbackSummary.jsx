import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  ChevronDown,
  MessageSquareText,
  Star,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

const initialSubmissions = [
  {
    id: "SUB-001",
    team: "Team Phoenix",
    evaluations: [
      {
        judge: "Judge A",
        completed: true,
        scores: {
          innovation: 92,
          technical: 88,
          presentation: 90,
        },
        comments:
          "Strong technical implementation with a clear problem statement.",
        strengths:
          "Good architecture, practical solution, strong presentation.",
        improvements:
          "Could improve scalability and documentation.",
      },
      {
        judge: "Judge B",
        completed: true,
        scores: {
          innovation: 90,
          technical: 91,
          presentation: 87,
        },
        comments:
          "The solution demonstrates good technical depth and usability.",
        strengths:
          "Technical execution and user experience were strong.",
        improvements:
          "Add more real-world testing and edge-case handling.",
      },
    ],
  },
  {
    id: "SUB-002",
    team: "Code Warriors",
    evaluations: [
      {
        judge: "Judge A",
        completed: true,
        scores: {
          innovation: 85,
          technical: 94,
          presentation: 82,
        },
        comments:
          "Excellent technical implementation and reliable architecture.",
        strengths:
          "Technical quality and code structure.",
        improvements:
          "The presentation could be more concise.",
      },
      {
        judge: "Judge B",
        completed: false,
        scores: {
          innovation: 0,
          technical: 0,
          presentation: 0,
        },
        comments: "",
        strengths: "",
        improvements: "",
      },
    ],
  },
  {
    id: "SUB-003",
    team: "Innovators",
    evaluations: [
      {
        judge: "Judge A",
        completed: true,
        scores: {
          innovation: 95,
          technical: 78,
          presentation: 88,
        },
        comments:
          "Highly innovative idea with significant potential.",
        strengths:
          "Original concept and strong presentation.",
        improvements:
          "Technical implementation needs more refinement.",
      },
      {
        judge: "Judge B",
        completed: true,
        scores: {
          innovation: 93,
          technical: 81,
          presentation: 90,
        },
        comments:
          "Creative approach with a clear understanding of the problem.",
        strengths:
          "Innovation and problem understanding.",
        improvements:
          "Improve technical robustness and testing.",
      },
    ],
  },
];

const criteria = [
  {
    key: "innovation",
    label: "Innovation",
  },
  {
    key: "technical",
    label: "Technical",
  },
  {
    key: "presentation",
    label: "Presentation",
  },
];

const JudgeFeedbackSummary = () => {
  const [submissions] = useState(initialSubmissions);
  const [expanded, setExpanded] = useState({});
  const [filter, setFilter] = useState("all");

  const summaries = useMemo(() => {
    return submissions.map((submission) => {
      const completed = submission.evaluations.filter(
        (evaluation) => evaluation.completed
      );

      const criteriaScores = {};

      criteria.forEach((criterion) => {
        if (completed.length === 0) {
          criteriaScores[criterion.key] = 0;
          return;
        }

        const total = completed.reduce(
          (sum, evaluation) =>
            sum +
            (evaluation.scores[criterion.key] || 0),
          0
        );

        criteriaScores[criterion.key] =
          total / completed.length;
      });

      const averageScore =
        criteriaScores.innovation * 0.4 +
        criteriaScores.technical * 0.4 +
        criteriaScores.presentation * 0.2;

      const comments = completed
        .filter((evaluation) => evaluation.comments)
        .map((evaluation) => ({
          judge: evaluation.judge,
          text: evaluation.comments,
        }));

      const strengths = completed
        .filter((evaluation) => evaluation.strengths)
        .map((evaluation) => ({
          judge: evaluation.judge,
          text: evaluation.strengths,
        }));

      const improvements = completed
        .filter((evaluation) => evaluation.improvements)
        .map((evaluation) => ({
          judge: evaluation.judge,
          text: evaluation.improvements,
        }));

      return {
        ...submission,
        completedCount: completed.length,
        totalJudges: submission.evaluations.length,
        averageScore,
        criteriaScores,
        comments,
        strengths,
        improvements,
        complete:
          completed.length ===
          submission.evaluations.length,
      };
    });
  }, [submissions]);

  const filteredSummaries = summaries.filter((summary) => {
    if (filter === "complete") {
      return summary.complete;
    }

    if (filter === "pending") {
      return !summary.complete;
    }

    return true;
  });

  const toggleExpanded = (id) => {
    setExpanded((current) => ({
      ...current,
      [id]: !current[id],
    }));
  };

  return (
    <section className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Judge Feedback Summary
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Consolidated evaluation feedback for each
            submission.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-950">
          <MessageSquareText
            size={17}
            className="text-indigo-500"
          />

          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
            {summaries.length} submissions
          </span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-xs font-semibold text-slate-500">
            Total Submissions
          </p>

          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {summaries.length}
          </p>
        </div>

        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900/40 dark:bg-green-900/10">
          <p className="text-xs font-semibold text-green-700 dark:text-green-400">
            Complete Evaluations
          </p>

          <p className="mt-2 text-2xl font-black text-green-700 dark:text-green-300">
            {summaries.filter(
              (summary) => summary.complete
            ).length}
          </p>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-900/40 dark:bg-indigo-900/10">
          <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">
            Average Score
          </p>

          <p className="mt-2 text-2xl font-black text-indigo-700 dark:text-indigo-300">
            {summaries.length > 0
              ? (
                  summaries.reduce(
                    (sum, summary) =>
                      sum + summary.averageScore,
                    0
                  ) / summaries.length
                ).toFixed(1)
              : "0.0"}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {[
          ["all", "All"],
          ["complete", "Complete"],
          ["pending", "Pending"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              filter === value
                ? "bg-indigo-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Submission summaries */}
      <div className="space-y-4">
        {filteredSummaries.map((summary) => {
          const isExpanded = expanded[summary.id];

          return (
            <div
              key={summary.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
            >
              {/* Main summary */}
              <div className="p-5">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        {summary.team}
                      </h2>

                      {summary.complete ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle2 size={12} />
                          Complete
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          <Clock3 size={12} />
                          Pending
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                      {summary.id}
                    </p>
                  </div>

                  <div className="flex items-center gap-5">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Evaluations
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-300">
                        {summary.completedCount}/
                        {summary.totalJudges}
                      </p>
                    </div>

                    <div className="border-l border-slate-200 pl-5 dark:border-slate-800">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Average Score
                      </p>

                      <div className="mt-1 flex items-center gap-1.5">
                        <Star
                          size={15}
                          className="fill-amber-400 text-amber-400"
                        />

                        <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                          {summary.averageScore.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Criteria */}
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {criteria.map((criterion) => (
                    <div
                      key={criterion.key}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {criterion.label}
                        </p>

                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {summary.criteriaScores[
                            criterion.key
                          ].toFixed(1)}
                        </span>
                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{
                            width: `${Math.min(
                              100,
                              summary.criteriaScores[
                                criterion.key
                              ]
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Expand button */}
                <button
                  type="button"
                  onClick={() =>
                    toggleExpanded(summary.id)
                  }
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                >
                  {isExpanded
                    ? "Hide Detailed Feedback"
                    : "View Detailed Feedback"}

                  <ChevronDown
                    size={15}
                    className={`transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Detailed feedback */}
              {isExpanded && (
                <div className="border-t border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
                  <div className="grid gap-5 lg:grid-cols-3">
                    {/* Comments */}
                    <FeedbackSection
                      title="Judge Comments"
                      icon={<MessageSquareText size={16} />}
                      items={summary.comments}
                    />

                    {/* Strengths */}
                    <FeedbackSection
                      title="Strengths"
                      icon={<TrendingUp size={16} />}
                      items={summary.strengths}
                    />

                    {/* Improvements */}
                    <FeedbackSection
                      title="Improvement Areas"
                      icon={<AlertCircle size={16} />}
                      items={summary.improvements}
                    />
                  </div>

                  {/* Individual judge evaluations */}
                  <div className="mt-6">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Individual Judge Evaluations
                    </h3>

                    <div className="mt-3 space-y-3">
                      {summary.evaluations.map(
                        (evaluation) => (
                          <div
                            key={`${summary.id}-${evaluation.judge}`}
                            className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
                          >
                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                              <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                  {evaluation.judge}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {evaluation.completed
                                    ? "Evaluation submitted"
                                    : "Evaluation pending"}
                                </p>
                              </div>

                              {evaluation.completed && (
                                <div className="flex flex-wrap gap-2">
                                  {criteria.map(
                                    (criterion) => (
                                      <span
                                        key={
                                          criterion.key
                                        }
                                        className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                      >
                                        {
                                          evaluation
                                            .scores[
                                            criterion.key
                                          ]
                                        }
                                      </span>
                                    )
                                  )}
                                </div>
                              )}
                            </div>

                            {evaluation.comments && (
                              <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                                {evaluation.comments}
                              </p>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredSummaries.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
          <p className="text-sm font-semibold text-slate-500">
            No submissions match this filter.
          </p>
        </div>
      )}
    </section>
  );
};

const FeedbackSection = ({
  title,
  icon,
  items,
}) => {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="text-indigo-500">
          {icon}
        </span>

        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {title}
        </h3>
      </div>

      <div className="mt-3 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-4 dark:border-slate-700">
            <p className="text-xs text-slate-400">
              No feedback available.
            </p>
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={`${item.judge}-${index}`}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
            >
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                {item.judge}
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
                {item.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default JudgeFeedbackSummary;