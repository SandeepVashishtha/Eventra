import { useEffect, useMemo, useState } from "react";
import {
  Save,
  Clock3,
  CheckCircle2,
  RotateCcw,
  FileText,
} from "lucide-react";

const STORAGE_KEY = "eventra-judge-evaluation-draft";

const criteria = [
  {
    id: "innovation",
    name: "Innovation",
    description: "Originality and creativity of the solution.",
    maxScore: 10,
  },
  {
    id: "technical",
    name: "Technical Implementation",
    description: "Quality and effectiveness of implementation.",
    maxScore: 10,
  },
  {
    id: "impact",
    name: "Impact",
    description: "Potential value and real-world usefulness.",
    maxScore: 10,
  },
  {
    id: "presentation",
    name: "Presentation",
    description: "Clarity and quality of the presentation.",
    maxScore: 10,
  },
];

const createInitialScores = () =>
  criteria.reduce((result, criterion) => {
    result[criterion.id] = "";
    return result;
  }, {});

const JudgeEvaluationDraft = () => {
  const [scores, setScores] = useState(createInitialScores);
  const [comments, setComments] = useState("");
  const [lastSaved, setLastSaved] = useState(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [saveState, setSaveState] = useState("idle");

  const completedCriteria = useMemo(
    () =>
      criteria.filter(
        (criterion) =>
          scores[criterion.id] !== "" &&
          scores[criterion.id] !== null
      ).length,
    [scores]
  );

  const progress = Math.round(
    (completedCriteria / criteria.length) * 100
  );

  const totalScore = criteria.reduce((total, criterion) => {
    const value = Number(scores[criterion.id]);

    return Number.isFinite(value) ? total + value : total;
  }, 0);

  const maxScore = criteria.reduce(
    (total, criterion) => total + criterion.maxScore,
    0
  );

  const saveDraft = (draft = {}) => {
    const savedAt = new Date().toISOString();

    const data = {
      scores: draft.scores ?? scores,
      comments: draft.comments ?? comments,
      progress,
      savedAt,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    setLastSaved(savedAt);
    setHasDraft(true);
    setSaveState("saved");
  };

  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);

    if (!savedDraft) return;

    try {
      const parsed = JSON.parse(savedDraft);

      if (parsed.scores) {
        setScores({
          ...createInitialScores(),
          ...parsed.scores,
        });
      }

      if (typeof parsed.comments === "string") {
        setComments(parsed.comments);
      }

      if (parsed.savedAt) {
        setLastSaved(parsed.savedAt);
      }

      setHasDraft(true);
    } catch (error) {
      console.error("Unable to restore evaluation draft:", error);
    }
  }, []);

  useEffect(() => {
    if (!hasDraft) return;

    setSaveState("saving");

    const timer = setTimeout(() => {
      saveDraft();
    }, 800);

    return () => clearTimeout(timer);
  }, [scores, comments]);

  const updateScore = (criterionId, value) => {
    if (value === "") {
      setScores((current) => ({
        ...current,
        [criterionId]: "",
      }));

      return;
    }

    const numericValue = Number(value);

    if (
      !Number.isFinite(numericValue) ||
      numericValue < 0
    ) {
      return;
    }

    const criterion = criteria.find(
      (item) => item.id === criterionId
    );

    if (numericValue > criterion.maxScore) {
      return;
    }

    setScores((current) => ({
      ...current,
      [criterionId]: numericValue,
    }));

    setHasDraft(true);
  };

  const updateComments = (value) => {
    setComments(value);
    setHasDraft(true);
  };

  const restoreDraft = () => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);

    if (!savedDraft) return;

    try {
      const parsed = JSON.parse(savedDraft);

      setScores({
        ...createInitialScores(),
        ...(parsed.scores || {}),
      });

      setComments(parsed.comments || "");
      setLastSaved(parsed.savedAt || null);
      setHasDraft(true);
    } catch (error) {
      console.error("Unable to restore draft:", error);
    }
  };

  const discardDraft = () => {
    localStorage.removeItem(STORAGE_KEY);

    setScores(createInitialScores());
    setComments("");
    setLastSaved(null);
    setHasDraft(false);
    setSaveState("idle");
  };

  const formatSavedTime = () => {
    if (!lastSaved) return "Not saved yet";

    const date = new Date(lastSaved);

    return `Last saved at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })}`;
  };

  return (
    <section className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Judge Evaluation
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Review the submission and evaluate each criterion.
            Your progress is automatically saved.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-950">
          {saveState === "saving" ? (
            <Clock3
              size={16}
              className="animate-pulse text-amber-500"
            />
          ) : (
            <CheckCircle2
              size={16}
              className="text-green-500"
            />
          )}

          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            {saveState === "saving"
              ? "Saving draft..."
              : formatSavedTime()}
          </span>
        </div>
      </div>

      {/* Submission information */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <FileText size={20} />
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Evaluating Submission
            </p>

            <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
              Team Phoenix
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Project: AI-Powered Event Assistant
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Evaluation Progress
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {completedCriteria} of {criteria.length} criteria
              completed
            </p>
          </div>

          <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            {progress}%
          </span>
        </div>

        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Criteria */}
      <div className="space-y-4">
        {criteria.map((criterion) => (
          <div
            key={criterion.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="flex flex-col justify-between gap-4 sm:flex-row">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {criterion.name}
                </h3>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {criterion.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max={criterion.maxScore}
                  value={scores[criterion.id]}
                  onChange={(e) =>
                    updateScore(
                      criterion.id,
                      e.target.value
                    )
                  }
                  placeholder="0"
                  className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-sm font-bold outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />

                <span className="text-xs font-semibold text-slate-500">
                  / {criterion.maxScore}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comments */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <label className="text-sm font-bold text-slate-900 dark:text-white">
          Evaluation Comments
        </label>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Add feedback that explains the assigned scores.
        </p>

        <textarea
          value={comments}
          onChange={(e) => updateComments(e.target.value)}
          rows={6}
          placeholder="Write your evaluation comments..."
          className="mt-4 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </div>

      {/* Score summary */}
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-900/40 dark:bg-indigo-900/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              Current Score
            </p>

            <p className="mt-1 text-2xl font-bold text-indigo-700 dark:text-indigo-300">
              {totalScore} / {maxScore}
            </p>
          </div>

          <Save
            size={24}
            className="text-indigo-500"
          />
        </div>
      </div>

      {/* Draft controls */}
      <div className="flex flex-col justify-between gap-3 border-t border-slate-200 pt-5 sm:flex-row dark:border-slate-800">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={restoreDraft}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RotateCcw size={15} />
            Restore Draft
          </button>

          <button
            type="button"
            onClick={discardDraft}
            className="rounded-xl border border-red-200 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-900/10"
          >
            Discard Draft
          </button>
        </div>

        <button
          type="button"
          onClick={() => saveDraft()}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700"
        >
          <Save size={15} />
          Save Draft
        </button>
      </div>
    </section>
  );
};

export default JudgeEvaluationDraft;