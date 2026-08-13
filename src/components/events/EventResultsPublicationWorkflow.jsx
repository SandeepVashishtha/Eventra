import { useMemo, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Eye,
  Lock,
  Trophy,
  ChevronRight,
} from "lucide-react";

const initialResults = [
  {
    rank: 1,
    team: "Team Phoenix",
    score: 94.5,
    technical: 96,
    innovation: 95,
    presentation: 92,
  },
  {
    rank: 2,
    team: "Code Warriors",
    score: 91.8,
    technical: 93,
    innovation: 90,
    presentation: 92,
  },
  {
    rank: 3,
    team: "Innovators",
    score: 89.6,
    technical: 88,
    innovation: 94,
    presentation: 87,
  },
];

const EventResultsPublicationWorkflow = () => {
  const [results] = useState(initialResults);

  const [step, setStep] = useState(1);

  const [checks, setChecks] = useState({
    scores: false,
    tieBreakers: false,
    rankings: false,
  });

  const [published, setPublished] = useState(false);

  const allChecksComplete = useMemo(
    () =>
      checks.scores &&
      checks.tieBreakers &&
      checks.rankings,
    [checks]
  );

  const toggleCheck = (key) => {
    setChecks((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const handleReview = () => {
    if (!allChecksComplete) return;
    setStep(3);
  };

  const handlePublish = () => {
    if (!allChecksComplete) return;

    setPublished(true);
    setStep(4);
  };

  return (
    <section className="w-full space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-100 p-2.5 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
            <Trophy size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Results Publication
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Review and approve competition results before publishing.
            </p>
          </div>
        </div>
      </div>

      {/* Workflow */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <WorkflowStep
            number="1"
            label="Evaluation Complete"
            active={step >= 1}
            completed={step >= 2}
          />

          <ChevronRight className="hidden text-slate-300 md:block" />

          <WorkflowStep
            number="2"
            label="Results Review"
            active={step >= 2}
            completed={step >= 3}
          />

          <ChevronRight className="hidden text-slate-300 md:block" />

          <WorkflowStep
            number="3"
            label="Organizer Approval"
            active={step >= 3}
            completed={step >= 4}
          />

          <ChevronRight className="hidden text-slate-300 md:block" />

          <WorkflowStep
            number="4"
            label="Results Published"
            active={step >= 4}
            completed={published}
          />
        </div>
      </div>

      {/* Published state */}
      {published && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900/40 dark:bg-green-900/10">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 text-green-600" />

            <div>
              <h2 className="font-bold text-green-800 dark:text-green-300">
                Results Published Successfully
              </h2>

              <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                The verified competition rankings are now available to participants.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results preview */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">
                Final Ranking Preview
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Verify the ranking before publication.
              </p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
              <Eye size={14} />
              Preview Only
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                <th className="px-5 py-3 text-xs font-bold text-slate-500">
                  Rank
                </th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500">
                  Team
                </th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500">
                  Technical
                </th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500">
                  Innovation
                </th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500">
                  Presentation
                </th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500">
                  Final Score
                </th>
              </tr>
            </thead>

            <tbody>
              {results.map((result) => (
                <tr
                  key={result.team}
                  className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                >
                  <td className="px-5 py-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-black text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                      {result.rank}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm font-bold text-slate-900 dark:text-white">
                    {result.team}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {result.technical}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {result.innovation}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {result.presentation}
                  </td>

                  <td className="px-5 py-4">
                    <span className="font-black text-indigo-600 dark:text-indigo-400">
                      {result.score}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification */}
      {!published && (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-indigo-500" size={20} />

              <h2 className="font-bold text-slate-900 dark:text-white">
                Score Verification
              </h2>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Confirm each item before approving the results.
            </p>

            <div className="mt-5 space-y-3">
              <VerificationItem
                checked={checks.scores}
                onChange={() => toggleCheck("scores")}
                title="Scores verified"
                description="All judge scores have been reviewed."
              />

              <VerificationItem
                checked={checks.tieBreakers}
                onChange={() => toggleCheck("tieBreakers")}
                title="Tie-breakers confirmed"
                description="Configured tie-breaking rules have been applied."
              />

              <VerificationItem
                checked={checks.rankings}
                onChange={() => toggleCheck("rankings")}
                title="Final rankings verified"
                description="The displayed ranking matches the calculated scores."
              />
            </div>
          </div>

          {/* Approval card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center gap-2">
              <Lock size={18} className="text-amber-500" />

              <h2 className="font-bold text-slate-900 dark:text-white">
                Organizer Approval
              </h2>
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Results cannot be published until all verification checks
              have been completed.
            </p>

            <div className="mt-5">
              {!allChecksComplete && (
                <div className="mb-4 flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-900/10 dark:text-amber-400">
                  <AlertTriangle size={15} className="shrink-0" />
                  Complete all verification checks first.
                </div>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  disabled={!allChecksComplete}
                  onClick={handleReview}
                  className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Approve Results
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePublish}
                  className="w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-700"
                >
                  Publish Results
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const WorkflowStep = ({
  number,
  label,
  active,
  completed,
}) => (
  <div className="flex items-center gap-3">
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-black ${
        completed
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : active
          ? "bg-indigo-600 text-white"
          : "bg-slate-100 text-slate-400 dark:bg-slate-800"
      }`}
    >
      {completed ? <CheckCircle2 size={17} /> : number}
    </div>

    <div>
      <p
        className={`text-xs font-bold ${
          active
            ? "text-slate-900 dark:text-white"
            : "text-slate-400"
        }`}
      >
        {label}
      </p>
    </div>
  </div>
);

const VerificationItem = ({
  checked,
  onChange,
  title,
  description,
}) => (
  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="mt-1 h-4 w-4 accent-indigo-600"
    />

    <div>
      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  </label>
);

export default EventResultsPublicationWorkflow;