import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  History,
  Upload,
} from "lucide-react";
import { useState } from "react";

const INITIAL_SUBMISSIONS = [
  {
    id: 3,
    version: 3,
    submittedAt: "August 18, 2026 · 10:42 AM",
    fileName: "final-project-v3.zip",
    link: "#",
    status: "Latest",
    timing: "On Time",
    size: "12.4 MB",
  },
  {
    id: 2,
    version: 2,
    submittedAt: "August 16, 2026 · 6:20 PM",
    fileName: "project-v2.zip",
    link: "#",
    status: "Previous",
    timing: "On Time",
    size: "10.8 MB",
  },
  {
    id: 1,
    version: 1,
    submittedAt: "August 12, 2026 · 3:15 PM",
    fileName: "project-v1.zip",
    link: "#",
    status: "Previous",
    timing: "On Time",
    size: "8.6 MB",
  },
];

const EventParticipantSubmissionHistory = ({
  initialSubmissions = INITIAL_SUBMISSIONS,
  submissionDeadline = "August 20, 2026 · 11:59 PM",
}) => {
  const [submissions, setSubmissions] =
    useState(initialSubmissions);

  const [fileName, setFileName] = useState("");

  const latestSubmission = submissions[0];

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setFileName(file.name);
  };

  const handleNewSubmission = () => {
    if (!fileName) return;

    const nextVersion =
      submissions.length > 0
        ? submissions[0].version + 1
        : 1;

    const newSubmission = {
      id: Date.now(),
      version: nextVersion,
      submittedAt: new Date().toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      fileName,
      link: "#",
      status: "Latest",
      timing: "On Time",
      size: "Pending upload",
    };

    setSubmissions((current) => [
      newSubmission,
      ...current.map((submission) => ({
        ...submission,
        status: "Previous",
      })),
    ]);

    setFileName("");
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <History size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Submission Tracking
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Submission History
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              View the latest submission while keeping previous
              project versions available for review.
            </p>
          </div>
        </div>

        <div className="rounded-full bg-indigo-50 px-3 py-1.5 text-[6px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          {submissions.length} Version
          {submissions.length === 1 ? "" : "s"}
        </div>
      </div>

      {/* Latest Submission */}
      {latestSubmission && (
        <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5 dark:border-indigo-900/30 dark:bg-indigo-900/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 dark:bg-slate-900 dark:text-indigo-400">
                <CheckCircle2 size={18} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-indigo-600 px-2.5 py-1 text-[5px] font-bold text-white">
                    LATEST
                  </span>

                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-[5px] font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {latestSubmission.timing}
                  </span>
                </div>

                <h3 className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                  Version {latestSubmission.version}
                </h3>

                <p className="mt-1 text-[7px] text-slate-500 dark:text-slate-400">
                  {latestSubmission.fileName}
                </p>
              </div>
            </div>

            <a
              href={latestSubmission.link}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-[7px] font-bold text-white transition hover:bg-indigo-700"
            >
              Open Submission
              <ExternalLink size={11} />
            </a>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Detail
              label="Submitted"
              value={latestSubmission.submittedAt}
            />

            <Detail
              label="File Size"
              value={latestSubmission.size}
            />

            <Detail
              label="Submission Status"
              value="Accepted"
            />
          </div>
        </div>
      )}

      {/* Upload New Version */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Upload size={15} />
          </div>

          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Submit New Version
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Upload an updated project while preserving previous
              submissions.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <label className="flex flex-1 cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-center transition hover:border-indigo-400 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/10">
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />

            <div>
              <FileText
                size={18}
                className="mx-auto text-slate-400"
              />

              <p className="mt-2 text-[7px] font-bold text-slate-600 dark:text-slate-300">
                {fileName || "Choose project file"}
              </p>

              <p className="mt-1 text-[6px] text-slate-400">
                Previous versions will remain available
              </p>
            </div>
          </label>

          <button
            type="button"
            disabled={!fileName}
            onClick={handleNewSubmission}
            className="rounded-xl bg-indigo-600 px-5 py-3 text-[7px] font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Submit New Version
          </button>
        </div>
      </div>

      {/* Deadline */}
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
        <Clock3
          size={15}
          className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
        />

        <div>
          <h3 className="text-[8px] font-bold text-amber-800 dark:text-amber-300">
            Submission Deadline
          </h3>

          <p className="mt-1 text-[7px] text-amber-700 dark:text-amber-400">
            {submissionDeadline}
          </p>
        </div>
      </div>

      {/* History */}
      <div className="mt-6">
        <div className="mb-4">
          <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
            Previous Versions
          </h3>

          <p className="mt-1 text-[7px] text-slate-400">
            Earlier submissions are preserved for transparency and
            review.
          </p>
        </div>

        <div className="space-y-3">
          {submissions.map((submission) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const SubmissionCard = ({ submission }) => {
  const isLatest = submission.status === "Latest";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              isLatest
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            <FileText size={15} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-[9px] font-bold text-slate-800 dark:text-white">
                Version {submission.version}
              </h4>

              <span
                className={`rounded-full px-2.5 py-1 text-[5px] font-bold ${
                  isLatest
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {submission.status}
              </span>

              <span
                className={`rounded-full px-2.5 py-1 text-[5px] font-bold ${
                  submission.timing === "On Time"
                    ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                }`}
              >
                {submission.timing}
              </span>
            </div>

            <p className="mt-2 truncate text-[7px] font-semibold text-slate-600 dark:text-slate-300">
              {submission.fileName}
            </p>

            <div className="mt-2 flex flex-wrap gap-3 text-[6px] text-slate-400">
              <span>{submission.submittedAt}</span>
              <span>•</span>
              <span>{submission.size}</span>
            </div>
          </div>
        </div>

        <a
          href={submission.link}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-[7px] font-bold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400"
        >
          View
          <ExternalLink size={10} />
        </a>
      </div>
    </article>
  );
};

const Detail = ({ label, value }) => (
  <div className="rounded-xl bg-white/70 p-3 dark:bg-slate-900/60">
    <p className="text-[5px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1 text-[7px] font-bold text-slate-700 dark:text-slate-300">
      {value}
    </p>
  </div>
);

export default EventParticipantSubmissionHistory;