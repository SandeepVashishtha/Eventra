import {
  AlertTriangle,
  BarChart3,
  Brain,
  CheckCircle2,
  Clock3,
  Flame,
  Target,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_TOPICS = [
  {
    id: 1,
    topic: "Data Structures",
    coverage: 92,
    accuracy: 88,
    revisions: 8,
    difficulty: 4,
    recentPerformance: 91,
  },
  {
    id: 2,
    topic: "Algorithms",
    coverage: 78,
    accuracy: 74,
    revisions: 5,
    difficulty: 4,
    recentPerformance: 76,
  },
  {
    id: 3,
    topic: "DBMS",
    coverage: 65,
    accuracy: 68,
    revisions: 3,
    difficulty: 3,
    recentPerformance: 62,
  },
  {
    id: 4,
    topic: "Operating Systems",
    coverage: 48,
    accuracy: 55,
    revisions: 2,
    difficulty: 3,
    recentPerformance: 51,
  },
  {
    id: 5,
    topic: "Computer Networks",
    coverage: 35,
    accuracy: 42,
    revisions: 1,
    difficulty: 2,
    recentPerformance: 39,
  },
  {
    id: 6,
    topic: "System Design",
    coverage: 24,
    accuracy: 31,
    revisions: 1,
    difficulty: 5,
    recentPerformance: 28,
  },
  {
    id: 7,
    topic: "OOP",
    coverage: 86,
    accuracy: 82,
    revisions: 6,
    difficulty: 3,
    recentPerformance: 85,
  },
  {
    id: 8,
    topic: "Python",
    coverage: 94,
    accuracy: 91,
    revisions: 9,
    difficulty: 3,
    recentPerformance: 93,
  },
  {
    id: 9,
    topic: "Machine Learning",
    coverage: 58,
    accuracy: 61,
    revisions: 3,
    difficulty: 4,
    recentPerformance: 59,
  },
  {
    id: 10,
    topic: "Behavioral",
    coverage: 72,
    accuracy: 79,
    revisions: 4,
    difficulty: 2,
    recentPerformance: 77,
  },
  {
    id: 11,
    topic: "JavaScript",
    coverage: 81,
    accuracy: 78,
    revisions: 5,
    difficulty: 3,
    recentPerformance: 80,
  },
  {
    id: 12,
    topic: "React",
    coverage: 67,
    accuracy: 71,
    revisions: 3,
    difficulty: 3,
    recentPerformance: 69,
  },
];

const getCoverageLevel = (score) => {
  if (score >= 80) return "High";
  if (score >= 60) return "Medium";
  if (score >= 40) return "Low";
  return "Very Low";
};

const getCoverageClasses = (score) => {
  if (score >= 80) {
    return "border-green-200 bg-green-100 text-green-700 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-400";
  }

  if (score >= 60) {
    return "border-indigo-200 bg-indigo-100 text-indigo-700 dark:border-indigo-900/40 dark:bg-indigo-900/20 dark:text-indigo-400";
  }

  if (score >= 40) {
    return "border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-400";
  }

  return "border-red-200 bg-red-100 text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400";
};

const getRecommendation = (topic) => {
  if (topic.coverage < 40) {
    return `Prioritize ${topic.topic}. Coverage is very low and needs focused practice.`;
  }

  if (topic.accuracy < 50) {
    return `Review ${topic.topic} fundamentals and practice more questions.`;
  }

  if (topic.revisions <= 1) {
    return `Schedule another revision for ${topic.topic}.`;
  }

  if (topic.recentPerformance < 60) {
    return `Your recent ${topic.topic} performance is declining. Try a targeted revision session.`;
  }

  return `${topic.topic} is progressing well. Continue regular practice.`;
};

const getOverallScore = (topics) => {
  if (!topics.length) return 0;

  return Math.round(
    topics.reduce((sum, topic) => {
      return (
        sum +
        topic.coverage * 0.3 +
        topic.accuracy * 0.25 +
        Math.min(topic.revisions * 10, 100) * 0.15 +
        topic.difficulty * 20 * 0.1 +
        topic.recentPerformance * 0.2
      );
    }, 0) / topics.length
  );
};

const AIInterviewPreparationCoverageHeatmap = ({
  topics = DEFAULT_TOPICS,
}) => {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [metric, setMetric] = useState("coverage");
  const [filter, setFilter] = useState("All");

  const overallScore = useMemo(
    () => getOverallScore(topics),
    [topics]
  );

  const counts = useMemo(
    () => ({
      high: topics.filter((topic) => topic.coverage >= 80).length,
      medium: topics.filter(
        (topic) =>
          topic.coverage >= 60 && topic.coverage < 80
      ).length,
      low: topics.filter(
        (topic) =>
          topic.coverage >= 40 && topic.coverage < 60
      ).length,
      veryLow: topics.filter((topic) => topic.coverage < 40)
        .length,
    }),
    [topics]
  );

  const filteredTopics = useMemo(() => {
    if (filter === "All") return topics;

    if (filter === "High") {
      return topics.filter((topic) => topic.coverage >= 80);
    }

    if (filter === "Medium") {
      return topics.filter(
        (topic) =>
          topic.coverage >= 60 && topic.coverage < 80
      );
    }

    if (filter === "Low") {
      return topics.filter(
        (topic) =>
          topic.coverage >= 40 && topic.coverage < 60
      );
    }

    return topics.filter((topic) => topic.coverage < 40);
  }, [topics, filter]);

  const metricValue = (topic) => {
    if (metric === "coverage") return topic.coverage;
    if (metric === "accuracy") return topic.accuracy;
    if (metric === "performance") {
      return topic.recentPerformance;
    }

    return Math.min(topic.revisions * 10, 100);
  };

  const selected = topics.find(
    (topic) => topic.id === selectedTopic
  );

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Brain size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              AI Interview Preparation
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Preparation Coverage Heatmap
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Visualize topic coverage, accuracy, revision
              frequency, difficulty and recent interview
              performance.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
            Overall Preparation
          </p>

          <p className="mt-1 text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {overallScore}%
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={CheckCircle2}
          title="High Coverage"
          value={counts.high}
          description="topics"
          className="text-green-600 dark:text-green-400"
        />

        <SummaryCard
          icon={Target}
          title="Medium Coverage"
          value={counts.medium}
          description="topics"
          className="text-indigo-600 dark:text-indigo-400"
        />

        <SummaryCard
          icon={Clock3}
          title="Low Coverage"
          value={counts.low}
          description="topics"
          className="text-amber-600 dark:text-amber-400"
        />

        <SummaryCard
          icon={AlertTriangle}
          title="Needs Attention"
          value={counts.veryLow}
          description="topics"
          className="text-red-600 dark:text-red-400"
        />
      </div>

      {/* Controls */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Heatmap Controls
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Choose which preparation metric you want to
              visualize.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              ["coverage", "Coverage"],
              ["accuracy", "Accuracy"],
              ["revisions", "Revisions"],
              ["performance", "Recent Performance"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMetric(value)}
                className={`rounded-xl px-3 py-2 text-[6px] font-bold transition ${
                  metric === value
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Coverage Filter */}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          {["All", "High", "Medium", "Low", "Very Low"].map(
            (value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-lg px-3 py-1.5 text-[5px] font-bold transition ${
                  filter === value
                    ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {value}
              </button>
            )
          )}
        </div>
      </div>

      {/* Heatmap */}
      <div className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Topic Coverage Heatmap
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Click a topic to inspect its preparation details.
            </p>
          </div>

          <BarChart3
            size={17}
            className="text-slate-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {filteredTopics.map((topic) => {
            const value = metricValue(topic);
            const level = getCoverageLevel(topic.coverage);

            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => setSelectedTopic(topic.id)}
                className={`group rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${getCoverageClasses(
                  topic.coverage
                )}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="line-clamp-2 text-[8px] font-bold">
                    {topic.topic}
                  </span>

                  <span className="shrink-0 text-[8px] font-black">
                    {value}%
                  </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/60 dark:bg-slate-900/40">
                  <div
                    className="h-full rounded-full bg-current opacity-70 transition-all duration-500"
                    style={{
                      width: `${Math.min(value, 100)}%`,
                    }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[5px] font-bold uppercase tracking-wide opacity-70">
                    {level}
                  </span>

                  <span className="text-[5px] opacity-60">
                    View details →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
          Coverage Legend
        </p>

        <div className="mt-3 flex flex-wrap gap-3">
          <LegendItem
            label="High Coverage"
            className="bg-green-500"
          />
          <LegendItem
            label="Medium Coverage"
            className="bg-indigo-500"
          />
          <LegendItem
            label="Low Coverage"
            className="bg-amber-500"
          />
          <LegendItem
            label="Very Low Coverage"
            className="bg-red-500"
          />
        </div>
      </div>

      {/* Selected Topic */}
      {selected && (
        <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-900/30 dark:bg-indigo-900/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[6px] font-bold uppercase tracking-wide text-indigo-500 dark:text-indigo-400">
                Topic Details
              </p>

              <h3 className="mt-1 text-lg font-bold text-indigo-800 dark:text-indigo-300">
                {selected.topic}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setSelectedTopic(null)}
              className="w-fit rounded-lg bg-white px-3 py-2 text-[6px] font-bold text-slate-500 dark:bg-slate-900 dark:text-slate-400"
            >
              Close
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <MetricCard
              label="Coverage"
              value={`${selected.coverage}%`}
            />

            <MetricCard
              label="Accuracy"
              value={`${selected.accuracy}%`}
            />

            <MetricCard
              label="Revisions"
              value={selected.revisions}
            />

            <MetricCard
              label="Difficulty"
              value={`${selected.difficulty}/5`}
            />

            <MetricCard
              label="Recent Performance"
              value={`${selected.recentPerformance}%`}
            />
          </div>

          {/* Recommendation */}
          <div className="mt-5 flex items-start gap-3 rounded-xl bg-white p-4 dark:bg-slate-900">
            <Target
              size={16}
              className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
            />

            <div>
              <p className="text-[7px] font-bold text-slate-700 dark:text-slate-300">
                Recommendation
              </p>

              <p className="mt-1 text-[7px] leading-4 text-slate-500 dark:text-slate-400">
                {getRecommendation(selected)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="mt-6">
        <div className="mb-4 flex items-center gap-2">
          <Flame
            size={15}
            className="text-amber-500"
          />

          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Recommended Focus Areas
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Topics that need additional preparation.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {[...topics]
            .sort((a, b) => a.coverage - b.coverage)
            .slice(0, 3)
            .map((topic) => (
              <div
                key={topic.id}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  <AlertTriangle size={15} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-[8px] font-bold text-slate-800 dark:text-white">
                      {topic.topic}
                    </h4>

                    <span className="text-[7px] font-black text-red-600 dark:text-red-400">
                      {topic.coverage}% coverage
                    </span>
                  </div>

                  <p className="mt-1 text-[6px] leading-4 text-slate-400">
                    {getRecommendation(topic)}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

const SummaryCard = ({
  icon: Icon,
  title,
  value,
  description,
  className,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center gap-3">
      <div className={`rounded-xl bg-slate-50 p-2 dark:bg-slate-800 ${className}`}>
        <Icon size={15} />
      </div>

      <div>
        <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
          {title}
        </p>

        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-xl font-black text-slate-800 dark:text-white">
            {value}
          </span>

          <span className="text-[6px] text-slate-400">
            {description}
          </span>
        </div>
      </div>
    </div>
  </div>
);

const MetricCard = ({ label, value }) => (
  <div className="rounded-xl bg-white p-3 dark:bg-slate-900">
    <p className="text-[5px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1 text-base font-black text-slate-800 dark:text-white">
      {value}
    </p>
  </div>
);

const LegendItem = ({ label, className }) => (
  <div className="flex items-center gap-2">
    <span className={`h-3 w-3 rounded-full ${className}`} />
    <span className="text-[6px] font-semibold text-slate-500 dark:text-slate-400">
      {label}
    </span>
  </div>
);

export default AIInterviewPreparationCoverageHeatmap;